// Google Analytics & Tag Manager tracking utility
// Handles graceful fallback when GTM container ID is not configured

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics events for funnel tracking
export interface AnalyticsEvent {
  event: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  user_id?: string;
  user_type?: 'demo' | 'authenticated';
  page_path?: string;
  [key: string]: any;
}

class Analytics {
  private isEnabled: boolean = false;
  private gtmContainerId: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check if GTM container ID is configured
    this.gtmContainerId = import.meta.env.VITE_GTM_CONTAINER_ID;
    
    if (this.gtmContainerId && this.gtmContainerId !== '%VITE_GTM_CONTAINER_ID%') {
      this.isEnabled = true;
      this.initializeDataLayer();
      console.log('📊 Analytics initialized with GTM container:', this.gtmContainerId);
    } else {
      this.isEnabled = false;
      console.log('📊 Analytics: GTM container ID not configured, using fallback tracking');
    }
  }

  private initializeDataLayer() {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function() {
        window.dataLayer.push(arguments);
      };
    }
  }

  // Track page views (PII-free for GA compliance)
  trackPageView(path: string, title?: string) {
    const pageTitle = title || document.title;
    const event: AnalyticsEvent = {
      event: 'page_view',
      page_path: path,
      // page_title removed for GA compliance - could contain sensitive info
      timestamp: new Date().toISOString()
    };

    // Send PII-free event to GA, but include page_title in CRM fallback
    this.sendEvent(event, { page_title: pageTitle });
  }

  // Track demo signup events (PII-free for GA compliance)
  trackDemoSignup(email: string, name: string) {
    const event: AnalyticsEvent = {
      event: 'demo_signup',
      event_category: 'engagement',
      event_label: 'demo_registration',
      user_type: 'demo',
      // PII removed for GA compliance - kept only in CRM fallback
      signup_source: 'demo_form',
      value: 1
    };

    // Send PII-free event to GA, but include PII in CRM fallback
    this.sendEvent(event, { email, name });
  }

  // Track dashboard visits (PII-free for GA compliance)
  trackDashboardVisit(userType: 'demo' | 'authenticated', userId?: string) {
    const event: AnalyticsEvent = {
      event: 'dashboard_visit',
      event_category: 'engagement',
      event_label: 'dashboard_access',
      user_type: userType,
      // user_id removed for GA compliance - kept only in CRM fallback
      value: 1
    };

    // Send PII-free event to GA, but include user ID in CRM fallback
    this.sendEvent(event, { user_id: userId });
  }

  // Track task creation (PII-free for GA compliance)
  trackTaskCreated(taskTitle: string, userType: 'demo' | 'authenticated') {
    const event: AnalyticsEvent = {
      event: 'task_created',
      event_category: 'engagement',
      event_label: 'task_management',
      user_type: userType,
      // task_title could contain PII - using generic label for GA
      task_category: 'user_generated',
      value: 1
    };

    // Send PII-free event to GA, but include task title in CRM fallback
    this.sendEvent(event, { task_title: taskTitle });
  }

  // Track Slack integration
  trackSlackConnection(userType: 'demo' | 'authenticated') {
    const event: AnalyticsEvent = {
      event: 'slack_connected',
      event_category: 'integration',
      event_label: 'slack_bot',
      user_type: userType,
      value: 1
    };

    this.sendEvent(event);
  }

  // Track conversion funnel steps (PII-free for GA compliance)
  trackFunnelStep(step: 'homepage_visit' | 'demo_signup' | 'dashboard_visit' | 'task_created' | 'slack_connected', data?: any) {
    // Use allowlist approach - only safe fields allowed to GA
    const safeFields = ['user_type', 'funnel_step', 'source', 'medium', 'campaign', 'value'];
    const safeData: Record<string, any> = {};
    
    if (data) {
      safeFields.forEach(field => {
        if (data[field] !== undefined) {
          safeData[field] = data[field];
        }
      });
    }
    
    const event: AnalyticsEvent = {
      event: 'funnel_step',
      event_category: 'conversion',
      event_label: step,
      funnel_step: step,
      ...safeData // Only allowlisted non-PII data goes to GA
    };

    // Send PII-free event to GA, but include ALL data in CRM fallback
    this.sendEvent(event, data);
  }

  // Track button clicks and user interactions
  trackInteraction(action: string, element: string, value?: number) {
    const event: AnalyticsEvent = {
      event: 'user_interaction',
      event_category: 'engagement',
      event_label: action,
      element_name: element,
      value: value || 1
    };

    this.sendEvent(event);
  }

  // Track errors for debugging
  trackError(error: string, location: string) {
    const event: AnalyticsEvent = {
      event: 'error',
      event_category: 'error',
      event_label: location,
      error_message: error,
      page_path: window.location.pathname
    };

    this.sendEvent(event);
  }

  // Send custom events
  trackCustomEvent(eventName: string, parameters: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event: eventName,
      ...parameters
    };

    this.sendEvent(event);
  }

  // Core event sending logic
  private sendEvent(event: AnalyticsEvent, piiData?: Record<string, any>) {
    try {
      if (this.isEnabled && typeof window !== 'undefined' && window.gtag) {
        // Send PII-free event to Google Analytics via GTM
        window.gtag('event', event.event, {
          event_category: event.event_category,
          event_label: event.event_label,
          value: event.value,
          custom_parameters: event
        });
        
        console.log('📊 Analytics event sent to GA:', event.event, event);
      } else {
        // Fallback: log to console for development
        console.log('📊 Analytics fallback:', event.event, event);
      }
      
      // ALWAYS send to our internal CRM system (with PII) regardless of GTM status
      this.sendToCRM(event, piiData);
    } catch (error) {
      console.error('📊 Analytics error:', error);
    }
  }

  // Fallback: send analytics to our internal CRM system (can include PII)
  private async sendToCRM(event: AnalyticsEvent, piiData?: Record<string, any>) {
    try {
      // Map analytics events to CRM activity types
      const activityTypeMap: Record<string, string> = {
        'demo_signup': 'signup_completed',
        'dashboard_visit': 'dashboard_visited',
        'task_created': 'task_created',
        'slack_connected': 'slack_connected',
        'page_view': 'page_visited'
      };

      const activityType = activityTypeMap[event.event];
      if (activityType) {
        // Try to get demo token for authenticated tracking
        const demoToken = localStorage.getItem('demoToken');
        
        if (demoToken) {
          await fetch('/api/crm/user-activity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-demo-token': demoToken
            },
            body: JSON.stringify({
              activityType,
              activityData: { ...event, ...piiData }, // Include PII in CRM
              page: window.location.pathname,
              sessionId: this.getSessionId()
            })
          });
        }
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('📊 CRM fallback failed:', error);
    }
  }

  // Generate or retrieve session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Check if analytics is properly configured
  get isConfigured(): boolean {
    return this.isEnabled;
  }

  // Get current configuration status
  getStatus() {
    return {
      enabled: this.isEnabled,
      gtmContainerId: this.gtmContainerId,
      hasDataLayer: typeof window !== 'undefined' && !!window.dataLayer
    };
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export convenience methods
export const {
  trackPageView,
  trackDemoSignup,
  trackDashboardVisit,
  trackTaskCreated,
  trackSlackConnection,
  trackFunnelStep,
  trackInteraction,
  trackError,
  trackCustomEvent
} = analytics;

export default analytics;