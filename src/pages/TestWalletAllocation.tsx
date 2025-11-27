import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function TestWalletAllocation() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("1000");
  const [purpose, setPurpose] = useState("Test allocation");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAllocation = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    try {
      // 1. Test creating allocation record
      const { data: allocationData, error: allocationError } = await supabase
        .from('wallet_allocations')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(amount),
            purpose,
            date: new Date(),
          }
        ])
        .select();

      if (allocationError) {
        setResult({ step: 'allocation', error: allocationError });
        toast.error("Allocation record failed", { description: allocationError.message });
        return;
      }

      setResult({ step: 'allocation', data: allocationData });
      toast.info("Allocation record created");

      // 2. Check if wallet exists
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) {
        setResult(prev => ({ ...prev, step: 'wallet_check', error: walletError }));
        toast.error("Wallet check failed", { description: walletError.message });
        
        // Try to create wallet
        const { error: createError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: user.id,
              allocated: parseFloat(amount),
              company_spent: 0,
              reimbursed: 0,
              balance: parseFloat(amount),
              proof_pending: 0,
            }
          ]);

        if (createError) {
          setResult(prev => ({ ...prev, step: 'wallet_create', error: createError }));
          toast.error("Wallet creation failed", { description: createError.message });
          return;
        }

        setResult(prev => ({ ...prev, step: 'wallet_create', message: 'Wallet created' }));
        toast.success("Wallet created successfully");
        return;
      }

      setResult(prev => ({ ...prev, step: 'wallet_check', data: walletData }));
      toast.info("Wallet found", { description: `Current balance: ₹${walletData.balance}` });

      // 3. Update existing wallet
      const newAllocated = walletData.allocated + parseFloat(amount);
      const newBalance = walletData.balance + parseFloat(amount);
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          allocated: newAllocated,
          balance: newBalance,
          updated_at: new Date()
        })
        .eq('user_id', user.id);

      if (updateError) {
        setResult(prev => ({ ...prev, step: 'wallet_update', error: updateError }));
        toast.error("Wallet update failed", { description: updateError.message });
        return;
      }

      setResult(prev => ({ ...prev, step: 'wallet_update', message: 'Success' }));
      toast.success("Wallet updated successfully", { 
        description: `New balance: ₹${newBalance}` 
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
          <h1 className="text-3xl font-bold tracking-tight">Wallet Allocation Test</h1>
          <p className="text-muted-foreground">Test the wallet fund allocation functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Allocation Test</CardTitle>
            <CardDescription>Test the wallet fund allocation without affecting real data</CardDescription>
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
            <Button onClick={testAllocation} disabled={loading}>
              {loading ? "Testing..." : "Test Allocation"}
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