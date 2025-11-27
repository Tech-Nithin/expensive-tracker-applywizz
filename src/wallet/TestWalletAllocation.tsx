import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { testWalletAllocation, verifyWalletBalance } from "@/lib/wallet/testWalletAllocation";
import { toast } from "sonner";

export default function TestWalletAllocation() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("5000");
  const [purpose, setPurpose] = useState("Test allocation");
  const [loading, setLoading] = useState(false);

  const handleTestAllocation = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    try {
      const result = await testWalletAllocation(user.id, parseFloat(amount), purpose);
      if (result.success) {
        toast.success("Wallet allocation test successful", {
          description: result.message
        });
        
        // Verify the balance
        setTimeout(async () => {
          const verifyResult = await verifyWalletBalance(user.id);
          if (verifyResult.success) {
            toast.info("Wallet balance verified", {
              description: `Current balance: ₹${verifyResult.data.balance?.toLocaleString()}`
            });
          }
        }, 1000);
      } else {
        toast.error("Wallet allocation test failed", {
          description: (result.error as Error).message
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Test Wallet Allocation</CardTitle>
        <CardDescription>Test the wallet fund allocation functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter test amount"
          />
        </div>
        <div className="space-y-2">
          <Label>Purpose</Label>
          <Input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Enter purpose"
          />
        </div>
        <Button onClick={handleTestAllocation} disabled={loading}>
          {loading ? "Testing..." : "Test Allocation"}
        </Button>
      </CardContent>
    </Card>
  );
}