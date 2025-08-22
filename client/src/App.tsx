import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Focus from "@/pages/focus";
import Analytics from "@/pages/analytics";
import Calendar from "@/pages/calendar";
import Notifications from "@/pages/notifications";
import ImportExport from "@/pages/import-export";
import Settings from "@/pages/settings";
import { AppSidebar } from "@/components/app-sidebar";
import { useFocusStore } from "@/stores/focus-store";
import { PiPCircularTimer } from "@/components/PiPCircularTimer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/focus" component={Focus} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/import-export" component={ImportExport} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const timer = setInterval(() => {
      const { isActive, tick } = useFocusStore.getState();
      if (isActive) {
        tick();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <TooltipProvider>
            <div className="flex h-screen bg-background">
              <AppSidebar />
              <main className="flex-1 flex flex-col overflow-y-auto">
                <Router />
              </main>
              {/* --- FIX: Add the PiP component here to make it globally available --- */}
              <PiPCircularTimer />
            </div>
            <Toaster />
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
