import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download } from "lucide-react";
import PaymentModal from "./PaymentModal";
import type { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template & { category?: { name: string; slug: string } };
  onPurchaseSuccess?: () => void;
}

export default function TemplateCard({ template, onPurchaseSuccess }: TemplateCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium'>('basic');

  const handlePurchase = (tier: 'basic' | 'premium') => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onPurchaseSuccess?.();
  };

  const basicPrice = Number(template.basicPrice);
  const premiumPrice = Number(template.premiumPrice);
  const currentPrice = selectedTier === 'basic' ? basicPrice : premiumPrice;

  return (
    <>
      <Card className="template-card bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid={`card-template-${template.id}`}>
        <div className="relative">
          <img
            src={template.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
            alt={template.name}
            className="w-full h-48 object-cover"
          />
          {template.category && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-primary/10 text-primary"
              data-testid={`badge-category-${template.category.slug}`}
            >
              {template.category.name}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-accent">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span className="text-sm font-medium" data-testid={`text-rating-${template.id}`}>
                {Number(template.rating).toFixed(1)}
              </span>
            </div>
            {(template.downloadCount ?? 0) > 0 && (
              <div className="flex items-center text-muted-foreground text-sm">
                <Download className="w-4 h-4 mr-1" />
                <span data-testid={`text-downloads-${template.id}`}>{template.downloadCount}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2" data-testid={`text-template-name-${template.id}`}>
            {template.name}
          </h3>
          
          <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-template-description-${template.id}`}>
            {template.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {premiumPrice > basicPrice && (
                  <span className="text-muted-foreground line-through text-base mr-2" data-testid={`text-premium-price-${template.id}`}>
                    ${premiumPrice.toFixed(0)}
                  </span>
                )}
                <span data-testid={`text-basic-price-${template.id}`}>${basicPrice.toFixed(0)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Premium: ${premiumPrice.toFixed(0)}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePurchase('basic')}
                data-testid={`button-buy-basic-${template.id}`}
              >
                Basic
              </Button>
              <Button
                size="sm"
                onClick={() => handlePurchase('premium')}
                data-testid={`button-buy-premium-${template.id}`}
              >
                Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentTier="free"
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
