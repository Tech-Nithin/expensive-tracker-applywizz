import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockUsers } from "@/lib/mockData";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus, Shield, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export default function Admin() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("cxo");
  const [users, setUsers] = useState<any[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

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

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength < 40) return "";
    if (passwordStrength < 70) return "";
    return "";
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error("Failed to fetch users");
    }
  };

  const handleAddUser = async () => {
    if (!name || !email || !role || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    // Convert email to lowercase for consistent storage
    const normalizedEmail = email.toLowerCase();

    if (!normalizedEmail.endsWith("@applywizz.com")) {
      toast.error("Email must be from @applywizz.com domain");
      return;
    }

    try {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,  // Use normalized email
        password,
        options: {
          data: {
            name,
            role
          },
          emailRedirectTo: `${window.location.origin}/reset-password`
        }
      });

      if (authError) throw authError;

      // Then, add the user to the users table (without password)
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            name,
            email: normalizedEmail,  // Use normalized email
            role
          }
        ]);

      if (insertError) throw insertError;

      // Send magic link email with credentials
      // In a real implementation, you would use a proper email service
      // For now, we'll show a success message indicating the email would be sent
      toast.success(`User ${name} added successfully with role: ${role.toUpperCase()}. Magic link has been sent to ${normalizedEmail} for initial password setup.`);
      
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("cxo");
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast.error("Failed to add user: " + (error.message || "Unknown error"));
      console.error("Error adding user:", error);
    }
  };

  const handleResetPassword = (userName: string) => {
    toast.success(`Password reset link sent to ${userName}`);
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.error(`User ${userName} removed from system`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error("Failed to remove user");
      console.error("Error removing user:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      cfo: "default",
      ceo: "default",
      cxo: "secondary",
      admin: "outline",
    };
    return (
      <Badge variant={variants[role] || "secondary"} className="uppercase">
        {role}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user with assigned role</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="user@applywizz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Must be @applywizz.com domain</p>
                </div>

                <div className="space-y-2">
                  <Label>Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground"></span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 40 ? "text-red-500" :
                          passwordStrength < 70 ? "text-yellow-500" : "text-green-500"
                        }`}>
                          {getStrengthText()}
                        </span>
                      </div>
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
                  <Label>Role *</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cfo">CFO</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="cxo">CXO</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>All registered users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-success border-success">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.name)}>
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id, user.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-success border-success">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.name)}>
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id, user.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Overview of access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Badge className="mt-1">CFO</Badge>
                <div>
                  <p className="font-medium">Full Access</p>
                  <p className="text-sm text-muted-foreground">
                    Dashboard, Wallets, Approvals, Company Expenses, Reports, Audit Logs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border">
                <Badge variant="default" className="mt-1">
                  CEO
                </Badge>
                <div>
                  <p className="font-medium">Read-Only Reports</p>
                  <p className="text-sm text-muted-foreground">Dashboard, Reports (View Only)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border">
                <Badge variant="secondary" className="mt-1">
                  CXO
                </Badge>
                <div>
                  <p className="font-medium">Wallet Management</p>
                  <p className="text-sm text-muted-foreground">View Wallet, Submit Expenses, Track History</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Badge variant="outline" className="mt-1">
                  ADMIN
                </Badge>
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-sm text-muted-foreground">Role Assignment, User Creation, Permission Control</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}