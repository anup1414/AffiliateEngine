import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import qrPlaceholder from "@assets/generated_images/Placeholder_QR_code_489e0649.png";

export default function MembershipPurchase() {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [price, setPrice] = useState(5000);
  const { toast } = useToast();

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

  const handlePurchase = () => {
    console.log("Purchase initiated for ₹", price);
    toast({
      title: "Payment Pending",
      description: "Please complete the payment using the QR code",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
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

          {!couponApplied && (
            <div className="space-y-2">
              <Label htmlFor="coupon">Have a Coupon Code?</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  data-testid="input-coupon"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
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
        </CardContent>
      </Card>

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
              src={qrPlaceholder} 
              alt="Payment QR Code" 
              className="w-64 h-64 border rounded-md"
              data-testid="img-qr-code"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Scan this QR code with any UPI app to pay ₹{price.toLocaleString()}
          </div>
          <Button 
            onClick={handlePurchase} 
            className="w-full"
            data-testid="button-confirm-payment"
          >
            I Have Completed the Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
