import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChartLine } from "lucide-react";
import { useLocation } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthAction = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setLocation("/auth");
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <ChartLine className="h-8 w-8 text-blue-600 mr-3" />
              <span className="font-bold text-xl text-slate-900">S/4HANA Migration Assistant</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Documentation
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Support
            </Button>
            <div className="border-l border-slate-200 pl-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Welcome, {user.username}</span>
                  <Button 
                    onClick={handleAuthAction}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Dashboard
                  </Button>
                  {(user.role === 'manager' || user.role === 'admin') && (
                    <Button 
                      onClick={() => setLocation("/management")}
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Management
                    </Button>
                  )}
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    disabled={logoutMutation.isPending}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleAuthAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
