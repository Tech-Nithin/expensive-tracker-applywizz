import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { debugWalletOperations, testReimbursementUpdate } from "@/lib/wallet/debugWallet";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugWalletButton() {
  const { user } = useAuth();

  const handleDebugWallet = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    try {
      const result = await debugWalletOperations(user.id);
      if (result.success) {
        toast.success("Wallet debug successful", {
          description: JSON.stringify(result.data || result.message, null, 2)
        });
      } else {
        toast.error("Wallet debug failed", {
          description: result.error as string
        });
      }
    } catch (error) {
      toast.error("Debug failed", {
        description: (error as Error).message
      });
    }
  };

  const handleTestReimbursement = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    try {
      const result = await testReimbursementUpdate(user.id, 100);
      if (result.success) {
        toast.success("Reimbursement test successful");
      } else {
        toast.error("Reimbursement test failed", {
          description: result.error as string
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: (error as Error).message
      });
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-medium">Debug Wallet Operations</h3>
      <Button onClick={handleDebugWallet} variant="outline" size="sm">
        Debug Wallet
      </Button>
      <Button onClick={handleTestReimbursement} variant="outline" size="sm">
        Test Reimbursement
      </Button>
    </div>
  );
}