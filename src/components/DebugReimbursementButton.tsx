import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { debugReimbursementProcess, testWalletConnection } from "@/lib/wallet/debugReimbursement";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugReimbursementButton() {
  const { user } = useAuth();

  const handleDebugTest = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    try {
      toast.info("Testing wallet connection...");
      const connectionResult = await testWalletConnection();
      
      if (!connectionResult.success) {
        toast.error("Wallet connection failed", {
          description: connectionResult.error as string
        });
        return;
      }

      toast.success("Wallet connection successful");
    } catch (error) {
      toast.error("Connection test failed", {
        description: (error as Error).message
      });
    }
  };

  const handleDebugReimbursement = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    try {
      toast.info("Debugging reimbursement process...");
      const result = await debugReimbursementProcess("TEST001", user.id, 1000);
      
      if (result.success) {
        toast.success("Reimbursement debug successful", {
          description: result.message
        });
      } else {
        toast.error("Reimbursement debug failed", {
          description: `${result.error} (Step: ${result.step})`
        });
        
        if (result.walletError) {
          console.error("Wallet error details:", result.walletError);
        }
        
        if (result.updateError) {
          console.error("Update error details:", result.updateError);
        }
      }
    } catch (error) {
      toast.error("Debug failed", {
        description: (error as Error).message
      });
    }
  };

  if (!user || user.role !== "cfo") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-medium text-yellow-800 mb-2">Reimbursement Debug Tools</h3>
      <div className="flex gap-2">
        <Button onClick={handleDebugTest} variant="outline" size="sm" className="text-xs">
          Test Connection
        </Button>
        <Button onClick={handleDebugReimbursement} variant="outline" size="sm" className="text-xs">
          Debug Reimbursement
        </Button>
      </div>
    </div>
  );
}