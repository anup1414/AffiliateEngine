import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import qrPlaceholder from "@assets/generated_images/Placeholder_QR_code_489e0649.png";

export default function MembershipPurchase() {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [price, setPrice] = useState(5000);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch QR code
  const { data: qrData } = useQuery({
    queryKey: ["/api/admin/qr-code"],
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "Please login to purchase membership",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 500);
    }
  }, [user, authLoading, toast, setLocation]);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/membership/purchase", "POST", {
        couponCode: couponApplied ? couponCode : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership"] });
      toast({
        title: "Membership Created",
        description: "Your membership has been created. Waiting for payment confirmation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase membership",
        variant: "destructive",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/membership/confirm", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Payment Confirmed!",
        description: "Your membership is now active. Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation("/user/dashboard");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "save3k") {
      setCouponApplied(true);
      setPrice(2000);
      toast({
        title: "Coupon Applied!",
        description: "You saved ₹3,000 on your membership",
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a valid coupon code",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async () => {
    await purchaseMutation.mutateAsync();
  };

  const handleConfirmPayment = async () => {
    await confirmMutation.mutateAsync();
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const qrCodeUrl = qrData?.qrCodePath || qrPlaceholder;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 min-h-screen">
      <Card data-testid="card-membership-pricing">
        <CardHeader>
          <CardTitle className="text-2xl">Membership Purchase</CardTitle>
          <CardDescription>
            Get access to our exclusive affiliate program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Membership Price</span>
              {couponApplied && (
                <span className="text-sm text-muted-foreground line-through">₹5,000</span>
              )}
            </div>
            <div className="text-3xl font-mono font-bold" data-testid="text-price">
              ₹{price.toLocaleString()}
            </div>
            {couponApplied && (
              <Badge className="bg-primary">₹3,000 Discount Applied!</Badge>
            )}
          </div>

          {!couponApplied && !purchaseMutation.isSuccess && (
            <div className="space-y-2">
              <Label htmlFor="coupon">Have a Coupon Code?</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  data-testid="input-coupon"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button
                  onClick={handleApplyCoupon}
                  variant="outline"
                  data-testid="button-apply-coupon"
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hint: Use code "SAVE3K" for ₹3,000 discount
              </p>
            </div>
          )}

          {!purchaseMutation.isSuccess && (
            <Button 
              onClick={handlePurchase} 
              className="w-full"
              disabled={purchaseMutation.isPending}
              data-testid="button-create-membership"
            >
              {purchaseMutation.isPending ? "Creating..." : "Proceed to Payment"}
            </Button>
          )}
        </CardContent>
      </Card>

      {purchaseMutation.isSuccess && (
        <Card data-testid="card-payment-qr">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Scan the QR code to complete your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code" 
                className="w-64 h-64 border rounded-md"
                data-testid="img-qr-code"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Scan this QR code with any UPI app to pay ₹{price.toLocaleString()}
            </div>
            <Button 
              onClick={handleConfirmPayment} 
              className="w-full"
              disabled={confirmMutation.isPending}
              data-testid="button-confirm-payment"
            >
              {confirmMutation.isPending ? "Confirming..." : "I Have Completed the Payment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
