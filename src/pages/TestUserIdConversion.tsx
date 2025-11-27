import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { mockUsers } from "@/lib/mockData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function TestUserIdConversion() {
  const { user } = useAuth();
  const [mockUserId, setMockUserId] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConversion = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    try {
      // 1. Find the mock user
      const mockUser = mockUsers.find(u => u.id === mockUserId);
      if (!mockUser) {
        setResult({ step: 'mock_user', error: 'Mock user not found' });
        toast.error("Mock user not found");
        return;
      }

      setResult({ step: 'mock_user', data: mockUser });
      toast.info("Mock user found", { description: mockUser.name });

      // 2. Find the real user in the database with the same email
      const { data: realUser, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', mockUser.email)
        .single();
        
      if (userError) {
        setResult(prev => ({ ...prev, step: 'real_user', error: userError }));
        toast.error("Real user not found", { description: userError.message });
        return;
      }

      setResult(prev => ({ ...prev, step: 'real_user', data: realUser }));
      toast.info("Real user found", { description: `${realUser.name} (${realUser.id})` });

      // 3. Test creating an allocation with the real UUID
      const { data: allocationData, error: allocationError } = await supabase
        .from('wallet_allocations')
        .insert([
          {
            user_id: realUser.id,
            amount: 1000,
            purpose: 'Test allocation',
            date: new Date(),
          }
        ])
        .select();

      if (allocationError) {
        setResult(prev => ({ ...prev, step: 'allocation', error: allocationError }));
        toast.error("Failed to create allocation", { description: allocationError.message });
        return;
      }

      setResult(prev => ({ ...prev, step: 'allocation', data: allocationData }));
      toast.success("Allocation created successfully");

      // 4. Clean up - delete the test allocation
      if (allocationData && allocationData[0]) {
        const { error: deleteError } = await supabase
          .from('wallet_allocations')
          .delete()
          .eq('id', allocationData[0].id);

        if (deleteError) {
          console.error('Failed to delete test allocation:', deleteError);
        } else {
          toast.info("Test allocation cleaned up");
        }
      }
    } catch (error) {
      setResult({ step: 'exception', error });
      toast.error("Test failed", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role');
        
      if (error) {
        setResult({ step: 'all_users', error });
        toast.error("Failed to fetch users", { description: error.message });
        return;
      }

      setResult({ step: 'all_users', data });
      toast.success("Users fetched successfully", { description: `Found ${data.length} users` });
    } catch (error) {
      setResult({ step: 'exception', error });
      toast.error("Fetch users failed", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User ID Conversion Test</h1>
          <p className="text-muted-foreground">Test the user ID conversion from mock to real UUID</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User ID Conversion Test</CardTitle>
            <CardDescription>Test the user ID conversion without affecting real data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mock User ID</Label>
              <Input
                type="text"
                value={mockUserId}
                onChange={(e) => setMockUserId(e.target.value)}
                placeholder="Enter mock user ID (e.g., 3)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={testConversion} disabled={loading}>
                {loading ? "Testing..." : "Test Conversion"}
              </Button>
              <Button onClick={getAllUsers} disabled={loading} variant="outline">
                {loading ? "Fetching..." : "Get All Users"}
              </Button>
            </div>
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