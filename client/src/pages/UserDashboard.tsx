import { useState } from "react";
import StatsCard from "@/components/StatsCard";
import ReferralLink from "@/components/ReferralLink";
import TransactionTable from "@/components/TransactionTable";
import UserProfile from "@/components/UserProfile";
import { IndianRupee, Users, TrendingUp, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import defaultAvatar from "@assets/generated_images/Default_user_avatar_5cf8f7b3.png";

export default function UserDashboard() {
  const [activeView, setActiveView] = useState<"dashboard" | "profile" | "earnings">("dashboard");

  // Mock data - todo: remove mock functionality
  const mockTransactions = [
    {
      id: "1",
      date: "2025-11-08",
      description: "Referral earning from user @john_doe",
      amount: 2000,
      type: "earning" as const,
    },
    {
      id: "2",
      date: "2025-11-07",
      description: "Referral earning from user @jane_smith",
      amount: 2000,
      type: "earning" as const,
    },
    {
      id: "3",
      date: "2025-11-05",
      description: "Referral earning from user @mike_wilson",
      amount: 2000,
      type: "earning" as const,
    },
  ];

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: TrendingUp },
    { id: "earnings", title: "Earnings", icon: IndianRupee },
    { id: "profile", title: "Profile", icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-6">
            <h1 className="text-xl font-bold">Affiliate Pro</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id as any)}
                        isActive={activeView === item.id}
                        data-testid={`button-nav-${item.id}`}
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
              <Avatar className="h-8 w-8">
                <AvatarImage src={defaultAvatar} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
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
                    title="Daily Earnings"
                    value="₹2,000"
                    icon={IndianRupee}
                    trend="+1 referral today"
                  />
                  <StatsCard
                    title="7-Day Earnings"
                    value="₹8,000"
                    icon={IndianRupee}
                    trend="+4 referrals this week"
                  />
                  <StatsCard
                    title="Lifetime Earnings"
                    value="₹24,000"
                    icon={IndianRupee}
                    trend="12 total referrals"
                  />
                </div>
                <ReferralLink link="https://example.com/ref/ABC123XYZ" />
              </div>
            )}

            {activeView === "earnings" && (
              <div className="p-6">
                <TransactionTable transactions={mockTransactions} />
              </div>
            )}

            {activeView === "profile" && (
              <UserProfile />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
