import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { LogOut, Sun, Moon, User } from "lucide-react";

interface HeaderProps {
  title: string;
  icon?: React.ComponentType<any>;
  iconColor?: string;
  showStatus?: boolean;
}

export function Header({ title, icon: Icon, iconColor, showStatus }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold flex items-center">
            {Icon && <Icon className={`${iconColor} mr-2`} size={28} />}
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          
          <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
            <User size={16} className="text-primary" />
            <span className="text-sm font-medium">{user?.name}</span>
            {showStatus && (
              <Badge variant="secondary" className="ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Available
              </Badge>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
