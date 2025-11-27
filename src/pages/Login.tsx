// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const success = await login(email, password);
//       if (success) {
//         toast.success("Login successful!");
//         navigate("/dashboard");
//       } else {
//         setError("Invalid login credentials");
//         toast.error("Invalid login credentials");
//       }
//     } catch (err) {
//       setError("An error occurred during login");
//       toast.error("An error occurred during login");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md shadow-2xl">
//         <CardHeader className="space-y-3 text-center">
//           <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
//             <Building2 className="w-8 h-8 text-primary-foreground" />
//           </div>
//           <CardTitle className="text-2xl">ApplyWizz Expense Manager</CardTitle>
//           <CardDescription>CFO-Controlled Platform</CardDescription>
//         </CardHeader>
//         <form onSubmit={handleLogin}>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="your.name@applywizz.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10 pr-10"
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-muted-foreground" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-muted-foreground" />
//                   )}
//                 </Button>
//               </div>
//             </div>
//             {error && (
//               <div className="text-sm text-destructive text-center">
//                 {error}
//               </div>
//             )}
//           </CardContent>
//           <CardFooter className="flex flex-col space-y-3">
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Signing in..." : "Sign In"}
//             </Button>
//             {/* <Button 
//               type="button" 
//               variant="link" 
//               className="w-full text-primary hover:text-primary/90 p-0 h-auto"
//               onClick={() => navigate("-password")}
//             >
//               Reset Password
//             </Button> */}
//             <Button 
//   type="button" 
//   variant="link" 
//   className="w-full text-primary hover:text-primary/90 p-0 h-auto"
//   onClick={() => navigate("/request-reset")}  // Changed from "/reset-password"
// >
//   Reset Password
// </Button>
//             <Button type="button" variant="outline" className="w-full" disabled>
//               Sign in with Google Workspace
//             </Button>
//           </CardFooter>
//         </form>
//         <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
//           ApplyWizz © 2025 | CFO-Controlled Platform
//         </div>
//       </Card>
//     </div>
//   );
// }


























































import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // ADD THIS IMPORT
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // ADD THIS STATE - default to true for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError("");






  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  console.log("Login attempt started..."); // DEBUG

  try {
    const success = await login(email, password, rememberMe);
    console.log("Login result:", success); // DEBUG
    
    if (success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      setError("Invalid login credentials");
      toast.error("Invalid login credentials");
    }
  } catch (err) {
    console.error("Login catch error:", err); // DEBUG
    setError("An error occurred during login");
    toast.error("An error occurred during login");
  } finally {
    console.log("Login finished, setting loading to false"); // DEBUG
    setIsLoading(false);
  }
};
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">ApplyWizz Expense Manager</CardTitle>
          <CardDescription>CFO-Controlled Platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@applywizz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* ADD REMEMBER ME CHECKBOX */}
            {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div> */}

            {/* REPLACE THE CHECKBOX SECTION WITH THIS */}
{/* <div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
  />
  <Label
    htmlFor="rememberMe"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Remember me
  </Label>
</div> */}
{/* REPLACE THE CHECKBOX SECTION WITH THIS */}
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
  />
  <Label
    htmlFor="rememberMe"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Remember me
  </Label>
</div>
            
            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button 
              type="button" 
              variant="link" 
              className="w-full text-primary hover:text-primary/90 p-0 h-auto"
              onClick={() => navigate("/request-reset")}
            >
              Reset Password
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled>
              Sign in with Google Workspace
            </Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
          ApplyWizz © 2025 | CFO-Controlled Platform
        </div>
      </Card>
    </div>
  );
}
