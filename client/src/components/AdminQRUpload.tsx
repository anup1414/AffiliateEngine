import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentQRCode {
  id: string;
  name: string;
  qrCodeImage: string;
  upiId: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminQRUpload() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrName, setQrName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all QR codes
  const { data: qrCodes = [] } = useQuery<PaymentQRCode[]>({
    queryKey: ["/api/admin/payment-qr-codes"],
  });

  // Create QR code mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Please select a file");
      }
      if (!qrName.trim()) {
        throw new Error("Please enter a name");
      }

      const formData = new FormData();
      formData.append("qrCode", selectedFile);
      formData.append("name", qrName);
      if (upiId) {
        formData.append("upiId", upiId);
      }

      const response = await fetch("/api/admin/payment-qr-codes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create QR code");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-qr-codes"] });
      toast({
        title: "Success",
        description: "Payment QR code added successfully",
      });
      setIsDialogOpen(false);
      setQrName("");
      setUpiId("");
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create QR code",
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/payment-qr-codes/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-qr-codes"] });
      toast({
        title: "Success",
        description: "QR code status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update QR code status",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/payment-qr-codes/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-qr-codes"] });
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card data-testid="card-qr-management">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Payment QR Codes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage payment QR codes for user transactions
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-qr">
                  <Plus className="h-4 w-4 mr-2" />
                  Add QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment QR Code</DialogTitle>
                  <DialogDescription>
                    Upload a new QR code for user payments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-name">Name</Label>
                    <Input
                      id="qr-name"
                      placeholder="e.g., PhonePe, GPay, Paytm"
                      value={qrName}
                      onChange={(e) => setQrName(e.target.value)}
                      data-testid="input-qr-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">UPI ID (Optional)</Label>
                    <Input
                      id="upi-id"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      data-testid="input-upi-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>QR Code Image</Label>
                    {previewUrl && (
                      <div className="flex justify-center p-4 border rounded-md">
                        <img src={previewUrl} alt="QR Preview" className="w-48 h-48 object-contain" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      data-testid="button-select-file"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? selectedFile.name : "Select Image"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !selectedFile || !qrName}
                    data-testid="button-create-qr"
                  >
                    {createMutation.isPending ? "Creating..." : "Create QR Code"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {qrCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No QR codes added yet</p>
              <p className="text-sm">Click "Add QR Code" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>UPI ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id} data-testid={`row-qr-${qr.id}`}>
                    <TableCell>
                      <img 
                        src={qr.qrCodeImage} 
                        alt={qr.name}
                        className="w-16 h-16 object-contain border rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{qr.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {qr.upiId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={qr.isActive}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: qr.id, isActive: checked })
                          }
                          data-testid={`switch-active-${qr.id}`}
                        />
                        <Badge variant={qr.isActive ? "default" : "secondary"}>
                          {qr.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(qr.id)}
                        data-testid={`button-delete-qr-${qr.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
