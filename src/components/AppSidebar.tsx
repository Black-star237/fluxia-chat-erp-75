import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  UserCheck,
  TrendingUp, 
  Settings, 
  Building2,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Rapports", url: "/rapports", icon: TrendingUp },
  { title: "Equipe", url: "/equipe", icon: UserCheck },
  { title: "Promotions", url: "/promotions", icon: Package },
  { title: "Catégories", url: "/categories", icon: FileText },
];

const systemItems = [
  { title: "Assistant IA", url: "/assistant", icon: MessageSquare },
  { title: "Entreprises", url: "/entreprises", icon: Building2 },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { company } = useCurrentCompany();
  const { buildUrl } = useCompanyNavigation();

  const isActive = (path: string) => currentPath === path;
  const isExpanded = mainItems.some((i) => isActive(i.url)) || systemItems.some((i) => isActive(i.url));

  const getNavClass = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-primary text-primary-foreground font-medium shadow-sm rounded-lg" 
      : "hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors";

  return (
    <Sidebar className={`${state === "collapsed" ? "w-14" : "w-64"} bg-background border-border`}>
      <SidebarHeader 
        className="p-4 border-b border-border relative overflow-hidden"
        style={{
          backgroundImage: company?.banner_url ? `url(${company.banner_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {company?.banner_url && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        )}
        {state !== "collapsed" && (
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md overflow-hidden">
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">F</span>
              )}
            </div>
            <span className="font-semibold text-lg text-foreground">
              {company?.name || "Fluxiabiz"}
            </span>
          </div>
        )}
        {state === "collapsed" && (
          <div className="flex justify-center relative z-10">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md overflow-hidden">
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">F</span>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2`}>
            Modules principaux
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={buildUrl(item.url)} 
                      end 
                      className={getNavClass(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2`}>
            Système
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={buildUrl(item.url)} 
                      end 
                      className={getNavClass(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}