
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { Menu, Search, Bell, Moon, Sun } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistantPage = location.pathname === '/assistant';

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add("dark");
      body.style.cssText = `
        background-image: url('/fond.jpg') !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
      `;
    } else {
      body.classList.remove("dark");
      body.style.cssText = `
        background-image: url('/fondb.jpg') !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
      `;
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isAssistantPage) {
    return (
      <div className="min-h-screen w-full bg-background">
        <main className="h-screen overflow-hidden">
          {children}
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-4 z-40 h-16 mx-4 mt-4 bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl flex items-center px-3 sm:px-4 gap-3 sm:gap-4 shrink-0">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block">Fluxiabiz</h1>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {/* Notifications */}
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* User Avatar */}
              <button 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <span className="text-primary-foreground text-sm font-medium">A</span>
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto pb-24 md:pb-4 min-w-0">
            {children}
          </main>
        </div>
      </div>
      
      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
      
      {/* Floating Chat Button */}
      <FloatingChatButton />
      
      <Toaster />
    </SidebarProvider>
  );
}
