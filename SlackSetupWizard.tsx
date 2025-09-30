import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ExternalLink, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SlackSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlackSetupWizard({ isOpen, onClose, onSuccess }: SlackSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [slackClientId, setSlackClientId] = useState('');
  const [slackClientSecret, setSlackClientSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const manifestUrl = `${window.location.origin}/api/slack/manifest`;

  const handleCopyManifest = async () => {
    try {
      await navigator.clipboard.writeText(manifestUrl);
      toast({
        title: "Copied!",
        description: "Manifest URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const handleCopyRedirect = async () => {
    const redirectUrl = `${window.location.origin}/api/slack/oauth/callback`;
    try {
      await navigator.clipboard.writeText(redirectUrl);
      toast({
        title: "Copied!",
        description: "Redirect URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const submitCredentials = useMutation({
    mutationFn: async (credentials: { slackClientId: string; slackClientSecret: string }) => {
      const response = await apiRequest("POST", "/api/slack/setup-credentials", credentials);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Slack Setup Complete!",
        description: "Your Slack app is now configured. You can connect your workspace.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStep(5);
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to save Slack credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/slack/test-connection", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection Test Successful!",
        description: "Your Slack app is properly configured and ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Please check your Slack app configuration.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!slackClientId.trim() || !slackClientSecret.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Client ID and Client Secret",
        variant: "destructive",
      });
      return;
    }

    submitCredentials.mutate({
      slackClientId: slackClientId.trim(),
      slackClientSecret: slackClientSecret.trim(),
    });
  };

  const handleTestConnection = () => {
    testConnection.mutate();
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to Slack Setup!</h3>
              <p className="text-muted-foreground">
                To connect your Slack workspace, you'll need to create your own Slack app. 
                This ensures secure, personalized integration just for your team.
              </p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Why do I need my own Slack app?</strong><br />
                Each beta tester gets their own secure Slack app to ensure data privacy and 
                eliminate conflicts between different workspaces.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button onClick={() => setStep(2)} size="lg" data-testid="button-start-setup">
                Let's Get Started
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Step 1: Create Your Slack App</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Go to Slack API</p>
                  <p className="text-sm text-muted-foreground">Open the Slack API website in a new tab</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    asChild
                    data-testid="button-open-slack-api"
                  >
                    <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open api.slack.com/apps
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Create New App</p>
                  <p className="text-sm text-muted-foreground">Click "Create New App" → "From an app manifest"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Select Your Workspace</p>
                  <p className="text-sm text-muted-foreground">Choose the workspace where you want to install the AI Task Manager</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="font-medium">Use App Manifest</p>
                  <p className="text-sm text-muted-foreground">Copy and paste our pre-configured manifest</p>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <code className="text-sm break-all">{manifestUrl}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopyManifest}
                        data-testid="button-copy-manifest"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} data-testid="button-next-step">
                I've Created the App
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Step 2: Configure OAuth Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Go to OAuth & Permissions</p>
                  <p className="text-sm text-muted-foreground">In your Slack app settings, find "OAuth & Permissions" in the sidebar</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Add Redirect URL</p>
                  <p className="text-sm text-muted-foreground">Scroll to "Redirect URLs" and add this URL:</p>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <code className="text-sm break-all">{window.location.origin}/api/slack/oauth/callback</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopyRedirect}
                        data-testid="button-copy-redirect"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Save Changes</p>
                  <p className="text-sm text-muted-foreground">Click "Save URLs" after adding the redirect URL</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} data-testid="button-next-oauth">
                OAuth is Configured
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Step 3: Get Your App Credentials</h3>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Go to "Basic Information" in your Slack app settings and find the "App Credentials" section.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={slackClientId}
                    onChange={(e) => setSlackClientId(e.target.value)}
                    placeholder="Enter your Slack app's Client ID"
                    data-testid="input-client-id"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is your app's public identifier (starts with numbers)
                  </p>
                </div>

                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={slackClientSecret}
                    onChange={(e) => setSlackClientSecret(e.target.value)}
                    placeholder="Enter your Slack app's Client Secret"
                    data-testid="input-client-secret"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is your app's private key (long alphanumeric string)
                  </p>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> Your credentials are encrypted and stored securely. 
                  Only you can access your Slack workspace through this app.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitCredentials.isPending || !slackClientId.trim() || !slackClientSecret.trim()}
                data-testid="button-save-credentials"
              >
                {submitCredentials.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Credentials'
                )}
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Setup Complete! 🎉</h3>
              <p className="text-muted-foreground">
                Your Slack app is now configured and ready to connect to your workspace.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Click "Connect to Slack" to link your workspace</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Use /tasks commands in your Slack channels</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Manage tasks directly from Slack</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
                data-testid="button-test-connection"
              >
                {testConnection.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button onClick={handleFinish} size="lg" data-testid="button-finish-setup">
                Finish Setup
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-slack-setup">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Slack Integration Setup</span>
            <div className="text-sm text-muted-foreground">
              Step {step} of 5
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}