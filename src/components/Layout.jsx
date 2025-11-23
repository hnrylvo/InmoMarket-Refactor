import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SiteHeader } from "./site-header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))] h-screen flex flex-col">
      <SidebarProvider className="flex flex-col flex-1">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col gap-4 overflow-auto pt-4">
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
