import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function RequestResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Convert email to lowercase for consistent password reset
    const normalizedEmail = email.toLowerCase();

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {  // Use normalized email
        redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
      });

      if (error) {
        throw error;
      }

      toast.success("Password reset link sent! Check your email.");
      // Optionally navigate back to login or stay on page
    } catch (error: any) {
      toast.error("Failed to send reset link: " + (error.message || "Unknown error"));
      console.error("Error sending reset link:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter your email</CardTitle>
          <CardDescription>
            We'll send you a magic link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@applywizz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSendMagicLink} 
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Button 
            type="button" 
            variant="link" 
            className="w-full p-0 h-auto"
            onClick={() => navigate("/")}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}