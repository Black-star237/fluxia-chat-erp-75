
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Plus
} from "lucide-react";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";

const navItems = [
  { title: "Accueil", url: "/", icon: LayoutDashboard },
  { title: "Stocks", url: "/stocks", icon: Package },
  { title: "Factures", url: "/facturation", icon: FileText },
  { title: "Clients", url: "/clients", icon: Users },
];

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { buildUrl } = useCompanyNavigation();

  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 z-50 px-2">
      <div className="flex items-center justify-between py-1">
        {navItems.slice(0, 2).map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.url);
          
          return (
            <NavLink
              key={item.title}
              to={buildUrl(item.url)}
              className="flex items-center justify-center p-2 transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                active 
                  ? 'bg-white' 
                  : 'bg-transparent'
              }`}>
                <IconComponent className={`h-4 w-4 transition-colors duration-200 ${
                  active ? 'text-black' : 'text-white'
                }`} />
              </div>
            </NavLink>
          );
        })}
        
        {/* Bouton nouvelle vente au centre */}
        <NavLink
          to={buildUrl("/vente")}
          className="flex items-center justify-center p-2 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <Plus className="h-5 w-5 text-black" />
          </div>
        </NavLink>
        
        {navItems.slice(2).map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.url);
          
          return (
            <NavLink
              key={item.title}
              to={buildUrl(item.url)}
              className="flex items-center justify-center p-2 transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                active 
                  ? 'bg-white' 
                  : 'bg-transparent'
              }`}>
                <IconComponent className={`h-4 w-4 transition-colors duration-200 ${
                  active ? 'text-black' : 'text-white'
                }`} />
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
