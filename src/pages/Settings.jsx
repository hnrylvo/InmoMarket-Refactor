import React from "react";
import {
  User,
  Lock,
  Bell,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import PersonalInfo from "@/pages/Settings/PersonalInfo.jsx";
import LoginSecurity from "@/pages/Settings/LoginSecurity.jsx";
import { PageHeader } from "@/components/ui/page-header"
import UserReportsWithFeedback from "@/pages/Settings/UserReportsWithFeedback.jsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sidebarItems = [
  { id: "personal", label: "Perfil", icon: <User className="h-4 w-4" /> },
  { id: "security", label: "Login & Security", icon: <Lock className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "reports", label: "Mis Reportes", icon: <MessageSquare className="h-4 w-4" /> },
];

const Settings = () => {
  return (
    <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <PageHeader
            title="Configuraciones"
          />
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
          {sidebarItems.map((item) => (
            <TabsTrigger 
              key={item.id} 
              value={item.id}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="personal" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>
                  Visualiza y edita tu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalInfo />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Login & Security</CardTitle>
                <CardDescription>
                  Manage your login credentials and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginSecurity />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  This is the <strong>notifications</strong> settings section.
                  Content goes here.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Mis Reportes</CardTitle>
                <CardDescription>
                  Visualiza los reportes que has enviado y las respuestas de los administradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserReportsWithFeedback />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
