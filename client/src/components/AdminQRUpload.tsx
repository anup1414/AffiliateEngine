import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import qrPlaceholder from "@assets/generated_images/Placeholder_QR_code_489e0649.png";

export default function AdminQRUpload() {
  const [qrImage, setQrImage] = useState(qrPlaceholder);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "QR Code Updated",
        description: "Payment QR code has been updated successfully",
      });
    }
  };

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
              <Button type="button" variant="outline" asChild>
                <span data-testid="button-upload-qr">Upload New QR Code</span>
              </Button>
              <Input
                id="qr-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
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
