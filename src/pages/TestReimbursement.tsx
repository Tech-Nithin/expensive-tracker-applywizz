import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function TestReimbursement() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testReimbursement = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    try {
      // 1. Check if wallet exists
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) {
        setResult({ step: 'wallet_check', error: walletError });
        toast.error("Wallet check failed", { description: walletError.message });
        return;
      }

      setResult({ step: 'wallet_check', data: walletData });
      toast.info("Wallet found", { description: `Current reimbursed: ₹${walletData.reimbursed}` });

      // 2. Simulate reimbursement update
      const reimbursementAmount = parseFloat(amount);
      const updatedReimbursed = walletData.reimbursed + reimbursementAmount;
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          reimbursed: updatedReimbursed,
          updated_at: new Date()
        })
        .eq('user_id', user.id);

      if (updateError) {
        setResult({ step: 'wallet_update', error: updateError });
        toast.error("Wallet update failed", { description: updateError.message });
        return;
      }

      setResult({ step: 'wallet_update', message: 'Success' });
      toast.success("Reimbursement test successful", { 
        description: `Reimbursed amount updated to ₹${updatedReimbursed}` 
      });
    } catch (error) {
      setResult({ step: 'exception', error });
      toast.error("Test failed", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Test</h1>
          <p className="text-muted-foreground">Test the reimbursement processing functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reimbursement Test</CardTitle>
            <CardDescription>Test the reimbursement processing without affecting real data</CardDescription>
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
            <Button onClick={testReimbursement} disabled={loading}>
              {loading ? "Testing..." : "Test Reimbursement"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}