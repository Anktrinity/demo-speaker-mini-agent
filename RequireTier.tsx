import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentModal from '@/components/PaymentModal';
import { Crown, Lock, Zap, Sparkles } from 'lucide-react';

interface RequireTierProps {
  /** Required tier to access the feature */
  requiredTier: 'basic' | 'premium';
  /** Feature name for display */
  featureName: string;
  /** Optional feature description */
  featureDescription?: string;
  /** Children to render when access is granted */
  children: React.ReactNode;
  /** Optional fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Show inline upgrade prompt instead of blocking overlay */
  inline?: boolean;
}

const tierInfo = {
  basic: {
    name: 'Basic Plan',
    price: '$19.99/month',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  premium: {
    name: 'Premium Plan', 
    price: '$49.99/month',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
};

export default function RequireTier({
  requiredTier,
  featureName,
  featureDescription,
  children,
  fallback,
  inline = false,
}: RequireTierProps) {
  const { user, userTier, entitlements } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has access to this feature
  const hasAccess = (() => {
    if (!user) return false;
    
    const tierHierarchy = { free: 0, basic: 1, premium: 2, beta: 2 }; // Beta gets premium access
    const currentLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    const requiredLevel = tierHierarchy[requiredTier];
    
    return currentLevel >= requiredLevel;
  })();

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback component
  if (fallback) {
    return <>{fallback}</>;
  }

  const tier = tierInfo[requiredTier];
  const TierIcon = tier.icon;

  // Inline upgrade prompt
  if (inline) {
    return (
      <div className={`p-4 rounded-lg border ${tier.borderColor} ${tier.bgColor}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full bg-white dark:bg-gray-800 border ${tier.borderColor}`}>
            <TierIcon className={`w-4 h-4 ${tier.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {featureName} requires {tier.name}
            </h3>
            {featureDescription && (
              <p className="text-xs text-muted-foreground">{featureDescription}</p>
            )}
          </div>
          <Badge variant="secondary" className="ml-auto">
            {tier.price}
          </Badge>
        </div>
        <Button 
          onClick={() => setShowUpgradeModal(true)}
          size="sm"
          className="w-full"
          data-testid={`button-upgrade-${requiredTier}`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to {tier.name}
        </Button>
        
        <PaymentModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={userTier}
          onSuccess={() => {
            setShowUpgradeModal(false);
            // Cache will be invalidated automatically by billing success
          }}
        />
      </div>
    );
  }

  // Full overlay blocking access
  return (
    <>
      <Card className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-6 max-w-sm">
            <div className={`w-16 h-16 rounded-full ${tier.bgColor} border ${tier.borderColor} flex items-center justify-center mx-auto mb-4`}>
              <Lock className={`w-8 h-8 ${tier.color}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {featureName} is Premium
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {featureDescription || `Upgrade to ${tier.name} to unlock this feature`}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full"
                data-testid={`button-upgrade-${requiredTier}`}
              >
                <TierIcon className="w-4 h-4 mr-2" />
                Upgrade to {tier.name}
              </Button>
              <p className="text-xs text-muted-foreground">
                Starting at {tier.price}
              </p>
            </div>
          </div>
        </div>
        
        {/* Blurred preview of locked content */}
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      </Card>

      <PaymentModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={userTier}
        onSuccess={() => {
          setShowUpgradeModal(false);
          // Cache will be invalidated automatically by billing success
        }}
      />
    </>
  );
}