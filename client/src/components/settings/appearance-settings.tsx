import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useSettingsStore, type FocusColor } from "../../stores/settings-store";
import { cn } from "../../lib/utils";
import { Palette } from "lucide-react";
import { useTheme } from "../../hooks/use-theme"; // Import the useTheme hook

const focusColors: { name: FocusColor; className: string }[] = [
  { name: 'blue', className: 'bg-blue-500' },
  { name: 'green', className: 'bg-green-500' },
  { name: 'orange', className: 'bg-orange-500' },
  { name: 'red', className: 'bg-red-500' },
];

export default function AppearanceSettings() {
  // Get the persistent state and setter from Zustand
  const { theme, focusTimerColor, setTheme, setFocusTimerColor } = useSettingsStore();
  
  // Get the function to apply the theme to the DOM
  const { setTheme: applyTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);   // 1. Update the persistent state
    applyTheme(newTheme); // 2. Apply the change to the UI
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize the look and feel of the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes.
            </p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={handleThemeChange} // Use the new handler
          />
        </div>
        <div className="space-y-3">
          <Label className="text-base font-medium">Focus Timer Color</Label>
          <div className="flex items-center space-x-3">
            {focusColors.map(({ name, className }) => (
              <button
                key={name}
                onClick={() => setFocusTimerColor(name)}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  className,
                  focusTimerColor === name && "ring-2 ring-offset-2 ring-primary ring-offset-background"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
