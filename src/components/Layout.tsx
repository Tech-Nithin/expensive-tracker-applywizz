import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Bell, LogOut, LayoutDashboard, Wallet, CheckSquare, Building, BarChart3, Users, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cxoUsers, setCxoUsers] = useState<any[]>([]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fetch CXO users for CFO
  useEffect(() => {
    if (user?.role === "cfo") {
      fetchCxoUsers();
    }
  }, [user]);

  const fetchCxoUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'cxo');

      if (error) {
        console.error('Error fetching CXO users:', error);
        return;
      }

      setCxoUsers(data || []);
    } catch (error) {
      console.error('Error fetching CXO users:', error);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["cfo", "ceo", "cxo"] },
    { label: "Wallets", path: "/wallets", icon: Wallet, roles: ["cfo"] },
    { label: "Approvals", path: "/approvals", icon: CheckSquare, roles: ["cfo"] },
    { label: "Company Expenses", path: "/company-expenses", icon: Building, roles: ["cfo"] },
    { label: "Reports", path: "/reports", icon: BarChart3, roles: ["cfo", "ceo"] },
    { label: "Role Management", path: "/admin", icon: Users, roles: ["admin"] },
    { label: "My Wallet", path: "/my-wallet", icon: Wallet, roles: ["cxo"] },
  ].filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ApplyWizz</h1>
                <p className="text-xs text-muted-foreground">Expense Manager</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn("gap-2", isActive && "shadow-md")}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              
              {/* CXO Dropdown for CFO users - only on desktop */}
              {user?.role === "cfo" && cxoUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Users className="w-4 h-4" />
                      CXO Users
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>CXO Team Members</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {cxoUsers.map((cxo) => (
                      <DropdownMenuItem 
                        key={cxo.id}
                        onClick={() => navigate(`/cxo/${cxo.id}`)}
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        {cxo.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            

            {/* User menu - always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>




             <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 mr-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn("gap-2", isActive && "bg-accent")}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                  
                  {/* CXO Dropdown for CFO users in mobile menu */}
                  {user?.role === "cfo" && cxoUsers.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>CXO Team Members</DropdownMenuLabel>
                      {cxoUsers.map((cxo) => (
                        <DropdownMenuItem 
                          key={cxo.id}
                          onClick={() => navigate(`/cxo/${cxo.id}`)}
                          className="gap-2"
                        >
                          <User className="w-4 h-4" />
                          {cxo.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
}