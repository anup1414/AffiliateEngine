import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import qrPlaceholder from "@assets/generated_images/Placeholder_QR_code_489e0649.png";

export default function AdminQRUpload() {
  const { toast } = useToast();

  // Fetch current QR code
  const { data: qrData } = useQuery({
    queryKey: ["/api/admin/qr-code"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("qrCode", file);
      
      const response = await fetch("/api/admin/qr-code", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload QR code");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qr-code"] });
      toast({
        title: "QR Code Updated",
        description: "Payment QR code has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload QR code",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const qrImage = qrData?.qrCodePath || qrPlaceholder;

  return (
    <Card data-testid="card-qr-upload">
      <CardHeader>
        <CardTitle>Payment QR Code</CardTitle>
        <CardDescription>
          Upload the QR code that users will scan to make membership payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="border rounded-md p-4">
            <img 
              src={qrImage} 
              alt="Payment QR Code" 
              className="w-64 h-64"
              data-testid="img-current-qr"
            />
          </div>
          <div className="text-center">
            <Label htmlFor="qr-upload" className="cursor-pointer">
              <Button type="button" variant="outline" asChild disabled={uploadMutation.isPending}>
                <span data-testid="button-upload-qr">
                  {uploadMutation.isPending ? "Uploading..." : "Upload New QR Code"}
                </span>
              </Button>
              <Input
                id="qr-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploadMutation.isPending}
              />
            </Label>
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: Square image, at least 512x512px
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
