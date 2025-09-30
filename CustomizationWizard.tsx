import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Download, Settings } from "lucide-react";

interface CustomizationConfig {
  companyName: string;
  industry: string;
  useCase: string;
  teamSize: string;
  deploymentPlatform: string;
}

interface CustomizationWizardProps {
  templateName: string;
  onComplete: (config: CustomizationConfig) => void;
  onCancel: () => void;
}

export default function CustomizationWizard({ templateName, onComplete, onCancel }: CustomizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<CustomizationConfig>({
    companyName: "",
    industry: "events",
    useCase: "",
    teamSize: "1-5",
    deploymentPlatform: "replit",
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(config);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = (field: keyof CustomizationConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.companyName.trim() !== "" && config.industry !== "";
      case 2:
        return config.useCase.trim() !== "";
      case 3:
        return config.teamSize !== "" && config.deploymentPlatform !== "";
      default:
        return true;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto" data-testid="customization-wizard">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Customize Your Template</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Personalize {templateName} for your specific needs
        </p>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`wizard-step flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                step === currentStep
                  ? 'gradient-bg text-white'
                  : step < currentStep
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              data-testid={`wizard-step-${step}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {step}
              </div>
              <span className="font-medium hidden sm:inline">
                {step === 1 && "Basic Info"}
                {step === 2 && "Configuration"}
                {step === 3 && "Deployment"}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="wizard-step-1-content">
              <div>
                <Label htmlFor="companyName" className="block text-sm font-medium mb-2">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Name"
                  value={config.companyName}
                  onChange={(e) => updateConfig('companyName', e.target.value)}
                  data-testid="input-company-name"
                />
              </div>
              
              <div>
                <Label htmlFor="industry" className="block text-sm font-medium mb-2">
                  Industry Focus *
                </Label>
                <Select value={config.industry} onValueChange={(value) => updateConfig('industry', value)}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="events">Event Management</SelectItem>
                    <SelectItem value="marketing">Marketing Automation</SelectItem>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="development">Development Tools</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6" data-testid="wizard-step-2-content">
              <div>
                <Label htmlFor="useCase" className="block text-sm font-medium mb-2">
                  Primary Use Case *
                </Label>
                <Textarea
                  id="useCase"
                  placeholder="Describe how you'll use this assistant..."
                  rows={4}
                  value={config.useCase}
                  onChange={(e) => updateConfig('useCase', e.target.value)}
                  data-testid="textarea-use-case"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Be specific about your goals and requirements for better customization.
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid md:grid-cols-2 gap-6" data-testid="wizard-step-3-content">
              <div>
                <Label htmlFor="teamSize" className="block text-sm font-medium mb-2">
                  Team Size
                </Label>
                <Select value={config.teamSize} onValueChange={(value) => updateConfig('teamSize', value)}>
                  <SelectTrigger data-testid="select-team-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 people</SelectItem>
                    <SelectItem value="6-20">6-20 people</SelectItem>
                    <SelectItem value="21-50">21-50 people</SelectItem>
                    <SelectItem value="50+">50+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="deploymentPlatform" className="block text-sm font-medium mb-2">
                  Deployment Platform
                </Label>
                <Select value={config.deploymentPlatform} onValueChange={(value) => updateConfig('deploymentPlatform', value)}>
                  <SelectTrigger data-testid="select-deployment-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="replit">Replit</SelectItem>
                    <SelectItem value="heroku">Heroku</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="local">Local/Self-hosted</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-muted/20 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Configuration Summary:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Company:</strong> {config.companyName}</p>
                <p><strong>Industry:</strong> {config.industry}</p>
                <p><strong>Team Size:</strong> {config.teamSize}</p>
                <p><strong>Platform:</strong> {config.deploymentPlatform}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            data-testid="button-wizard-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            data-testid="button-wizard-next"
          >
            {currentStep === totalSteps ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Template
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
