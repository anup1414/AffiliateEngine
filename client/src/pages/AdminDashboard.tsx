import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StatsCard from "@/components/StatsCard";
import AdminUsersTable from "@/components/AdminUsersTable";
import AdminQRUpload from "@/components/AdminQRUpload";
import { Users, IndianRupee, UserCheck, Settings, LogOut, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  profilePicture: string;
  isApproved: boolean;
  joinDate: string;
  status: string;
  earnings: number;
  referrals: number;
}

interface AdminStats {
  totalUsers: number;
  activeMembers: number;
  platformEarnings: number;
}
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<"dashboard" | "users" | "payments">("dashboard");
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all users
  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", "POST", {});
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading || !user?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const menuItems = [
    { id: "dashboard", title: "Overview", icon: Settings },
    { id: "users", title: "All Users", icon: Users },
    { id: "payments", title: "Payment QR", icon: QrCode },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-6">
            <h1 className="text-xl font-bold">Narayane Sena</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id as any)}
                        isActive={activeView === item.id}
                        data-testid={`button-admin-nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@narayanesena.com</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <h2 className="text-lg font-semibold">
              {menuItems.find(item => item.id === activeView)?.title}
            </h2>
            <div className="w-9" />
          </header>

          <main className="flex-1 overflow-auto">
            {activeView === "dashboard" && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Total Users"
                    value={(stats?.totalUsers || 0).toString()}
                    icon={Users}
                  />
                  <StatsCard
                    title="Active Members"
                    value={(stats?.activeMembers || 0).toString()}
                    icon={UserCheck}
                  />
                  <StatsCard
                    title="Platform Earnings"
                    value={`₹${(stats?.platformEarnings || 0).toLocaleString()}`}
                    icon={IndianRupee}
                  />
                </div>
                <AdminUsersTable users={users} />
              </div>
            )}

            {activeView === "users" && (
              <div className="p-6">
                <AdminUsersTable users={users} />
              </div>
            )}

            {activeView === "payments" && (
              <div className="p-6">
                <AdminQRUpload />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
