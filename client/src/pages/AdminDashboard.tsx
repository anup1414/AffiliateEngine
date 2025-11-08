import { useState } from "react";
import StatsCard from "@/components/StatsCard";
import AdminUsersTable from "@/components/AdminUsersTable";
import AdminQRUpload from "@/components/AdminQRUpload";
import { Users, IndianRupee, UserCheck, Settings, LogOut, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  // Mock data - todo: remove mock functionality
  const mockUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      joinDate: "2025-11-01",
      status: "active" as const,
      earnings: 24000,
      referrals: 12,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      joinDate: "2025-11-05",
      status: "active" as const,
      earnings: 8000,
      referrals: 4,
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@example.com",
      joinDate: "2025-11-07",
      status: "pending" as const,
      earnings: 0,
      referrals: 0,
    },
    {
      id: "4",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      joinDate: "2025-11-06",
      status: "active" as const,
      earnings: 6000,
      referrals: 3,
    },
  ];

  const menuItems = [
    { id: "dashboard", title: "Overview", icon: Settings },
    { id: "users", title: "All Users", icon: Users },
    { id: "payments", title: "Payment QR", icon: QrCode },
  ];

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === "active").length;
  const totalEarnings = mockUsers.reduce((sum, u) => sum + u.earnings, 0);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
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
                <p className="text-xs text-muted-foreground truncate">admin@platform.com</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-admin-logout">
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
                    value={totalUsers.toString()}
                    icon={Users}
                  />
                  <StatsCard
                    title="Active Members"
                    value={activeUsers.toString()}
                    icon={UserCheck}
                  />
                  <StatsCard
                    title="Platform Earnings"
                    value={`₹${totalEarnings.toLocaleString()}`}
                    icon={IndianRupee}
                  />
                </div>
                <AdminUsersTable users={mockUsers} />
              </div>
            )}

            {activeView === "users" && (
              <div className="p-6">
                <AdminUsersTable users={mockUsers} />
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
