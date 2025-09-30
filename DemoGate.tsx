import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, User, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/new_ai_task_manager_logo.png";
import { apiRequest } from "@/lib/queryClient";
import { analytics } from "@/lib/analytics";

// Demo signup form schema
const demoSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  marketingOptIn: z.boolean().default(false),
});

type DemoSignupForm = z.infer<typeof demoSignupSchema>;

interface DemoGateProps {
  onSuccess?: () => void;
}

export default function DemoGate({ onSuccess }: DemoGateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setDemoAuth } = useAuth();

  const form = useForm<DemoSignupForm>({
    resolver: zodResolver(demoSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      marketingOptIn: false,
    },
  });

  const handleDemoSignup = async (values: DemoSignupForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("🔄 Demo signup started with values:", values);
      const response = await apiRequest("POST", "/api/demo/signup", values);
      console.log("📡 Demo signup response status:", response.status, response.statusText);
      
      const data = await response.json();
      console.log("📄 Demo signup response data:", data);

      // Handle the JWT token response
      if (data.token && data.user) {
        console.log("✅ Valid token received, calling setDemoAuth...");
        console.log("🎫 Token preview:", data.token.substring(0, 20) + "...");
        
        // Check localStorage before setting
        console.log("📦 localStorage before setDemoAuth:", localStorage.getItem('demoToken'));
        
        setDemoAuth(data.token);
        
        // Check localStorage after setting
        console.log("📦 localStorage after setDemoAuth:", localStorage.getItem('demoToken'));
        
        setSuccess(true);
        
        // Track successful demo signup
        analytics.trackDemoSignup(values.email, values.name);
        analytics.trackFunnelStep('demo_signup', {
          email: values.email,
          name: values.name,
          marketing_opt_in: values.marketingOptIn
        });
        
        // Call success callback after short delay to show success state
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            // Auto-redirect to dashboard if no callback provided
            window.location.reload();
          }
        }, 1500);
      } else {
        console.error("❌ Invalid response structure:", data);
        setError("Signup completed but authentication failed. Please try again.");
      }
    } catch (err: any) {
      console.error("💥 Demo signup error:", err);
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome aboard!</h2>
            <p className="text-muted-foreground">
              Your demo account is ready. Redirecting to the dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoPath} 
              alt="AI Task Manager Logo" 
              className="h-12 w-12 mr-3"
            />
            <h1 className="text-3xl font-bold text-foreground">AI Task Manager</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your Slack-integrated, AI-powered task manager for event production teams
          </p>
        </div>

        {/* Demo Signup Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start Your Free Demo
            </CardTitle>
            <CardDescription>
              Get instant access to explore our task management platform. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleDemoSignup)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          data-testid="input-demo-name"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email address" 
                          {...field}
                          data-testid="input-demo-email"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingOptIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-marketing-optin"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Send me updates about new features and product news
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive" data-testid="text-error-message">
                      {error}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-start-demo"
                >
                  {isSubmitting ? "Setting up your demo..." : "Start Free Demo"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                  Beta testers get unlimited access to all features - help us improve the platform!
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">What you'll get in your demo:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Unlimited tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Full analytics & reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>AI task generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Slack integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Unlimited beta access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Team collaboration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}