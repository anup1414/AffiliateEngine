import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/components/LoginPage";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import MembershipPurchase from "@/components/MembershipPurchase";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/user/dashboard" component={UserDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/membership/purchase" component={MembershipPurchase} />
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
