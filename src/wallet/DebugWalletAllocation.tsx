import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mockData";
import { debugWalletAllocation, testSupabaseConnection } from "@/lib/wallet/debugWalletAllocation";
import { toast } from "sonner";

export default function DebugWalletAllocation() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("5000");
  const [purpose, setPurpose] = useState("Debug allocation");
  const [loading, setLoading] = useState(false);

  const cxoUsers = mockUsers.filter((u) => u.role === "cxo");

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        toast.success("Supabase connection test successful", {
          description: result.message
        });
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Unknown error';
        toast.error("Supabase connection test failed", {
          description: `${errorMessage} (Table: ${result.table})`
        });
      }
    } catch (error) {
      toast.error("Connection test failed", {
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugAllocation = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      const result = await debugWalletAllocation(selectedUser, parseFloat(amount), purpose);
      if (result.success) {
        toast.success("Wallet allocation debug successful", {
          description: result.message
        });
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Unknown error';
        toast.error("Wallet allocation debug failed", {
          description: `${errorMessage} (Step: ${result.step})`
        });
      }
    } catch (error) {
      toast.error("Debug failed", {
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
        <CardTitle>Debug Wallet Allocation</CardTitle>
        <CardDescription>Test the wallet fund allocation functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select CXO</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a CXO" />
            </SelectTrigger>
            <SelectContent>
              {cxoUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
        
        <div className="flex gap-2">
          <Button onClick={handleTestConnection} disabled={loading} variant="outline">
            {loading ? "Testing..." : "Test Connection"}
          </Button>
          <Button onClick={handleDebugAllocation} disabled={loading}>
            {loading ? "Debugging..." : "Debug Allocation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}