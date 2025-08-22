import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Switch } from "./ui/switch";
import { useTheme } from "../hooks/use-theme";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BarChart3,
  Calendar,
  Bell,
  Upload,
  Settings,
  GraduationCap,
} from "lucide-react";
import { useSettingsStore } from "../stores/settings-store"; // --- FIX: Import the global settings store ---
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Focus Mode", href: "/focus", icon: Timer },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Import/Export", href: "/import-export", icon: Upload },
];

export function AppSidebar() {
  const [location] = useLocation();
  // --- FIX: Get theme and setter from the single source of truth (Zustand store) ---
  const { theme, setTheme } = useSettingsStore();
  
  // We still need the useTheme hook, but only to APPLY the theme to the DOM
  const { setTheme: applyTheme } = useTheme();

  // This effect ensures that if the theme is changed elsewhere (like settings), the UI updates.
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme); // Update the global, persistent state
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Study Tracker</h1>
            <p className="text-xs text-muted-foreground">Premium Productivity</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === '/settings'}>
              <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-muted-foreground">Dark Mode</span>
          <Switch
            // --- FIX: Read the checked state directly from the global store ---
            checked={theme === "dark"}
            // --- FIX: Use our new handler to update the global store ---
            onCheckedChange={handleThemeChange}
            aria-label="Toggle dark mode"
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
