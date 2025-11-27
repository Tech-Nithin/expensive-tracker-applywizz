



// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/lib/supabaseClient";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// import { Separator } from "@/components/ui/separator";
// import { 
//   Building2, 
//   Mail, 
//   Calendar, 
//   Wallet, 
//   CreditCard, 
//   FileText, 
//   TrendingUp,
//   AlertCircle
// } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";

// interface CxoData {
//   id: string;
//   name: string;
//   email: string;
//   created_at: string;
// }

// interface WalletData {
//   total_allocated: number;
//   company_spent: number;
//   reimbursed: number;
//   balance: number;
//   proof_pending: number;
// }

// interface ExpenseData {
//   id: string;
//   category: string;
//   amount: number;
//   status: string;
//   submitted_on: string;
//   source: string;
// }

// export default function CxoProfile() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const [cxoData, setCxoData] = useState<CxoData | null>(null);
//   const [walletData, setWalletData] = useState<WalletData | null>(null);
//   const [expenses, setExpenses] = useState<ExpenseData[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user?.role !== "cfo") {
//       // Redirect if not CFO
//       return;
//     }
    
//     if (id) {
//       fetchCxoData();
//     }
//   }, [id, user]);

//   const fetchCxoData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch CXO user data
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('id, name, email, created_at')
//         .eq('id', id)
//         .eq('role', 'cxo')
//         .single();

//       if (userError) throw userError;

//       // Fetch wallet allocations data
//       const { data: allocationsData, error: allocationsError } = await supabase
//         .from('wallet_allocations')
//         .select('amount')
//         .eq('user_id', id);

//       if (allocationsError) throw allocationsError;

//       // Calculate total allocated amount
//       const total_allocated = allocationsData?.reduce((sum, allocation) => 
//         sum + (allocation.amount || 0), 0
//       ) || 0;

//       // Fetch expenses data for calculations
//       const { data: expensesData, error: expensesError } = await supabase
//         .from('expenses')
//         .select('amount, status, source')
//         .eq('user_id', id);

//       if (expensesError) throw expensesError;

//       // Calculate wallet metrics
//       const companyExpenses = expensesData?.filter(exp => exp.source === 'company') || [];
//       const personalExpenses = expensesData?.filter(exp => exp.source === 'personal') || [];
      
//       const company_spent = companyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       const reimbursed = personalExpenses
//         .filter(exp => exp.status === 'approved')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
//       const proof_pending = personalExpenses
//         .filter(exp => exp.status === 'rejected')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const balance = total_allocated - company_spent - reimbursed;

//       // Fetch recent expenses for display
//       const { data: recentExpenses, error: recentExpensesError } = await supabase
//         .from('expenses')
//         .select('id, category, amount, status, submitted_on, source')
//         .eq('user_id', id)
//         .order('submitted_on', { ascending: false })
//         .limit(5);

//       if (recentExpensesError) throw recentExpensesError;

//       setCxoData(userData);
//       setWalletData({
//         total_allocated,
//         company_spent,
//         reimbursed,
//         balance,
//         proof_pending
//       });
//       setExpenses(recentExpenses || []);
//     } catch (error) {
//       console.error('Error fetching CXO data:', error);
//       toast.error("Failed to fetch CXO data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (user?.role !== "cfo") {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
//             <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
//             <p className="mt-2 text-muted-foreground">Only CFO users can view CXO profiles.</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   if (loading) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
//             <p className="mt-4 text-muted-foreground">Loading CXO profile...</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   if (!cxoData) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
//             <h2 className="mt-4 text-2xl font-bold">CXO Not Found</h2>
//             <p className="mt-2 text-muted-foreground">The requested CXO profile could not be found.</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   const getExpenseBadgeVariant = (status: string, source: string) => {
//     if (source === 'company') {
//       return 'default';
//     }
    
//     switch (status) {
//       case "approved":
//         return "default";
//       case "rejected":
//         return "destructive";
//       case "proof_pending":
//         return "secondary";
//       default:
//         return "outline";
//     }
//   };

//   const getExpenseDisplayStatus = (status: string, source: string) => {
//     if (source === 'company') {
//       return 'company expense';
//     }
//     return status.replace("_", " ");
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">CXO Profile</h1>
//             <p className="text-muted-foreground">View detailed information about {cxoData.name}</p>
//           </div>
//           <Button onClick={() => window.history.back()}>Back to Dashboard</Button>
//         </div>

//         <div className="grid gap-6 md:grid-cols-3">
//           {/* CXO Info Card */}
//           <Card className="md:col-span-1 w-124 h-96">
//             <CardHeader>
//               <CardTitle>CXO Information</CardTitle>
//               <CardDescription>Personal and account details</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex flex-col items-center">
//                 <Avatar className="w-24 h-24">
//                   <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
//                     {cxoData.name.charAt(0)}
//                   </AvatarFallback>
//                 </Avatar>
//                 <h3 className="mt-4 text-xl font-bold">{cxoData.name}</h3>
//                 <Badge variant="secondary" className="mt-1">CXO</Badge>
//               </div>
              
//               <Separator />
              
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <Mail className="w-4 h-4 text-muted-foreground" />
//                   <span className="text-sm">{cxoData.email}</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Calendar className="w-4 h-4 text-muted-foreground" />
//                   <span className="text-sm">
//                     Joined {format(new Date(cxoData.created_at), "MMM dd, yyyy")}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Building2 className="w-4 h-4 text-muted-foreground" />
//                   <span className="text-sm">ApplyWizz Inc.</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Wallet Summary Card */}
//           <Card className="md:col-span-2 h-96 w-max">
//             <CardHeader>
//               <CardTitle>Wallet Summary</CardTitle>
//               <CardDescription>Financial overview for {cxoData.name}</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
//                 <div className="p-4 border rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <Wallet className="w-4 h-4 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">Allocated</span>
//                   </div>
//                   <p className="text-2xl font-bold mt-2">
//                     ₹{(walletData?.total_allocated || 0).toLocaleString()}
//                   </p>
//                 </div>
                
//                 <div className="p-4 border rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <CreditCard className="w-4 h-4 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">Company Spent</span>
//                   </div>
//                   <p className="text-2xl font-bold mt-2">
//                     ₹{(walletData?.company_spent || 0).toLocaleString()}
//                   </p>
//                 </div>
                
//                 <div className="p-4 border rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="w-4 h-4 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">Reimbursed</span>
//                   </div>
//                   <p className="text-2xl font-bold mt-2">
//                     ₹{(walletData?.reimbursed || 0).toLocaleString()}
//                   </p>
//                 </div>
                
//                 <div className="p-4 border rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">Proof Pending</span>
//                   </div>
//                   <p className="text-2xl font-bold mt-2">
//                     ₹{(walletData?.proof_pending || 0).toLocaleString()}
//                   </p>
//                 </div>
                
//                 <div className="p-4 border rounded-lg bg-primary/10">
//                   <div className="flex items-center gap-2">
//                     <Wallet className="w-4 h-4 text-primary" />
//                     <span className="text-sm text-primary">Balance</span>
//                   </div>
//                   <p className="text-2xl font-bold mt-2 text-primary">
//                     ₹{(walletData?.balance || 0).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Expenses */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Expenses</CardTitle>
//             <CardDescription>Latest expense submissions by {cxoData.name}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {/* {expenses.length > 0 ? (
//               <div className="space-y-4">
//                 {expenses.map((expense) => (
//                   <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
//                     <div>
//                       <h4 className="font-medium">{expense.category}</h4>
//                       <p className="text-sm text-muted-foreground">
//                         Submitted on {format(new Date(expense.submitted_on), "MMM dd, yyyy")}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <span className="font-medium">₹{expense.amount.toLocaleString()}</span>
//                       <Badge 
//                         variant={getExpenseBadgeVariant(expense.status, expense.source)}
//                       >
//                         {getExpenseDisplayStatus(expense.status, expense.source)}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex items-center justify-center p-8 text-muted-foreground">
//                 <FileText className="w-8 h-8 mr-2" />
//                 <span>No expenses found</span>
//               </div>
//             )} */}


//             {expenses.length > 0 ? (
//   <Table>
//     <TableHeader>
//       <TableRow>
//         <TableHead>Category</TableHead>
//         <TableHead>Submitted On</TableHead>
//         <TableHead className="text-right">Amount</TableHead>
//         <TableHead>Status</TableHead>
//       </TableRow>
//     </TableHeader>

//     <TableBody>
//       {expenses.map((expense) => (
//         <TableRow key={expense.id}>
//           <TableCell className="font-medium">{expense.category}</TableCell>

//           <TableCell>
//             {format(new Date(expense.submitted_on), "MMM dd, yyyy")}
//           </TableCell>

//           <TableCell className="text-right font-semibold">
//             ₹{expense.amount.toLocaleString()}
//           </TableCell>

//           <TableCell>
//             <Badge variant={getExpenseBadgeVariant(expense.status, expense.source)}>
//               {getExpenseDisplayStatus(expense.status, expense.source)}
//             </Badge>
//           </TableCell>
//         </TableRow>
//       ))}
//     </TableBody>
//   </Table>
// ) : (
//   <div className="flex items-center justify-center p-8 text-muted-foreground">
//     <FileText className="w-8 h-8 mr-2" />
//     <span>No expenses found</span>
//   </div>
// )}

//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }














































import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Mail, 
  Calendar, 
  Wallet, 
  CreditCard, 
  FileText, 
  TrendingUp,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CxoData {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface WalletData {
  total_allocated: number;
  company_spent: number;
  reimbursed: number;
  balance: number;
  proof_pending: number;
}

interface ExpenseData {
  id: string;
  category: string;
  amount: number;
  status: string;
  submitted_on: string;
  source: string;
}

export default function CxoProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [cxoData, setCxoData] = useState<CxoData | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "cfo") {
      // Redirect if not CFO
      return;
    }
    
    if (id) {
      fetchCxoData();
    }
  }, [id, user]);

  const fetchCxoData = async () => {
    try {
      setLoading(true);
      
      // Fetch CXO user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', id)
        .eq('role', 'cxo')
        .single();

      if (userError) throw userError;

      // Fetch wallet allocations data
      const { data: allocationsData, error: allocationsError } = await supabase
        .from('wallet_allocations')
        .select('amount')
        .eq('user_id', id);

      if (allocationsError) throw allocationsError;

      // Calculate total allocated amount
      const total_allocated = allocationsData?.reduce((sum, allocation) => 
        sum + (allocation.amount || 0), 0
      ) || 0;

      // Fetch expenses data for calculations
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, status, source')
        .eq('user_id', id);

      if (expensesError) throw expensesError;

      // Calculate wallet metrics
      const companyExpenses = expensesData?.filter(exp => exp.source === 'company') || [];
      const personalExpenses = expensesData?.filter(exp => exp.source === 'personal') || [];
      
      const company_spent = companyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const reimbursed = personalExpenses
        .filter(exp => exp.status === 'approved')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      const proof_pending = personalExpenses
        .filter(exp => exp.status === 'rejected')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const balance = total_allocated - company_spent - reimbursed;

      // Fetch recent expenses for display
      const { data: recentExpenses, error: recentExpensesError } = await supabase
        .from('expenses')
        .select('id, category, amount, status, submitted_on, source')
        .eq('user_id', id)
        .order('submitted_on', { ascending: false })
        .limit(5);

      if (recentExpensesError) throw recentExpensesError;

      setCxoData(userData);
      setWalletData({
        total_allocated,
        company_spent,
        reimbursed,
        balance,
        proof_pending
      });
      setExpenses(recentExpenses || []);
    } catch (error) {
      console.error('Error fetching CXO data:', error);
      toast.error("Failed to fetch CXO data");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "cfo") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">Only CFO users can view CXO profiles.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading CXO profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cxoData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">CXO Not Found</h2>
            <p className="mt-2 text-muted-foreground">The requested CXO profile could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getExpenseBadgeVariant = (status: string, source: string) => {
    if (source === 'company') {
      return 'default';
    }
    
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "proof_pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getExpenseDisplayStatus = (status: string, source: string) => {
    if (source === 'company') {
      return 'company expense';
    }
    return status.replace("_", " ");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CXO Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View detailed information about {cxoData.name}
            </p>
          </div>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            className="gap-2 w-full sm:w-auto h-9 sm:h-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 ">
          {/* CXO Info Card */}
          <Card className="lg:col-span-1 lg:w-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">CXO Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">Personal and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                  <AvatarFallback className="text-lg sm:text-xl lg:text-2xl bg-primary text-primary-foreground">
                    {cxoData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 text-lg sm:text-xl font-bold">{cxoData.name}</h3>
                <Badge variant="secondary" className="mt-1 text-xs sm:text-sm">CXO</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm break-all">{cxoData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">
                    Joined {format(new Date(cxoData.created_at), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">ApplyWizz Inc.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Summary Card */}
          <Card className="lg:col-span-2 lg:w-[900px]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Wallet Summary</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Financial overview for {cxoData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Allocated</span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2">
                    ₹{(walletData?.total_allocated || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs lg:text-sm sm:text-sm text-muted-foreground">Company Spent</span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2">
                    ₹{(walletData?.company_spent || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Reimbursed</span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2">
                    ₹{(walletData?.reimbursed || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Proof Pending</span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2">
                    ₹{(walletData?.proof_pending || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 sm:p-4 border rounded-lg bg-primary/10 col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-primary">Balance</span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2 text-primary">
                    ₹{(walletData?.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Expenses</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Latest expense submissions by {cxoData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Submitted On</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {expense.category}
                        </TableCell>
                        <TableCell className="whitespace-nowrap hidden sm:table-cell">
                          {format(new Date(expense.submitted_on), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap">
                          ₹{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge 
                            variant={getExpenseBadgeVariant(expense.status, expense.source)}
                            className="text-xs"
                          >
                            {getExpenseDisplayStatus(expense.status, expense.source)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center p-6 sm:p-8 text-muted-foreground text-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-0 sm:mr-3" />
                <span className="text-sm sm:text-base">No expenses found</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}