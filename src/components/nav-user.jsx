"use client";

import {
    BadgeCheck,
    Bell,
    Settings,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Moon,
    Sun,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const { name, email, token, profilePicture, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.signout(token);
            logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.message || "An error occurred during logout");
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    // Si no hay sesión, mostrar opciones de login
    if (!token) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">👤</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Invitado</span>
                                    <span className="truncate text-xs">Inicia sesión para más opciones</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">👤</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Invitado</span>
                                        <span className="truncate text-xs">Inicia sesión para más opciones</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                                >
                                    {theme === "light" ? (
                                        <>
                                            <Moon className="w-4 h-4" />
                                            <span>Dark Mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sun className="w-4 h-4" />
                                            <span>Light Mode</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                                    <DropdownMenuItem as="div">
                                        <BadgeCheck />
                                        Iniciar sesión
                                    </DropdownMenuItem>
                                </Link>
                                <Link to="/register" style={{ textDecoration: "none", color: "inherit" }}>
                                    <DropdownMenuItem as="div">
                                        <CreditCard />
                                        Registrarse
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Si hay sesión, mostrar el menú normal del usuario
    if (!name) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {profilePicture ? (
                                    <AvatarImage src={profilePicture} alt={name} className="rounded-lg" />
                                ) : (
                                    <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{name}</span>
                                <span className="truncate text-xs">{email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {profilePicture ? (
                                        <AvatarImage src={profilePicture} alt={name} className="rounded-lg" />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{name}</span>
                                    <span className="truncate text-xs">{email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            >
                                {theme === "light" ? (
                                    <>
                                        <Moon className="w-4 h-4" />
                                        <span>Dark Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-4 h-4" />
                                        <span>Light Mode</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link to="/settings" style={{ textDecoration: "none", color: "inherit" }}>
                                <DropdownMenuItem as="div">
                                    <Settings />
                                    Configuraciones
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
