import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mockData";
import { testUserIdConversion, getAllUsersWithIds } from "@/lib/wallet/testUserIdConversion";
import { toast } from "sonner";

export default function DebugUserIdConversion() {
  const { user } = useAuth();
  const [mockUserId, setMockUserId] = useState("3");
  const [loading, setLoading] = useState(false);
  const [usersData, setUsersData] = useState<any[]>([]);

  const handleTestConversion = async () => {
    setLoading(true);
    try {
      const result = await testUserIdConversion(mockUserId);
      if (result.success) {
        toast.success("User ID conversion test successful", {
          description: `Mock ID: ${mockUserId} -> Real ID: ${result.data.realUser.id}`
        });
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Unknown error';
        toast.error("User ID conversion test failed", {
          description: errorMessage
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

  const handleGetAllUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsersWithIds();
      if (result.success) {
        setUsersData(result.data);
        toast.success("Users fetched successfully", {
          description: `Found ${result.data.length} users`
        });
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Unknown error';
        toast.error("Failed to fetch users", {
          description: errorMessage
        });
      }
    } catch (error) {
      toast.error("Fetch users failed", {
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
        <CardTitle>Debug User ID Conversion</CardTitle>
        <CardDescription>Test the user ID conversion from mock to real UUID</CardDescription>
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
          <Button onClick={handleTestConversion} disabled={loading}>
            {loading ? "Testing..." : "Test Conversion"}
          </Button>
          <Button onClick={handleGetAllUsers} disabled={loading} variant="outline">
            {loading ? "Fetching..." : "Get All Users"}
          </Button>
        </div>
        
        {usersData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Users in Database:</h3>
            <div className="max-h-40 overflow-auto">
              {usersData.map((userData) => (
                <div key={userData.id} className="text-sm p-2 border-b">
                  <div>ID: {userData.id}</div>
                  <div>Name: {userData.name}</div>
                  <div>Email: {userData.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}