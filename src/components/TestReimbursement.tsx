import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { verifyReimbursementDeduction } from "@/lib/wallet/verifyReimbursement";
import { toast } from "sonner";

export default function TestReimbursement() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("1000");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!user?.id) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyReimbursementDeduction(user.id, parseFloat(amount));
      if (result.success) {
        toast.success("Reimbursement test successful!", {
          description: `Proof pending decreased by ₹${result.data?.changes?.proofPendingChange || 0}, Reimbursed increased by ₹${result.data?.changes?.reimbursedChange || 0}`
        });
      } else {
        toast.error("Reimbursement test failed", {
          description: result.error as string
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

  if (!user || user.role !== "cfo") {
    return null;
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Reimbursement Test</CardTitle>
        <CardDescription>Test the reimbursement deduction logic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test Amount (₹)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter test amount"
          />
        </div>
        <Button onClick={handleTest} disabled={loading}>
          {loading ? "Testing..." : "Test Reimbursement Deduction"}
        </Button>
      </CardContent>
    </Card>
  );
}