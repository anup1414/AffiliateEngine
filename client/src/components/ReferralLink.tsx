import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralLinkProps {
  link: string;
}

export default function ReferralLink({ link }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card data-testid="card-referral-link">
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>
          Share this link with others to earn ₹2,000 for each successful membership purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={link}
            readOnly
            data-testid="input-referral-link"
            className="font-mono text-sm"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            data-testid="button-copy-link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          When someone signs up using your link and purchases a membership, you'll earn ₹2,000
        </p>
      </CardContent>
    </Card>
  );
}
