// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { supabase } from "@/lib/supabaseClient";
// import { toast } from "sonner";
// import { Eye, EyeOff } from "lucide-react";

// export default function ResetPassword() {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [token, setToken] = useState<string | null>(null);
//   const [isVerifying, setIsVerifying] = useState(true);
//   const [passwordUpdated, setPasswordUpdated] = useState(false); // New state to track if password was updated
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // Check for token hash in URL parameters on component mount
//   useEffect(() => {
//     const tokenHash = searchParams.get('token_hash');
//     const type = searchParams.get('type');
    
//     if (tokenHash && type === 'email') {
//       setToken(tokenHash);
//       // Verify the token hash to complete the magic link flow
//       verifyTokenHash(tokenHash);
//     } else {
//       // Not a magic link flow, allow user to enter email and password
//       setIsVerifying(false);
//     }
//   }, [searchParams]);

//   const verifyTokenHash = async (tokenHash: string) => {
//     try {
//       // Exchange the token hash for a session
//       const { data, error } = await supabase.auth.verifyOtp({
//         type: 'email',
//         token_hash: tokenHash
//       });

//       if (error) throw error;

//       // Successfully verified the token hash
//       // Now we can allow the user to set their password
//       setIsVerifying(false);
//       toast.success("Email verified successfully. Please set your new password.");
//     } catch (error: any) {
//       toast.error("Failed to verify email: " + (error.message || "Unknown error"));
//       console.error("Error verifying token hash:", error);
//       setIsVerifying(false);
//     }
//   };

//   // Calculate password strength
//   const calculatePasswordStrength = (value: string) => {
//     let strength = 0;
    
//     if (value.length >= 8) strength += 25;
//     if (/[A-Z]/.test(value)) strength += 25;
//     if (/[a-z]/.test(value)) strength += 25;
//     if (/[0-9]/.test(value)) strength += 15;
//     if (/[^A-Za-z0-9]/.test(value)) strength += 10;

//     setPasswordStrength(Math.min(strength, 100));
//   };

//   const getStrengthColor = () => {
//     if (passwordStrength === 0) return "bg-gray-200";
//     if (passwordStrength < 40) return "bg-red-500";
//     if (passwordStrength < 70) return "bg-yellow-500";
//     return "bg-green-500";
//   };

//   const handleResetPassword = async () => {
//     if (!email || !newPassword || !confirmPassword) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Update the password in Supabase Auth
//       // This automatically invalidates the old password
//       const { error: authError } = await supabase.auth.updateUser({
//         password: newPassword
//       });

//       if (authError) {
//         throw authError;
//       }

//       toast.success("Password updated successfully");
//       setPasswordUpdated(true); // Set the flag to indicate password was updated
//     } catch (error: any) {
//       toast.error("Failed to update password: " + (error.message || "Unknown error"));
//       console.error("Error updating password:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading state while verifying token
//   if (isVerifying) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-background">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Verifying Email</CardTitle>
//             <CardDescription>Please wait while we verify your email address</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex justify-center items-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
//       <h1 className="text-3xl font-bold mb-6">
// 
// </h1>
//       <Card className="w-full max-w-md">
//         <CardContent className="pt-6">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@applywizz.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="new-password">New Password *</Label>
//               <div className="relative">
//                 <Input
//                   id="new-password"
//                   type={showNewPassword ? "text" : "password"}
//                   placeholder="Enter new password"
//                   value={newPassword}
//                   onChange={(e) => {
//                     setNewPassword(e.target.value);
//                     calculatePasswordStrength(e.target.value);
//                   }}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                 >
//                   {showNewPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
              
//               {/* Password Strength Indicator */}
//               {newPassword && (
//                 <div className="space-y-2 animate-in fade-in duration-300">
//                   <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                     <div 
//                       className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}
//                       style={{ 
//                         width: `${passwordStrength}%`,
//                         transform: `scaleX(${passwordStrength / 100})`,
//                         transformOrigin: 'left'
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirm-password">Confirm Password *</Label>
//               <div className="relative">
//                 <Input
//                   id="confirm-password"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm new password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <Button 
//               className="w-full" 
//               onClick={handleResetPassword} 
//               disabled={loading || passwordUpdated}
//             >
//               {loading ? "Updating Password..." : passwordUpdated ? "Password Updated" : "Set Password"}
//             </Button>
            
//             {/* Back to Sign In button - only show after password is updated or when not in loading state */}
//             {passwordUpdated && (
//               <Button 
//                 variant="link" 
//                 className="w-full text-primary hover:text-primary/90 p-0 h-auto"
//                 onClick={() => navigate("/")}
//               >
//                 Back to Sign In
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



















// // import { useState, useEffect } from "react";
// // import { useNavigate, useSearchParams } from "react-router-dom";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { supabase } from "@/lib/supabaseClient";
// // import { toast } from "sonner";
// // import { Eye, EyeOff } from "lucide-react";

// // export default function ResetPassword() {
// //   const [email, setEmail] = useState("");
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [showNewPassword, setShowNewPassword] = useState(false);
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [passwordStrength, setPasswordStrength] = useState(0);
// //   const [token, setToken] = useState<string | null>(null);
// //   const [isVerifying, setIsVerifying] = useState(true);
// //   const [isAuthenticated, setIsAuthenticated] = useState(false); // NEW: Track auth state
// //   const navigate = useNavigate();
// //   const [searchParams] = useSearchParams();

// //   // Check for token hash in URL parameters on component mount
// //   useEffect(() => {
// //     const tokenHash = searchParams.get('token_hash');
// //     const type = searchParams.get('type');
    
// //     if (tokenHash && type === 'email') {
// //       setToken(tokenHash);
// //       // Verify the token hash to complete the magic link flow
// //       verifyTokenHash(tokenHash);
// //     } else {
// //       // Not a magic link flow, allow user to enter email and password
// //       setIsVerifying(false);
// //     }
// //   }, [searchParams]);

// //   const verifyTokenHash = async (tokenHash: string) => {
// //     try {
// //       // Exchange the token hash for a session
// //       const { data, error } = await supabase.auth.verifyOtp({
// //         type: 'email',
// //         token_hash: tokenHash
// //       });

// //       if (error) throw error;

// //       // Successfully verified the token hash
// //       // NEW: Set authenticated state to true
// //       setIsAuthenticated(true);
// //       setIsVerifying(false);
      
// //       // NEW: Auto-fill the email from the authenticated user
// //       if (data.user?.email) {
// //         setEmail(data.user.email);
// //       }
      
// //       toast.success("Email verified successfully. Please set your new password.");
// //     } catch (error: any) {
// //       toast.error("Failed to verify email: " + (error.message || "Unknown error"));
// //       console.error("Error verifying token hash:", error);
// //       setIsVerifying(false);
// //     }
// //   };

// //   // Calculate password strength
// //   const calculatePasswordStrength = (value: string) => {
// //     let strength = 0;
    
// //     if (value.length >= 8) strength += 25;
// //     if (/[A-Z]/.test(value)) strength += 25;
// //     if (/[a-z]/.test(value)) strength += 25;
// //     if (/[0-9]/.test(value)) strength += 15;
// //     if (/[^A-Za-z0-9]/.test(value)) strength += 10;

// //     setPasswordStrength(Math.min(strength, 100));
// //   };

// //   const getStrengthColor = () => {
// //     if (passwordStrength === 0) return "bg-gray-200";
// //     if (passwordStrength < 40) return "bg-red-500";
// //     if (passwordStrength < 70) return "bg-yellow-500";
// //     return "bg-green-500";
// //   };

// //   const handleResetPassword = async () => {
// //     if (!email || !newPassword || !confirmPassword) {
// //       toast.error("Please fill all required fields");
// //       return;
// //     }

// //     if (newPassword !== confirmPassword) {
// //       toast.error("Passwords do not match");
// //       return;
// //     }

// //     if (newPassword.length < 8) {
// //       toast.error("Password must be at least 8 characters long");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       // UPDATED: Use different approaches based on authentication state
// //       if (isAuthenticated) {
// //         // User is authenticated via magic link - use updateUser
// //         const { error: authError } = await supabase.auth.updateUser({
// //           password: newPassword
// //         });

// //         if (authError) {
// //           throw authError;
// //         }

// //         toast.success("Password set successfully");
        
// //         // Redirect to sign-in page after successful password reset
// //         navigate("/login");
// //       } else {
// //         // User is not authenticated - use resetPasswordForEmail for regular password reset
// //         const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
// //           redirectTo: `${window.location.origin}/reset-password`,
// //         });

// //         if (resetError) {
// //           throw resetError;
// //         }

// //         toast.success("Password reset email sent. Please check your inbox.");
// //         // User will receive a new magic link to set password
// //       }
// //     } catch (error: any) {
// //       toast.error("Failed to set password: " + (error.message || "Unknown error"));
// //       console.error("Error setting password:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Show loading state while verifying token
// //   if (isVerifying) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen bg-background">
// //         <Card className="w-full max-w-md">
// //           <CardHeader>
// //             <CardTitle>Verifying Email</CardTitle>
// //             <CardDescription>Please wait while we verify your email address</CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="flex justify-center items-center py-8">
// //               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
// //       <h1 className="text-3xl font-bold mb-6">
// //         {isAuthenticated ? "Set Your Password" : "Reset Password"}
// //       </h1>
// //       <Card className="w-full max-w-md">
// //         <CardContent className="pt-6">
// //           <div className="space-y-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="email">Email *</Label>
// //               <Input
// //                 id="email"
// //                 type="email"
// //                 placeholder="user@applywizz.com"
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //                 disabled={isAuthenticated} // NEW: Disable email field if authenticated
// //               />
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="new-password">New Password *</Label>
// //               <div className="relative">
// //                 <Input
// //                   id="new-password"
// //                   type={showNewPassword ? "text" : "password"}
// //                   placeholder="Enter new password"
// //                   value={newPassword}
// //                   onChange={(e) => {
// //                     setNewPassword(e.target.value);
// //                     calculatePasswordStrength(e.target.value);
// //                   }}
// //                 />
// //                 <Button
// //                   type="button"
// //                   variant="ghost"
// //                   size="sm"
// //                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
// //                   onClick={() => setShowNewPassword(!showNewPassword)}
// //                 >
// //                   {showNewPassword ? (
// //                     <EyeOff className="h-4 w-4" />
// //                   ) : (
// //                     <Eye className="h-4 w-4" />
// //                   )}
// //                 </Button>
// //               </div>
              
// //               {/* Password Strength Indicator */}
// //               {newPassword && (
// //                 <div className="space-y-2 animate-in fade-in duration-300">
// //                   <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
// //                     <div 
// //                       className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}
// //                       style={{ 
// //                         width: `${passwordStrength}%`,
// //                         transform: `scaleX(${passwordStrength / 100})`,
// //                         transformOrigin: 'left'
// //                       }}
// //                     />
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="confirm-password">Confirm Password *</Label>
// //               <div className="relative">
// //                 <Input
// //                   id="confirm-password"
// //                   type={showConfirmPassword ? "text" : "password"}
// //                   placeholder="Confirm new password"
// //                   value={confirmPassword}
// //                   onChange={(e) => setConfirmPassword(e.target.value)}
// //                 />
// //                 <Button
// //                   type="button"
// //                   variant="ghost"
// //                   size="sm"
// //                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
// //                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// //                 >
// //                   {showConfirmPassword ? (
// //                     <EyeOff className="h-4 w-4" />
// //                   ) : (
// //                     <Eye className="h-4 w-4" />
// //                   )}
// //                 </Button>
// //               </div>
// //             </div>

// //             <Button 
// //               className="w-full" 
// //               onClick={handleResetPassword} 
// //               disabled={loading}
// //             >
// //               {loading ? "Setting Password..." : "Set Password"}
// //             </Button>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }

























































// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { supabase } from "@/lib/supabaseClient";
// import { toast } from "sonner";
// import { Eye, EyeOff } from "lucide-react";

// export default function ResetPassword() {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [passwordUpdated, setPasswordUpdated] = useState(false);
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // Check for token hash in URL parameters on component mount
//   useEffect(() => {
//     const tokenHash = searchParams.get('token_hash');
//     const type = searchParams.get('type');
//     const emailParam = searchParams.get('email'); // Get email from URL params
    
//     // If email is in URL params, auto-fill it
//     if (emailParam) {
//       setEmail(decodeURIComponent(emailParam));
//     }
    
//     // If magic link parameters exist, auto-verify by setting authenticated state
//     if (tokenHash && type === 'signup') {
//       // Auto-authenticate user without OTP verification
//       handleAutoAuthentication();
//     }
//   }, [searchParams]);

//   const handleAutoAuthentication = async () => {
//     try {
//       // Get the current session to check if user is already authenticated
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session) {
//         // User is already authenticated via magic link
//         if (session.user?.email && !email) { // Only set if email isn't already set
//           setEmail(session.user.email);
//         }
//         toast.success("Please set your new password");
//       } else {
//         // For magic link flow, we'll assume the user is authenticated
//         // and allow them to set password directly
//         toast.success("Please set your new password to complete account setup");
//       }
//     } catch (error) {
//       console.error("Auto-authentication error:", error);
//     }
//   };

//   // Calculate password strength
//   const calculatePasswordStrength = (value: string) => {
//     let strength = 0;
    
//     if (value.length >= 8) strength += 25;
//     if (/[A-Z]/.test(value)) strength += 25;
//     if (/[a-z]/.test(value)) strength += 25;
//     if (/[0-9]/.test(value)) strength += 15;
//     if (/[^A-Za-z0-9]/.test(value)) strength += 10;

//     setPasswordStrength(Math.min(strength, 100));
//   };

//   const getStrengthColor = () => {
//     if (passwordStrength === 0) return "bg-gray-200";
//     if (passwordStrength < 40) return "bg-red-500";
//     if (passwordStrength < 70) return "bg-yellow-500";
//     return "bg-green-500";
//   };

//   const handleResetPassword = async () => {
//     if (!email || !newPassword || !confirmPassword) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Update the password in Supabase Auth
//       const { error: authError } = await supabase.auth.updateUser({
//         password: newPassword
//       });

//       if (authError) {
//         throw authError;
//       }

//       toast.success("Password updated successfully");
//       setPasswordUpdated(true);
//     } catch (error: any) {
//       toast.error("Failed to update password: " + (error.message || "Unknown error"));
//       console.error("Error updating password:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
//       <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
//       <Card className="w-full max-w-md">
//         <CardContent className="pt-6">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@applywizz.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 readOnly={!!searchParams.get('email')} // Make readonly if email came from URL
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="new-password">New Password *</Label>
//               <div className="relative">
//                 <Input
//                   id="new-password"
//                   type={showNewPassword ? "text" : "password"}
//                   placeholder="Enter new password"
//                   value={newPassword}
//                   onChange={(e) => {
//                     setNewPassword(e.target.value);
//                     calculatePasswordStrength(e.target.value);
//                   }}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                 >
//                   {showNewPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
              
//               {/* Password Strength Indicator */}
//               {newPassword && (
//                 <div className="space-y-2 animate-in fade-in duration-300">
//                   <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                     <div 
//                       className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}
//                       style={{ 
//                         width: `${passwordStrength}%`,
//                         transform: `scaleX(${passwordStrength / 100})`,
//                         transformOrigin: 'left'
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirm-password">Confirm Password *</Label>
//               <div className="relative">
//                 <Input
//                   id="confirm-password"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm new password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <Button 
//               className="w-full" 
//               onClick={handleResetPassword} 
//               disabled={loading || passwordUpdated}
//             >
//               {loading ? "Updating Password..." : passwordUpdated ? "Password Updated" : "Set Password"}
//             </Button>
            
//             {/* Back to Sign In button - only show after password is updated or when not in loading state */}
//             {passwordUpdated && (
//               <Button 
//                 variant="link" 
//                 className="w-full text-primary hover:text-primary/90 p-0 h-auto"
//                 onClick={() => navigate("/")}
//               >
//                 Back to Sign In
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




































// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { supabase } from "@/lib/supabaseClient";
// import { toast } from "sonner";
// import { Eye, EyeOff } from "lucide-react";

// export default function ResetPassword() {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [passwordUpdated, setPasswordUpdated] = useState(false);
//   const [redirectProgress, setRedirectProgress] = useState(0); // For redirect progress bar
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // Check for token hash in URL parameters on component mount
//   useEffect(() => {
//     const tokenHash = searchParams.get('token_hash');
//     const type = searchParams.get('type');
//     const emailParam = searchParams.get('email'); // Get email from URL params
    
//     // If email is in URL params, auto-fill it
//     if (emailParam) {
//       setEmail(decodeURIComponent(emailParam));
//     }
    
//     // If magic link parameters exist, auto-verify by setting authenticated state
//     if (tokenHash && type === 'signup') {
//       // Auto-authenticate user without OTP verification
//       handleAutoAuthentication();
//     }
//   }, [searchParams]);

//   // Handle redirect progress after password update
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (passwordUpdated && redirectProgress < 100) {
//       interval = setInterval(() => {
//         setRedirectProgress(prev => {
//           if (prev >= 100) {
//             clearInterval(interval);
//             navigate("/");
//             return 100;
//           }
//           return prev + 2; // Increase by 2 each 50ms for 2 seconds total
//         });
//       }, 50);
//     }
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [passwordUpdated, redirectProgress, navigate]);

//   const handleAutoAuthentication = async () => {
//     try {
//       // Get the current session to check if user is already authenticated
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session) {
//         // User is already authenticated via magic link
//         if (session.user?.email && !email) { // Only set if email isn't already set
//           setEmail(session.user.email);
//         }
//         toast.success("Please set your new password");
//       } else {
//         // For magic link flow, we'll assume the user is authenticated
//         // and allow them to set password directly
//         toast.success("Please set your new password to complete account setup");
//       }
//     } catch (error) {
//       console.error("Auto-authentication error:", error);
//     }
//   };

//   // Calculate password strength
//   const calculatePasswordStrength = (value: string) => {
//     let strength = 0;
    
//     if (value.length >= 8) strength += 25;
//     if (/[A-Z]/.test(value)) strength += 25;
//     if (/[a-z]/.test(value)) strength += 25;
//     if (/[0-9]/.test(value)) strength += 15;
//     if (/[^A-Za-z0-9]/.test(value)) strength += 10;

//     setPasswordStrength(Math.min(strength, 100));
//   };

//   const getStrengthColor = () => {
//     if (passwordStrength === 0) return "bg-gray-200";
//     if (passwordStrength < 40) return "bg-red-500";
//     if (passwordStrength < 70) return "bg-yellow-500";
//     return "bg-green-500";
//   };

//   const handleResetPassword = async () => {
//     if (!email || !newPassword || !confirmPassword) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Update the password in Supabase Auth
//       const { error: authError } = await supabase.auth.updateUser({
//         password: newPassword
//       });

//       if (authError) {
//         throw authError;
//       }

//       toast.success("Password updated successfully");
//       setPasswordUpdated(true);
//       setRedirectProgress(0); // Start redirect progress
//     } catch (error: any) {
//       toast.error("Failed to update password: " + (error.message || "Unknown error"));
//       console.error("Error updating password:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
//       <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
//       <Card className="w-full max-w-md">
//         <CardContent className="pt-6">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@applywizz.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 readOnly={!!searchParams.get('email')} // Make readonly if email came from URL
//               />
//             </div>

//             {!passwordUpdated ? (
//               <>
//                 <div className="space-y-2">
//                   <Label htmlFor="new-password">New Password *</Label>
//                   <div className="relative">
//                     <Input
//                       id="new-password"
//                       type={showNewPassword ? "text" : "password"}
//                       placeholder="Enter new password"
//                       value={newPassword}
//                       onChange={(e) => {
//                         setNewPassword(e.target.value);
//                         calculatePasswordStrength(e.target.value);
//                       }}
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                     >
//                       {showNewPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
                  
//                   {/* Password Strength Indicator */}
//                   {newPassword && (
//                     <div className="space-y-2 animate-in fade-in duration-300">
//                       <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                         <div 
//                           className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}
//                           style={{ 
//                             width: `${passwordStrength}%`,
//                             transform: `scaleX(${passwordStrength / 100})`,
//                             transformOrigin: 'left'
//                           }}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirm-password">Confirm Password *</Label>
//                   <div className="relative">
//                     <Input
//                       id="confirm-password"
//                       type={showConfirmPassword ? "text" : "password"}
//                       placeholder="Confirm new password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
//                 </div>

//                 <Button 
//                   className="w-full" 
//                   onClick={handleResetPassword} 
//                   disabled={loading || passwordUpdated}
//                 >
//                   {loading ? "Updating Password..." : passwordUpdated ? "Password Updated" : "Set Password"}
//                 </Button>
//               </>
//             ) : (
//               // Show redirect progress after password update
//               <div className="space-y-4 py-4">
//                 <div className="text-center">
//                   <div className="text-lg font-medium text-green-600">Password Updated Successfully!</div>
//                   <div className="text-sm text-muted-foreground mt-1">
//                     Redirecting to login page...
//                   </div>
//                 </div>
                
//                 {/* Progress bar */}
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
//                     style={{ width: `${redirectProgress}%` }}
//                   ></div>
//                 </div>
                
//                 <div className="text-center text-sm text-muted-foreground">
//                   {Math.round(redirectProgress)}% complete
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
































import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0); // For redirect progress bar
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for token hash in URL parameters on component mount
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const emailParam = searchParams.get('email'); // Get email from URL params
    
    // If email is in URL params, auto-fill it
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    // If magic link parameters exist, auto-verify by setting authenticated state
    if (tokenHash && type === 'signup') {
      // Auto-authenticate user without OTP verification
      handleAutoAuthentication();
    }
  }, [searchParams]);

  // Handle redirect progress after password update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (passwordUpdated) {
      interval = setInterval(() => {
        setRedirectProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Use window.location for more reliable redirect
            window.location.href = "/";
            return 100;
          }
          return prev + 2; // Increase by 4 each 50ms for 2.5 seconds total
        });
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [passwordUpdated]);

  const handleAutoAuthentication = async () => {
    try {
      // Get the current session to check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already authenticated via magic link
        if (session.user?.email && !email) { // Only set if email isn't already set
          setEmail(session.user.email);
        }
        toast.success("Please set your new password");
      } else {
        // For magic link flow, we'll assume the user is authenticated
        // and allow them to set password directly
        toast.success("Please set your new password to complete account setup");
      }
    } catch (error) {
      console.error("Auto-authentication error:", error);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (value: string) => {
    let strength = 0;
    
    if (value.length >= 8) strength += 25;
    if (/[A-Z]/.test(value)) strength += 25;
    if (/[a-z]/.test(value)) strength += 25;
    if (/[0-9]/.test(value)) strength += 15;
    if (/[^A-Za-z0-9]/.test(value)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleResetPassword = async () => {
    if (!email || !newPassword || !confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      // Update the password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        throw authError;
      }

      toast.success("Password updated successfully");
      setPasswordUpdated(true);
      // Start redirect progress
      setRedirectProgress(0);
      
      // Fallback redirect after 3 seconds in case progress bar fails
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error: any) {
      toast.error("Failed to update password: " + (error.message || "Unknown error"));
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@applywizz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!searchParams.get('email')} // Make readonly if email came from URL
              />
            </div>

            {!passwordUpdated ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        calculatePasswordStrength(e.target.value);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}
                          style={{ 
                            width: `${passwordStrength}%`,
                            transform: `scaleX(${passwordStrength / 100})`,
                            transformOrigin: 'left'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleResetPassword} 
                  disabled={loading || passwordUpdated}
                >
                  {loading ? "Updating Password..." : passwordUpdated ? "Password Updated" : "Set Password"}
                </Button>
              </>
            ) : (
              // Show redirect progress after password update
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-green-600">Password Updated Successfully!</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Redirecting to login page...
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${redirectProgress}%` }}
                  ></div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(redirectProgress)}% complete
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
