import { Home, Bell, Newspaper, Heart, Building2, MessageSquareWarning, CalendarCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Badge } from './ui/badge'
import { useVisitsStore } from '../stores/useVisitsStore'
import { useSidebar } from './ui/sidebar'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel,
} from "./ui/sidebar";

import { NavUser } from "./nav-user";

const items = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Explorar",
    url: "/publications",
    icon: Building2,
  },
  {
    title: "Notificaciones",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Wishlist",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Mis avisos",
    url: "/my-publications",
    icon: Newspaper,
  },
  {
    title: "Visitas",
    url: "/visits",
    icon: CalendarCog,
  }
];

export function AppSidebar({ props }) {
  const { role, token } = useAuthStore();
  const isLoggedIn = !!token;
  const newVisitRequests = useVisitsStore((state) => state.newVisitRequests)
  const newVisitResponses = useVisitsStore((state) => state.newVisitResponses)
  const totalVisitNotifications = (newVisitRequests || 0) + (newVisitResponses || 0)
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  // Filtrar items según autenticación
  const filteredItems = items.filter(item => {
    if (["Notificaciones", "Wishlist", "Mis avisos", "Visitas"].includes(item.title)) {
      return isLoggedIn;
    }
    return true;
  });

  const isRouteActive = (url) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <img
                    src="/images/inmomarket-logo-notext.png"
                    alt="Logo"
                    className="h-8 w-8"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">InmoMarket</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isRouteActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2 relative" onClick={handleMobileNavigation}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.title === 'Notificaciones' && isLoggedIn && totalVisitNotifications > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {totalVisitNotifications}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {role === 'ROLE_ADMIN' && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem key="Reportes">
                <SidebarMenuButton asChild isActive={isRouteActive('/reportes')}>
                  <Link to="/reportes" onClick={handleMobileNavigation}>
                    <MessageSquareWarning />
                    <span>Reportes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="py-4">
        {" "}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
