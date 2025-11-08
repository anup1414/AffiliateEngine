import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface User {
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

interface AdminUsersTableProps {
  users: User[];
}

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/approve`, "PUT", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/reject`, "PUT", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User approval revoked",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card data-testid="card-admin-users">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle>All Members</CardTitle>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-xs"
            data-testid="input-search-users"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName || user.username}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isApproved ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.referrals}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {!user.isApproved ? (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApprove(user.id)}
                          data-testid={`button-approve-${user.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReject(user.id)}
                          data-testid={`button-reject-${user.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
