import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Crown, Zap, Check, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'basic' | 'premium';
  onSuccess?: () => void;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanDetails {
  name: string;
  price: number;
  billing: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: any;
  buttonText: string;
}

// Subscription plan definitions
const plans: Record<'basic' | 'premium', PlanDetails> = {
  basic: {
    name: "Basic Plan",
    price: 19.99,
    billing: "per month",
    description: "Perfect for small teams and basic project management",
    icon: Zap,
    buttonText: "Upgrade to Basic",
    features: [
      { name: "Up to 50 tasks", included: true },
      { name: "5 team members", included: true },
      { name: "Basic analytics", included: true },
      { name: "Slack integration", included: true },
      { name: "Email support", included: true },
      { name: "AI task generation", included: false },
      { name: "Advanced reporting", included: false },
      { name: "Custom workflows", included: false },
    ],
  },
  premium: {
    name: "Premium Plan",
    price: 49.99,
    billing: "per month",
    description: "Advanced features for growing teams and complex events",
    icon: Crown,
    buttonText: "Upgrade to Premium",
    popular: true,
    features: [
      { name: "Unlimited tasks", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Advanced analytics & reporting", included: true },
      { name: "AI task generation", included: true },
      { name: "Slack integration", included: true },
      { name: "Priority support", included: true },
      { name: "Custom workflows", included: true },
      { name: "API access", included: true },
    ],
  },
};

export default function PaymentModal({
  isOpen,
  onClose,
  currentTier = 'free',
  onSuccess,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(tier);
    try {
      // Get demo token if available
      const demoToken = localStorage.getItem('demoToken');
      const headers: Record<string, string> = {};
      if (demoToken) {
        headers['x-demo-token'] = demoToken;
      }

      const response = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          tier,
          successUrl: window.location.origin + "/dashboard?upgrade=success",
          cancelUrl: window.location.origin + "/dashboard?upgrade=cancelled",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const canUpgradeTo = (tier: 'basic' | 'premium'): boolean => {
    if (currentTier === 'free') return true;
    if (currentTier === 'basic' && tier === 'premium') return true;
    return false;
  };

  const renderPlan = (tier: 'basic' | 'premium') => {
    const plan = plans[tier];
    const Icon = plan.icon;
    const canUpgrade = canUpgradeTo(tier);
    const isCurrentTier = currentTier === tier;
    const isProcessing = isLoading === tier;

    return (
      <Card key={tier} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}
        
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Icon className={`w-8 h-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
          <div className="pt-4">
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">/{plan.billing}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${
                  feature.included ? 'text-green-600' : 'text-muted-foreground/40'
                }`} />
                <span className={`text-sm ${
                  feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                }`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
          
          <Button
            className="w-full"
            variant={plan.popular ? "default" : "outline"}
            disabled={!canUpgrade || isCurrentTier || isProcessing}
            onClick={() => handleUpgrade(tier)}
            data-testid={`button-upgrade-${tier}`}
          >
            {isProcessing ? (
              <>Redirecting...</>
            ) : isCurrentTier ? (
              <>Current Plan</>
            ) : !canUpgrade ? (
              <>Not Available</>
            ) : (
              <>
                {plan.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="subscription-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span>Upgrade Your Plan</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Choose the plan that best fits your team's needs
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {renderPlan('basic')}
          {renderPlan('premium')}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground text-center">
            <Check className="w-4 h-4 text-green-600" />
            <span>Cancel anytime • 30-day money-back guarantee • Secure payment with Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
