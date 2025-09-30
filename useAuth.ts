import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Demo token management
const getDemoToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('demoToken');
    console.log("🔍 getDemoToken called - token found:", !!token);
    if (token) {
      console.log("🎫 Token length:", token.length, "Preview:", token.substring(0, 20) + "...");
    } else {
      console.log("❌ No token in localStorage, keys:", Object.keys(localStorage));
    }
    return token;
  }
  console.log("🚫 Server-side rendering - no localStorage");
  return null;
};

const setDemoToken = (token: string) => {
  if (typeof window !== 'undefined') {
    console.log("💾 setDemoToken called with token length:", token.length);
    console.log("💾 Token preview:", token.substring(0, 20) + "...");
    console.log("💾 localStorage before set:", localStorage.getItem('demoToken'));
    
    try {
      localStorage.setItem('demoToken', token);
      console.log("✅ localStorage.setItem completed");
      
      // Verify it was actually stored
      const verified = localStorage.getItem('demoToken');
      console.log("🔍 Verification - token stored:", !!verified);
      console.log("🔍 Verification - token matches:", verified === token);
      console.log("🔍 localStorage keys after set:", Object.keys(localStorage));
      
    } catch (error) {
      console.error("💥 Error storing token:", error);
    }
  } else {
    console.log("🚫 Server-side - cannot store token");
  }
};

const removeDemoToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demoToken');
  }
};

// Custom query function that includes demo token
const getQueryFnWithDemoToken = (options = {}) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const token = getDemoToken();
    console.log("🔍 API Request:", queryKey[0]);
    console.log("🎫 Token available:", !!token);
    console.log("🎫 Token preview:", token ? token.substring(0, 20) + "..." : "none");
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['x-demo-token'] = token;
      console.log("📦 Headers with token:", Object.keys(headers));
    } else {
      console.log("⚠️ No token - making unauthenticated request");
    }
    
    const response = await fetch(queryKey[0], { headers });
    console.log("📡 Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 401) {
        const on401 = (options as any)?.on401;
        if (on401 === "returnNull") {
          // Don't remove token on 401 when using returnNull mode
          // This allows queries to gracefully handle missing auth
          return null;
        }
        // Only remove token if it's actually invalid (expired/malformed)
        // Not just because an endpoint requires authentication
        if (token) {
          // TODO: Add proper JWT validation here if needed
          // For now, keep token - let user explicitly logout
        }
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  };
};

export function useAuth() {
  const [hasDemoToken, setHasDemoToken] = useState(!!getDemoToken());
  
  // Query user data with demo token support
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFnWithDemoToken({ on401: "returnNull" }),
    retry: false,
  });

  // Query billing status for tier awareness
  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getQueryFnWithDemoToken({ on401: "returnNull" }),
    retry: false,
    enabled: !!user,
  });

  // Set demo token and update auth state
  const setDemoAuth = (token: string) => {
    setDemoToken(token);
    setHasDemoToken(true);
    // Don't immediately refetch - let the component handle navigation
    // The useEffect will trigger refetch when hasDemoToken changes
  };
  
  // Clear demo authentication
  const clearDemoAuth = () => {
    removeDemoToken();
    setHasDemoToken(false);
    refetch(); // Refetch to clear user data
  };

  // Update hasDemoToken state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setHasDemoToken(!!getDemoToken());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Determine user tier from billing status or user data
  const userTier = billingStatus?.currentTier || user?.tier || 'free';
  const subscription = billingStatus?.subscription;
  const entitlements = billingStatus?.entitlements;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode: user?.authType === 'demo',
    isReplitMode: user?.authType === 'replit',
    hasDemoToken,
    userTier,
    subscription,
    entitlements,
    setDemoAuth,
    clearDemoAuth,
  };
}
