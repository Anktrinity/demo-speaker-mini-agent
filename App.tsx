import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import DemoGate from "@/components/DemoGate";
import Landing from "@/pages/Landing";
import SlackBotLanding from "@/pages/SlackBotLanding";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";
import TemplatePage from "@/pages/TemplatePage";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={() => <DemoGate />} />
          <Route path="/demo" component={() => <DemoGate />} />
          <Route path="/landing" component={Landing} />
          <Route path="/slack-bot" component={SlackBotLanding} />
          <Route path="/dashboard" component={() => <DemoGate />} />
          <Route path="/tasks" component={() => <DemoGate />} />
          <Route path="/analytics" component={() => <DemoGate />} />
          <Route path="/admin" component={() => <DemoGate />} />
          <Route path="/template/:id" component={() => <DemoGate />} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/slack-bot" component={SlackBotLanding} />
          <Route path="/landing" component={Landing} />
          <Route path="/demo" component={Dashboard} />
          <Route path="/admin" component={Admin} />
          <Route path="/template/:id" component={TemplatePage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
