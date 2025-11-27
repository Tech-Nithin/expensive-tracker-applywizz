// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState, useMemo } from "react";
// import Layout from "@/components/Layout";
// import KPICard from "@/components/KPICard";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { mockWallets } from "@/lib/mockData";
// import { supabase } from "@/lib/supabaseClient";
// import { Wallet, DollarSign, TrendingUp, AlertCircle, Eye, CalendarIcon } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [userExpenses, setUserExpenses] = useState<any[]>([]); // For CXO's own expenses
//   const [userWallet, setUserWallet] = useState<any>(null); // For CXO's wallet data
//   const [walletAllocations, setWalletAllocations] = useState<any[]>([]); // For CXO wallet allocations
//   const [allWalletAllocations, setAllWalletAllocations] = useState<any[]>([]); // For CFO - all wallet allocations
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Filter expenses based on date range for both CFO and CXO dashboards
//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
    
//     // If no date range is selected, show all expenses
//     if (!dateRange.from || !dateRange.to) return expenses;
    
//     return expenses.filter(expense => {
//       const expenseDateField = expense.submittedOn || expense.submitted_on;
//       if (!expenseDateField) return false;
      
//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
//   }, [expenses, dateRange]);

//   // Filter user expenses for CXO dashboard
//   const filteredUserExpenses = useMemo(() => {
//     if (!userExpenses || !Array.isArray(userExpenses)) return [];
    
//     if (!dateRange.from || !dateRange.to) return userExpenses;
    
//     return userExpenses.filter(expense => {
//       const expenseDateField = expense.submittedOn || expense.submitted_on;
//       if (!expenseDateField) return false;
      
//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
//   }, [userExpenses, dateRange]);

//   // Filter wallet allocations based on date range for CXO dashboard
//   const filteredWalletAllocations = useMemo(() => {
//     if (!walletAllocations || !Array.isArray(walletAllocations)) return [];
    
//     if (!dateRange.from || !dateRange.to) return walletAllocations;
    
//     return walletAllocations.filter(allocation => {
//       if (!allocation.date) return false;
      
//       const allocationDate = new Date(allocation.date);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(allocationDate, { start: startDate, end: endDate });
//     });
//   }, [walletAllocations, dateRange]);

//   // Filter all wallet allocations based on date range for CFO dashboard
//   const filteredAllWalletAllocations = useMemo(() => {
//     if (!allWalletAllocations || !Array.isArray(allWalletAllocations)) return [];
    
//     if (!dateRange.from || !dateRange.to) return allWalletAllocations;
    
//     return allWalletAllocations.filter(allocation => {
//       if (!allocation.date) return false;
      
//       const allocationDate = new Date(allocation.date);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(allocationDate, { start: startDate, end: endDate });
//     });
//   }, [allWalletAllocations, dateRange]);

//   // Calculate wallet overview data based on date range for CFO
//   const filteredWalletOverview = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
//     // If no date range is selected, return original wallet data
//     if (!dateRange.from || !dateRange.to) return wallets;

//     return wallets.map(wallet => {
//       // Filter expenses for this specific user within the date range
//       const userExpensesInRange = filteredExpenses.filter(expense => 
//         expense && expense.user_id === wallet.user_id
//       );

//       // Calculate metrics based on filtered expenses
//       const companySpent = userExpensesInRange
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       const reimbursed = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       const proofPending = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       // Filter allocations for this user within the date range
//       const userAllocationsInRange = filteredAllWalletAllocations.filter(allocation => 
//         allocation && allocation.user_id === wallet.user_id
//       );

//       const allocated = userAllocationsInRange.reduce((sum, allocation) => 
//         sum + (parseFloat(allocation.amount) || 0), 0
//       );

//       // Calculate balance based on allocated amount minus company spent
//       const balance = allocated - companySpent;

//       return {
//         ...wallet,
//         allocated,
//         company_spent: companySpent,
//         reimbursed,
//         balance,
//         proof_pending: proofPending
//       };
//     });
//   }, [wallets, filteredExpenses, filteredAllWalletAllocations, dateRange]);

//   // Calculate total allocated amount based on filtered allocations for CXO
//   const filteredTotalAllocated = useMemo(() => {
//     if (!filteredWalletAllocations || !Array.isArray(filteredWalletAllocations)) return 0;
    
//     return filteredWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
//   }, [filteredWalletAllocations]);

//   // Calculate total allocated amount based on filtered allocations for CFO
//   const filteredTotalAllocatedCFO = useMemo(() => {
//     if (!filteredAllWalletAllocations || !Array.isArray(filteredAllWalletAllocations)) return 0;
    
//     return filteredAllWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
//   }, [filteredAllWalletAllocations]);

//   const handleApplyDateRange = () => {
//     setIsDateRangeOpen(false);
//   };

//   const handleClearDateRange = () => {
//     setDateRange({ from: null, to: null });
//     setIsDateRangeOpen(false);
//   };

//   // Format date range display
//   const getDateRangeDisplay = () => {
//     if (!dateRange.from && !dateRange.to) {
//       return "All Dates";
//     }
//     if (dateRange.from && dateRange.to) {
//       return `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`;
//     }
//     return "Select Date Range";
//   };

//   useEffect(() => {
//     if (!user) {
//       navigate("/");
//     } else if (user.role === "cfo") {
//       fetchWallets();
//       fetchExpenses();
//       fetchAllWalletAllocations(); // Fetch all wallet allocations for CFO
//     } else if (user.role === "cxo") {
//       fetchUserExpenses();
//       fetchUserWallet();
//       fetchWalletAllocations();
//     }
//   }, [user, navigate]);

//   const fetchWallets = async () => {
//     try {
//       // Since we don't have a wallets table, we need to calculate wallet data from allocations and expenses
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, name, role')
//         .eq('role', 'cxo');

//       if (usersError) throw usersError;

//       const { data: allocationsData, error: allocationsError } = await supabase
//         .from('wallet_allocations')
//         .select('user_id, amount');

//       if (allocationsError) throw allocationsError;

//       const { data: expensesData, error: expensesError } = await supabase
//         .from('expenses')
//         .select('user_id, amount, source, status');

//       if (expensesError) throw expensesError;

//       // Calculate wallet data for each CXO user
//       const walletData = usersData.map(user => {
//         const userAllocations = allocationsData?.filter(allocation => allocation.user_id === user.id) || [];
//         const userExpenses = expensesData?.filter(expense => expense.user_id === user.id) || [];

//         const allocated = userAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
        
//         const companySpent = userExpenses
//           .filter(expense => expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const reimbursed = userExpenses
//           .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const proofPending = userExpenses
//           .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const balance = allocated - companySpent - reimbursed;

//         return {
//           user_id: user.id,
//           users: { name: user.name },
//           allocated,
//           company_spent: companySpent,
//           reimbursed,
//           balance,
//           proof_pending: proofPending
//         };
//       });

//       setWallets(walletData);
//     } catch (err) {
//       console.error('Error fetching wallet data:', err);
//       toast.error("Failed to fetch wallet data");
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*');

//       if (error) throw error;
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expense data");
//     }
//   };

//   const fetchUserExpenses = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*')
//         .eq('user_id', user.id);

//       if (error) throw error;
//       setUserExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching user expenses:', err);
//     }
//   };

//   const fetchUserWallet = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('wallets')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();

//       if (error) {
//         console.error('Error fetching user wallet:', error);
//         return;
//       }

//       setUserWallet(data);
//     } catch (err) {
//       console.error('Error fetching user wallet:', err);
//     }
//   };

//   const fetchWalletAllocations = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select('*')
//         .eq('user_id', user.id);

//       if (error) {
//         console.error('Error fetching wallet allocations:', error);
//         return;
//       }

//       setWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching wallet allocations:', err);
//     }
//   };

//   const fetchAllWalletAllocations = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select(`
//           *,
//           users (name)
//         `);

//       if (error) {
//         console.error('Error fetching all wallet allocations:', error);
//         return;
//       }

//       setAllWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching all wallet allocations:', err);
//     }
//   };

//   if (!user) return null;

//   // Calculate KPIs based on user role with proper handling for empty data
//   let totalAllocated = 0;
//   let totalCompanySpent = 0;
//   let totalReimbursed = 0;
//   let totalProofPending = 0;

//   if (user.role === "cfo") {
//     // Use filtered expenses for CFO when date range is selected
//     const expensesToUse = dateRange.from && dateRange.to ? filteredExpenses : expenses;
//     const walletOverviewToUse = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;
    
//     // CFO sees aggregated data directly from expenses table
//     // Total Allocated = Sum of all wallet allocations within date range
//     totalAllocated = dateRange.from && dateRange.to 
//       ? filteredTotalAllocatedCFO
//       : allWalletAllocations && Array.isArray(allWalletAllocations) && allWalletAllocations.length > 0 
//         ? allWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0)
//         : 0;
      
//     // Company Spend = Sum of ALL company source expenses (regardless of status)
//     totalCompanySpent = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
      
//     // Reimbursements Paid = Sum of approved personal expenses
//     totalReimbursed = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
      
//     // Pending Proofs = Sum of proof_pending personal expenses (matching MyWallet logic)
//     totalProofPending = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
//   } else if (user.role === "cxo") {
//     // CXO sees only their own expense data from filtered user expenses
    
//     // Company Spend = Sum of ALL company source expenses (regardless of status)
//     totalCompanySpent = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
    
//     // Reimbursements Paid = Sum of approved personal expenses
//     totalReimbursed = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
    
//     // Total Wallets Distributed = Sum of wallet allocations within the selected date range
//     totalAllocated = filteredTotalAllocated || 0;
    
//     // Pending Proofs = Sum of proof_pending personal expenses
//     totalProofPending = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
//   }

//   // Chart data with proper handling for empty data
//   const spendData = [
//     { name: "Company", value: totalCompanySpent || 0 },
//     { name: "Reimbursements", value: totalReimbursed || 0 },
//   ];

//   const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

//   const monthlyData = [
//     { month: "Nov", amount: 85000 },
//     { month: "Dec", amount: 120000 },
//     { month: "Jan", amount: (totalCompanySpent || 0) + (totalReimbursed || 0) },
//   ];

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
//       approved: "default",
//       pending: "secondary",
//       rejected: "destructive",
//       proof_pending: "outline",
//     };
//     return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
//   };

//   // Determine which wallet data to use for the table
//   const walletTableData = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">
//               {user.role === "cfo" ? "CFO Dashboard" : user.role === "ceo" ? "CEO Dashboard" : "CXO Dashboard"}
//             </h1>
//             <p className="text-muted-foreground">Welcome back, {user.name}</p>
//           </div>
          
//           {/* Date Range Selector for both CFO and CXO */}
//           {(user.role === "cfo" || user.role === "cxo") && (
//             <div>
//               <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {getDateRangeDisplay()}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-4" align="end">
//                   <div className="space-y-4">
//                     <div className="text-sm font-medium">Date Range</div>
                    
//                     <div className="space-y-3">
//                       <div className="space-y-2">
//                         <Label htmlFor="start-date" className="text-xs text-muted-foreground">
//                           Start Date
//                         </Label>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className="w-full justify-start text-left font-normal h-9"
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={dateRange.from || undefined}
//                               onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || null }))}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                       </div>

//                       <div className="space-y-2">
//                         <Label htmlFor="end-date" className="text-xs text-muted-foreground">
//                           End Date
//                         </Label>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className="w-full justify-start text-left font-normal h-9"
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={dateRange.to || undefined}
//                               onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || null }))}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                       </div>
//                     </div>

//                     <div className="flex gap-2 pt-2">
//                       <Button 
//                         variant="outline" 
//                         size="sm" 
//                         className="flex-1" 
//                         onClick={handleClearDateRange}
//                       >
//                         Clear
//                       </Button>
//                       <Button 
//                         size="sm" 
//                         className="flex-1" 
//                         onClick={handleApplyDateRange}
//                         disabled={!dateRange.from || !dateRange.to}
//                       >
//                         Apply
//                       </Button>
//                     </div>
//                   </div>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           )}
//         </div>

//         {/* KPI Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <KPICard
//             title="Total Wallets Distributed"
//             value={`₹${totalAllocated.toLocaleString()}`}
//             icon={Wallet}
//             trend="+12% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Company Spend"
//             value={`₹${totalCompanySpent.toLocaleString()}`}
//             icon={DollarSign}
//             trend="+8% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Reimbursements Paid"
//             value={`₹${totalReimbursed.toLocaleString()}`}
//             icon={TrendingUp}
//             trend="+5% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Pending Proofs"
//             value={`₹${totalProofPending.toLocaleString()}`}
//             icon={AlertCircle}
//             className="border-warning"
//           />
//         </div>

//         {/* Wallet Overview Table */}
//         {user.role === "cfo" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Wallet Overview {dateRange.from && dateRange.to 
//                   ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                   : ''}
//               </CardTitle>
//               <CardDescription>
//                 {dateRange.from && dateRange.to 
//                   ? `Wallet activity for selected date range` 
//                   : 'Current status of all CXO wallets'}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Allocated</TableHead>
//                     <TableHead className="text-right">Company Spent</TableHead>
//                     <TableHead className="text-right">Reimbursed</TableHead>
//                     <TableHead className="text-right">Balance</TableHead>
//                     <TableHead className="text-right">Proof Pending</TableHead>
//                     <TableHead></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {walletTableData && Array.isArray(walletTableData) && walletTableData.length > 0 ? (
//                     walletTableData.map((wallet) => (
//                       <TableRow key={wallet.user_id}>
//                         <TableCell className="font-medium">{wallet.users?.name || 'Unknown User'}</TableCell>
//                         <TableCell className="text-right">₹{wallet.allocated?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right">₹{wallet.company_spent?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right">₹{wallet.reimbursed?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right font-semibold">₹{wallet.balance?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right text-warning">₹{wallet.proof_pending?.toLocaleString() || 0}</TableCell>
//                         <TableCell>
//                           <Button variant="ghost" size="sm" onClick={() => navigate(`/wallets`)}>
//                             <Eye className="w-4 h-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to ? 'No wallet activity found for selected date range' : 'No wallet data available'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         )}

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Spend Distribution</CardTitle>
//               <CardDescription>Company vs Reimbursed expenses</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={spendData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {spendData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Expense Trend</CardTitle>
//               <CardDescription>Last 3 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={monthlyData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="amount" fill="hsl(var(--primary))" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Expenses */}
//         {user.role === "cfo" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Recent Expense Submissions {dateRange.from && dateRange.to 
//                   ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                   : ''}
//               </CardTitle>
//               <CardDescription>
//                 Latest expense requests requiring attention {dateRange.from && dateRange.to ? 'for selected date range' : ''}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Expense ID</TableHead>
//                     <TableHead>User</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Source</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Submitted</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredExpenses && filteredExpenses.length > 0 ? (
//                     filteredExpenses.slice(0, 5).map((expense) => (
//                       <TableRow key={expense.id}>
//                         <TableCell className="font-mono">{expense.id?.substring(0, 8) || 'N/A'}</TableCell>
//                         <TableCell className="font-medium">{expense.userName || 'Unknown User'}</TableCell>
//                         <TableCell className="font-medium">{expense.category || 'N/A'}</TableCell>
//                         <TableCell>
//                           <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                             {expense.source === "company" ? "Company" : "Personal"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right font-semibold">₹{(expense.amount || 0).toLocaleString()}</TableCell>
//                         <TableCell>{getStatusBadge(expense.status)}</TableCell>
//                         <TableCell>
//                           {expense.submittedOn ? new Date(expense.submittedOn).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to ? 'No expenses found for selected date range' : 'Recent expenses will appear here after users submit them'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//               <div className="mt-4 flex justify-end">
//                 <Button onClick={() => navigate("/approvals")}>View All Approvals</Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </Layout>
//   );
// }















































// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState, useMemo } from "react";
// import Layout from "@/components/Layout";
// import KPICard from "@/components/KPICard";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { mockWallets } from "@/lib/mockData";
// import { supabase } from "@/lib/supabaseClient";
// import { Wallet, DollarSign, TrendingUp, AlertCircle, Eye, CalendarIcon } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [userExpenses, setUserExpenses] = useState<any[]>([]); // For CXO's own expenses
//   const [userWallet, setUserWallet] = useState<any>(null); // For CXO's wallet data
//   const [walletAllocations, setWalletAllocations] = useState<any[]>([]); // For CXO wallet allocations
//   const [allWalletAllocations, setAllWalletAllocations] = useState<any[]>([]); // For CFO - all wallet allocations
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Filter expenses based on date range for both CFO and CXO dashboards
//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
    
//     // If no date range is selected, show all expenses
//     if (!dateRange.from || !dateRange.to) return expenses;
    
//     return expenses.filter(expense => {
//       const expenseDateField = expense.submittedOn || expense.submitted_on;
//       if (!expenseDateField) return false;
      
//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
//   }, [expenses, dateRange]);

//   // Filter user expenses for CXO dashboard
//   const filteredUserExpenses = useMemo(() => {
//     if (!userExpenses || !Array.isArray(userExpenses)) return [];
    
//     if (!dateRange.from || !dateRange.to) return userExpenses;
    
//     return userExpenses.filter(expense => {
//       const expenseDateField = expense.submittedOn || expense.submitted_on;
//       if (!expenseDateField) return false;
      
//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
//   }, [userExpenses, dateRange]);

//   // Filter wallet allocations based on date range for CXO dashboard
//   const filteredWalletAllocations = useMemo(() => {
//     if (!walletAllocations || !Array.isArray(walletAllocations)) return [];
    
//     if (!dateRange.from || !dateRange.to) return walletAllocations;
    
//     return walletAllocations.filter(allocation => {
//       if (!allocation.date) return false;
      
//       const allocationDate = new Date(allocation.date);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(allocationDate, { start: startDate, end: endDate });
//     });
//   }, [walletAllocations, dateRange]);

//   // Filter all wallet allocations based on date range for CFO dashboard
//   const filteredAllWalletAllocations = useMemo(() => {
//     if (!allWalletAllocations || !Array.isArray(allWalletAllocations)) return [];
    
//     if (!dateRange.from || !dateRange.to) return allWalletAllocations;
    
//     return allWalletAllocations.filter(allocation => {
//       if (!allocation.date) return false;
      
//       const allocationDate = new Date(allocation.date);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(allocationDate, { start: startDate, end: endDate });
//     });
//   }, [allWalletAllocations, dateRange]);

//   // Calculate wallet overview data based on date range for CFO
//   const filteredWalletOverview = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
//     // If no date range is selected, return original wallet data
//     if (!dateRange.from || !dateRange.to) return wallets;

//     return wallets.map(wallet => {
//       // Filter expenses for this specific user within the date range
//       const userExpensesInRange = filteredExpenses.filter(expense => 
//         expense && expense.user_id === wallet.user_id
//       );

//       // Calculate metrics based on filtered expenses
//       const companySpent = userExpensesInRange
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       const reimbursed = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       const proofPending = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       // Filter allocations for this user within the date range
//       const userAllocationsInRange = filteredAllWalletAllocations.filter(allocation => 
//         allocation && allocation.user_id === wallet.user_id
//       );

//       const allocated = userAllocationsInRange.reduce((sum, allocation) => 
//         sum + (parseFloat(allocation.amount) || 0), 0
//       );

//       // Calculate balance based on allocated amount minus company spent
//       const balance = allocated - companySpent;

//       return {
//         ...wallet,
//         allocated,
//         company_spent: companySpent,
//         reimbursed,
//         balance,
//         proof_pending: proofPending
//       };
//     });
//   }, [wallets, filteredExpenses, filteredAllWalletAllocations, dateRange]);

//   // Calculate total allocated amount based on filtered allocations for CXO
//   const filteredTotalAllocated = useMemo(() => {
//     if (!filteredWalletAllocations || !Array.isArray(filteredWalletAllocations)) return 0;
    
//     return filteredWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
//   }, [filteredWalletAllocations]);

//   // Calculate total allocated amount based on filtered allocations for CFO
//   const filteredTotalAllocatedCFO = useMemo(() => {
//     if (!filteredAllWalletAllocations || !Array.isArray(filteredAllWalletAllocations)) return 0;
    
//     return filteredAllWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
//   }, [filteredAllWalletAllocations]);

//   const handleApplyDateRange = () => {
//     setIsDateRangeOpen(false);
//   };

//   const handleClearDateRange = () => {
//     setDateRange({ from: null, to: null });
//     setIsDateRangeOpen(false);
//   };

//   // Format date range display
//   const getDateRangeDisplay = () => {
//     if (!dateRange.from && !dateRange.to) {
//       return "All Dates";
//     }
//     if (dateRange.from && dateRange.to) {
//       return `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`;
//     }
//     return "Select Date Range";
//   };

//   useEffect(() => {
//     if (!user) {
//       navigate("/");
//     } else if (user.role === "cfo") {
//       fetchWallets();
//       fetchExpenses();
//       fetchAllWalletAllocations(); // Fetch all wallet allocations for CFO
//     } else if (user.role === "cxo") {
//       fetchUserExpenses();
//       fetchUserWallet();
//       fetchWalletAllocations();
//     }
//   }, [user, navigate]);

//   const fetchWallets = async () => {
//     try {
//       // Since we don't have a wallets table, we need to calculate wallet data from allocations and expenses
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, name, role')
//         .eq('role', 'cxo');

//       if (usersError) throw usersError;

//       const { data: allocationsData, error: allocationsError } = await supabase
//         .from('wallet_allocations')
//         .select('user_id, amount');

//       if (allocationsError) throw allocationsError;

//       const { data: expensesData, error: expensesError } = await supabase
//         .from('expenses')
//         .select('user_id, amount, source, status');

//       if (expensesError) throw expensesError;

//       // Calculate wallet data for each CXO user
//       const walletData = usersData.map(user => {
//         const userAllocations = allocationsData?.filter(allocation => allocation.user_id === user.id) || [];
//         const userExpenses = expensesData?.filter(expense => expense.user_id === user.id) || [];

//         const allocated = userAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
        
//         const companySpent = userExpenses
//           .filter(expense => expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const reimbursed = userExpenses
//           .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const proofPending = userExpenses
//           .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//         const balance = allocated - companySpent - reimbursed;

//         return {
//           user_id: user.id,
//           users: { name: user.name },
//           allocated,
//           company_spent: companySpent,
//           reimbursed,
//           balance,
//           proof_pending: proofPending
//         };
//       });

//       setWallets(walletData);
//     } catch (err) {
//       console.error('Error fetching wallet data:', err);
//       toast.error("Failed to fetch wallet data");
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*');

//       if (error) throw error;
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expense data");
//     }
//   };

//   const fetchUserExpenses = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*')
//         .eq('user_id', user.id);

//       if (error) throw error;
//       setUserExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching user expenses:', err);
//     }
//   };

//   const fetchUserWallet = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('wallets')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();

//       if (error) {
//         console.error('Error fetching user wallet:', error);
//         return;
//       }

//       setUserWallet(data);
//     } catch (err) {
//       console.error('Error fetching user wallet:', err);
//     }
//   };

//   const fetchWalletAllocations = async () => {
//     try {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select('*')
//         .eq('user_id', user.id);

//       if (error) {
//         console.error('Error fetching wallet allocations:', error);
//         return;
//       }

//       setWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching wallet allocations:', err);
//     }
//   };

//   const fetchAllWalletAllocations = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select(`
//           *,
//           users (name)
//         `);

//       if (error) {
//         console.error('Error fetching all wallet allocations:', error);
//         return;
//       }

//       setAllWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching all wallet allocations:', err);
//     }
//   };

//   if (!user) return null;

//   // Calculate KPIs based on user role with proper handling for empty data
//   let totalAllocated = 0;
//   let totalCompanySpent = 0;
//   let totalReimbursed = 0;
//   let totalProofPending = 0;

//   if (user.role === "cfo") {
//     // Use filtered expenses for CFO when date range is selected
//     const expensesToUse = dateRange.from && dateRange.to ? filteredExpenses : expenses;
//     const walletOverviewToUse = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;
    
//     // CFO sees aggregated data directly from expenses table
//     // Total Allocated = Sum of all wallet allocations within date range
//     totalAllocated = dateRange.from && dateRange.to 
//       ? filteredTotalAllocatedCFO
//       : allWalletAllocations && Array.isArray(allWalletAllocations) && allWalletAllocations.length > 0 
//         ? allWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0)
//         : 0;
      
//     // Company Spend = Sum of ALL company source expenses (regardless of status)
//     totalCompanySpent = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
      
//     // Reimbursements Paid = Sum of approved personal expenses
//     totalReimbursed = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
      
//     // Pending Proofs = Sum of proof_pending personal expenses (matching MyWallet logic)
//     totalProofPending = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
//       ? expensesToUse
//           .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
//   } else if (user.role === "cxo") {
//     // CXO sees only their own expense data from filtered user expenses
    
//     // Company Spend = Sum of ALL company source expenses (regardless of status)
//     totalCompanySpent = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.source === 'company')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
    
//     // Reimbursements Paid = Sum of approved personal expenses
//     totalReimbursed = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
    
//     // Total Wallets Distributed = Sum of wallet allocations within the selected date range
//     totalAllocated = filteredTotalAllocated || 0;
    
//     // Pending Proofs = Sum of proof_pending personal expenses
//     totalProofPending = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
//       ? filteredUserExpenses
//           .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
//           .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
//       : 0;
//   }

//   // Chart data with proper handling for empty data
//   const spendData = [
//     { name: "Company", value: totalCompanySpent || 0 },
//     { name: "Reimbursements", value: totalReimbursed || 0 },
//   ];

//   const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

//   const monthlyData = [
//     { month: "Nov", amount: 85000 },
//     { month: "Dec", amount: 120000 },
//     { month: "Jan", amount: (totalCompanySpent || 0) + (totalReimbursed || 0) },
//   ];

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
//       approved: "default",
//       pending: "secondary",
//       rejected: "destructive",
//       proof_pending: "outline",
//     };
//     return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
//   };

//   // Determine which wallet data to use for the table
//   const walletTableData = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         {/* Header Section */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">
//               {user.role === "cfo" ? "CFO Dashboard" : user.role === "ceo" ? "CEO Dashboard" : "CXO Dashboard"}
//             </h1>
//             <p className="text-muted-foreground">Welcome back, {user.name}</p>
//           </div>
          
//           {/* Date Range Selector - Desktop (hidden on mobile) */}
//           {(user.role === "cfo" || user.role === "cxo") && (
//             <div className="hidden sm:block">
//               <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {getDateRangeDisplay()}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-4" align="end">
//                   <div className="space-y-4">
//                     <div className="text-sm font-medium">Date Range</div>
                    
//                     <div className="space-y-3">
//                       <div className="space-y-2">
//                         <Label htmlFor="start-date" className="text-xs text-muted-foreground">
//                           Start Date
//                         </Label>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className="w-full justify-start text-left font-normal h-9"
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={dateRange.from || undefined}
//                               onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || null }))}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                       </div>

//                       <div className="space-y-2">
//                         <Label htmlFor="end-date" className="text-xs text-muted-foreground">
//                           End Date
//                         </Label>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className="w-full justify-start text-left font-normal h-9"
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={dateRange.to || undefined}
//                               onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || null }))}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                       </div>
//                     </div>

//                     <div className="flex gap-2 pt-2">
//                       <Button 
//                         variant="outline" 
//                         size="sm" 
//                         className="flex-1" 
//                         onClick={handleClearDateRange}
//                       >
//                         Clear
//                       </Button>
//                       <Button 
//                         size="sm" 
//                         className="flex-1" 
//                         onClick={handleApplyDateRange}
//                         disabled={!dateRange.from || !dateRange.to}
//                       >
//                         Apply
//                       </Button>
//                     </div>
//                   </div>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           )}
//         </div>

//         {/* Date Range Selector - Mobile (shown above KPI cards) */}
//         {(user.role === "cfo" || user.role === "cxo") && (
//           <div className="sm:hidden">
//             <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {getDateRangeDisplay()}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-full p-4" align="start">
//                 <div className="space-y-4">
//                   <div className="text-sm font-medium">Date Range</div>
                  
//                   <div className="space-y-3">
//                     <div className="space-y-2">
//                       <Label htmlFor="start-date" className="text-xs text-muted-foreground">
//                         Start Date
//                       </Label>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             className="w-full justify-start text-left font-normal h-9"
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={dateRange.from || undefined}
//                             onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || null }))}
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="end-date" className="text-xs text-muted-foreground">
//                         End Date
//                       </Label>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             className="w-full justify-start text-left font-normal h-9"
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={dateRange.to || undefined}
//                             onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || null }))}
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       className="flex-1" 
//                       onClick={handleClearDateRange}
//                     >
//                       Clear
//                     </Button>
//                     <Button 
//                       size="sm" 
//                       className="flex-1" 
//                       onClick={handleApplyDateRange}
//                       disabled={!dateRange.from || !dateRange.to}
//                     >
//                       Apply
//                     </Button>
//                   </div>
//                 </div>
//               </PopoverContent>
//             </Popover>
//           </div>
//         )}

//         {/* KPI Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <KPICard
//             title="Total Wallets Distributed"
//             value={`₹${totalAllocated.toLocaleString()}`}
//             icon={Wallet}
//             trend="+12% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Company Spend"
//             value={`₹${totalCompanySpent.toLocaleString()}`}
//             icon={DollarSign}
//             trend="+8% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Reimbursements Paid"
//             value={`₹${totalReimbursed.toLocaleString()}`}
//             icon={TrendingUp}
//             trend="+5% from last month"
//             trendUp
//           />
//           <KPICard
//             title="Pending Proofs"
//             value={`₹${totalProofPending.toLocaleString()}`}
//             icon={AlertCircle}
//             className="border-warning"
//           />
//         </div>

//         {/* Wallet Overview Table */}
//         {user.role === "cfo" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Wallet Overview {dateRange.from && dateRange.to 
//                   ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                   : ''}
//               </CardTitle>
//               <CardDescription>
//                 {dateRange.from && dateRange.to 
//                   ? `Wallet activity for selected date range` 
//                   : 'Current status of all CXO wallets'}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Allocated</TableHead>
//                     <TableHead className="text-right">Company Spent</TableHead>
//                     <TableHead className="text-right">Reimbursed</TableHead>
//                     <TableHead className="text-right">Balance</TableHead>
//                     <TableHead className="text-right">Proof Pending</TableHead>
//                     <TableHead></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {walletTableData && Array.isArray(walletTableData) && walletTableData.length > 0 ? (
//                     walletTableData.map((wallet) => (
//                       <TableRow key={wallet.user_id}>
//                         <TableCell className="font-medium">{wallet.users?.name || 'Unknown User'}</TableCell>
//                         <TableCell className="text-right">₹{wallet.allocated?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right">₹{wallet.company_spent?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right">₹{wallet.reimbursed?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right font-semibold">₹{wallet.balance?.toLocaleString() || 0}</TableCell>
//                         <TableCell className="text-right text-warning">₹{wallet.proof_pending?.toLocaleString() || 0}</TableCell>
//                         <TableCell>
//                           <Button variant="ghost" size="sm" onClick={() => navigate(`/wallets`)}>
//                             <Eye className="w-4 h-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to ? 'No wallet activity found for selected date range' : 'No wallet data available'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         )}

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Spend Distribution</CardTitle>
//               <CardDescription>Company vs Reimbursed expenses</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={spendData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {spendData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Expense Trend</CardTitle>
//               <CardDescription>Last 3 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={monthlyData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="amount" fill="hsl(var(--primary))" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Expenses */}
//         {user.role === "cfo" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Recent Expense Submissions {dateRange.from && dateRange.to 
//                   ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                   : ''}
//               </CardTitle>
//               <CardDescription>
//                 Latest expense requests requiring attention {dateRange.from && dateRange.to ? 'for selected date range' : ''}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Expense ID</TableHead>
//                     <TableHead>User</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Source</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Submitted</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredExpenses && filteredExpenses.length > 0 ? (
//                     filteredExpenses.slice(0, 5).map((expense) => (
//                       <TableRow key={expense.id}>
//                         <TableCell className="font-mono">{expense.id?.substring(0, 8) || 'N/A'}</TableCell>
//                         <TableCell className="font-medium">{expense.userName || 'Unknown User'}</TableCell>
//                         <TableCell className="font-medium">{expense.category || 'N/A'}</TableCell>
//                         <TableCell>
//                           <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                             {expense.source === "company" ? "Company" : "Personal"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right font-semibold">₹{(expense.amount || 0).toLocaleString()}</TableCell>
//                         <TableCell>{getStatusBadge(expense.status)}</TableCell>
//                         <TableCell>
//                           {expense.submittedOn ? new Date(expense.submittedOn).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to ? 'No expenses found for selected date range' : 'Recent expenses will appear here after users submit them'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//               <div className="mt-4 flex justify-end">
//                 <Button onClick={() => navigate("/approvals")}>View All Approvals</Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </Layout>
//   );
// }



























































import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import KPICard from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { mockWallets } from "@/lib/mockData";
import { supabase } from "@/lib/supabaseClient";
import { Wallet, DollarSign, TrendingUp, AlertCircle, Eye, CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [userExpenses, setUserExpenses] = useState<any[]>([]); // For CXO's own expenses
  const [userWallet, setUserWallet] = useState<any>(null); // For CXO's wallet data
  const [walletAllocations, setWalletAllocations] = useState<any[]>([]); // For CXO wallet allocations
  const [allWalletAllocations, setAllWalletAllocations] = useState<any[]>([]); // For CFO - all wallet allocations
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Filter expenses based on date range for both CFO and CXO dashboards
  const filteredExpenses = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return [];
    
    // If no date range is selected, show all expenses
    if (!dateRange.from || !dateRange.to) return expenses;
    
    return expenses.filter(expense => {
      const expenseDateField = expense.submittedOn || expense.submitted_on;
      if (!expenseDateField) return false;
      
      const expenseDate = new Date(expenseDateField);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
  }, [expenses, dateRange]);

  // Filter user expenses for CXO dashboard
  const filteredUserExpenses = useMemo(() => {
    if (!userExpenses || !Array.isArray(userExpenses)) return [];
    
    if (!dateRange.from || !dateRange.to) return userExpenses;
    
    return userExpenses.filter(expense => {
      const expenseDateField = expense.submittedOn || expense.submitted_on;
      if (!expenseDateField) return false;
      
      const expenseDate = new Date(expenseDateField);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
  }, [userExpenses, dateRange]);

  // Filter wallet allocations based on date range for CXO dashboard
  const filteredWalletAllocations = useMemo(() => {
    if (!walletAllocations || !Array.isArray(walletAllocations)) return [];
    
    if (!dateRange.from || !dateRange.to) return walletAllocations;
    
    return walletAllocations.filter(allocation => {
      if (!allocation.date) return false;
      
      const allocationDate = new Date(allocation.date);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(allocationDate, { start: startDate, end: endDate });
    });
  }, [walletAllocations, dateRange]);

  // Filter all wallet allocations based on date range for CFO dashboard
  const filteredAllWalletAllocations = useMemo(() => {
    if (!allWalletAllocations || !Array.isArray(allWalletAllocations)) return [];
    
    if (!dateRange.from || !dateRange.to) return allWalletAllocations;
    
    return allWalletAllocations.filter(allocation => {
      if (!allocation.date) return false;
      
      const allocationDate = new Date(allocation.date);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(allocationDate, { start: startDate, end: endDate });
    });
  }, [allWalletAllocations, dateRange]);

  // Calculate wallet overview data based on date range for CFO
  const filteredWalletOverview = useMemo(() => {
    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
    // If no date range is selected, return original wallet data
    if (!dateRange.from || !dateRange.to) return wallets;

    return wallets.map(wallet => {
      // Filter expenses for this specific user within the date range
      const userExpensesInRange = filteredExpenses.filter(expense => 
        expense && expense.user_id === wallet.user_id
      );

      // Calculate metrics based on filtered expenses
      const companySpent = userExpensesInRange
        .filter(expense => expense.source === 'company')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      const reimbursed = userExpensesInRange
        .filter(expense => expense.source === 'personal' && expense.status === 'approved')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      const proofPending = userExpensesInRange
        .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      // Filter allocations for this user within the date range
      const userAllocationsInRange = filteredAllWalletAllocations.filter(allocation => 
        allocation && allocation.user_id === wallet.user_id
      );

      const allocated = userAllocationsInRange.reduce((sum, allocation) => 
        sum + (parseFloat(allocation.amount) || 0), 0
      );

      // Calculate balance based on allocated amount minus company spent
      const balance = allocated - companySpent;

      return {
        ...wallet,
        allocated,
        company_spent: companySpent,
        reimbursed,
        balance,
        proof_pending: proofPending
      };
    });
  }, [wallets, filteredExpenses, filteredAllWalletAllocations, dateRange]);

  // Calculate total allocated amount based on filtered allocations for CXO
  const filteredTotalAllocated = useMemo(() => {
    if (!filteredWalletAllocations || !Array.isArray(filteredWalletAllocations)) return 0;
    
    return filteredWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
  }, [filteredWalletAllocations]);

  // Calculate total allocated amount based on filtered allocations for CFO
  const filteredTotalAllocatedCFO = useMemo(() => {
    if (!filteredAllWalletAllocations || !Array.isArray(filteredAllWalletAllocations)) return 0;
    
    return filteredAllWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
  }, [filteredAllWalletAllocations]);

  const handleApplyDateRange = () => {
    setIsDateRangeOpen(false);
  };

  const handleClearDateRange = () => {
    setDateRange({ from: null, to: null });
    setIsDateRangeOpen(false);
  };

  // Format date range display
  const getDateRangeDisplay = () => {
    if (!dateRange.from && !dateRange.to) {
      return "All Dates";
    }
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`;
    }
    return "Select Date Range";
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.role === "cfo") {
      fetchWallets();
      fetchExpenses();
      fetchAllWalletAllocations(); // Fetch all wallet allocations for CFO
    } else if (user.role === "cxo") {
      fetchUserExpenses();
      fetchUserWallet();
      fetchWalletAllocations();
    }
  }, [user, navigate]);

  const fetchWallets = async () => {
    try {
      // Since we don't have a wallets table, we need to calculate wallet data from allocations and expenses
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'cxo');

      if (usersError) throw usersError;

      const { data: allocationsData, error: allocationsError } = await supabase
        .from('wallet_allocations')
        .select('user_id, amount');

      if (allocationsError) throw allocationsError;

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('user_id, amount, source, status');

      if (expensesError) throw expensesError;

      // Calculate wallet data for each CXO user
      const walletData = usersData.map(user => {
        const userAllocations = allocationsData?.filter(allocation => allocation.user_id === user.id) || [];
        const userExpenses = expensesData?.filter(expense => expense.user_id === user.id) || [];

        const allocated = userAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
        
        const companySpent = userExpenses
          .filter(expense => expense.source === 'company')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

        const reimbursed = userExpenses
          .filter(expense => expense.source === 'personal' && expense.status === 'approved')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

        const proofPending = userExpenses
          .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

        const balance = allocated - companySpent - reimbursed;

        return {
          user_id: user.id,
          users: { name: user.name },
          allocated,
          company_spent: companySpent,
          reimbursed,
          balance,
          proof_pending: proofPending
        };
      });

      setWallets(walletData);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      toast.error("Failed to fetch wallet data");
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error("Failed to fetch expense data");
    }
  };

  const fetchUserExpenses = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserExpenses(data || []);
    } catch (err) {
      console.error('Error fetching user expenses:', err);
    }
  };

  const fetchUserWallet = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user wallet:', error);
        return;
      }

      setUserWallet(data);
    } catch (err) {
      console.error('Error fetching user wallet:', err);
    }
  };

  const fetchWalletAllocations = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('wallet_allocations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wallet allocations:', error);
        return;
      }

      setWalletAllocations(data || []);
    } catch (err) {
      console.error('Error fetching wallet allocations:', err);
    }
  };

  const fetchAllWalletAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_allocations')
        .select(`
          *,
          users (name)
        `);

      if (error) {
        console.error('Error fetching all wallet allocations:', error);
        return;
      }

      setAllWalletAllocations(data || []);
    } catch (err) {
      console.error('Error fetching all wallet allocations:', err);
    }
  };

  if (!user) return null;

  // Calculate KPIs based on user role with proper handling for empty data
  let totalAllocated = 0;
  let totalCompanySpent = 0;
  let totalReimbursed = 0;
  let totalProofPending = 0;

  if (user.role === "cfo") {
    // Use filtered expenses for CFO when date range is selected
    const expensesToUse = dateRange.from && dateRange.to ? filteredExpenses : expenses;
    const walletOverviewToUse = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;
    
    // CFO sees aggregated data directly from expenses table
    // Total Allocated = Sum of all wallet allocations within date range
    totalAllocated = dateRange.from && dateRange.to 
      ? filteredTotalAllocatedCFO
      : allWalletAllocations && Array.isArray(allWalletAllocations) && allWalletAllocations.length > 0 
        ? allWalletAllocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0)
        : 0;
      
    // Company Spend = Sum of ALL company source expenses (regardless of status)
    totalCompanySpent = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
      ? expensesToUse
          .filter(expense => expense && expense.source === 'company')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
      
    // Reimbursements Paid = Sum of approved personal expenses
    totalReimbursed = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
      ? expensesToUse
          .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
      
    // Pending Proofs = Sum of proof_pending personal expenses (matching MyWallet logic)
    totalProofPending = expensesToUse && Array.isArray(expensesToUse) && expensesToUse.length > 0
      ? expensesToUse
          .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
  } else if (user.role === "cxo") {
    // CXO sees only their own expense data from filtered user expenses
    
    // Company Spend = Sum of ALL company source expenses (regardless of status)
    totalCompanySpent = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
      ? filteredUserExpenses
          .filter(expense => expense && expense.source === 'company')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
    
    // Reimbursements Paid = Sum of approved personal expenses
    totalReimbursed = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
      ? filteredUserExpenses
          .filter(expense => expense && expense.status === 'approved' && expense.source === 'personal')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
    
    // Total Wallets Distributed = Sum of wallet allocations within the selected date range
    totalAllocated = filteredTotalAllocated || 0;
    
    // Pending Proofs = Sum of proof_pending personal expenses
    totalProofPending = filteredUserExpenses && Array.isArray(filteredUserExpenses) && filteredUserExpenses.length > 0
      ? filteredUserExpenses
          .filter(expense => expense && expense.status === 'rejected' && expense.source === 'personal')
          .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      : 0;
  }

  // Chart data with proper handling for empty data
  const spendData = [
    { name: "Company", value: totalCompanySpent || 0 },
    { name: "Reimbursements", value: totalReimbursed || 0 },
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

  const monthlyData = [
    { month: "Nov", amount: 85000 },
    { month: "Dec", amount: 120000 },
    { month: "Jan", amount: (totalCompanySpent || 0) + (totalReimbursed || 0) },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      proof_pending: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  // Determine which wallet data to use for the table
  const walletTableData = dateRange.from && dateRange.to ? filteredWalletOverview : wallets;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.role === "cfo" ? "CFO Dashboard" : user.role === "ceo" ? "CEO Dashboard" : "CXO Dashboard"}
            </h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          
          {/* Date Range Selector for both CFO and CXO - Moved below header */}
          {(user.role === "cfo" || user.role === "cxo") && (
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border w-auto">
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[360px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateRangeDisplay()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-4" align="start">
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Date Range</div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                          Start Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-9"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "dd-mm-yyyy"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from || undefined}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || null }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                          End Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-9"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "dd-mm-yyyy"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to || undefined}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || null }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1" 
                        onClick={handleClearDateRange}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={handleApplyDateRange}
                        disabled={!dateRange.from || !dateRange.to}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Wallets Distributed"
            value={`₹${totalAllocated.toLocaleString()}`}
            icon={Wallet}
            trend="+12% from last month"
            trendUp
          />
          <KPICard
            title="Company Spend"
            value={`₹${totalCompanySpent.toLocaleString()}`}
            icon={DollarSign}
            trend="+8% from last month"
            trendUp
          />
          <KPICard
            title="Reimbursements Paid"
            value={`₹${totalReimbursed.toLocaleString()}`}
            icon={TrendingUp}
            trend="+5% from last month"
            trendUp
          />
          <KPICard
            title="Pending Proofs"
            value={`₹${totalProofPending.toLocaleString()}`}
            icon={AlertCircle}
            className="border-warning"
          />
        </div>

        {/* Wallet Overview Table */}
        {user.role === "cfo" && (
          <Card>
            <CardHeader>
              <CardTitle>
                Wallet Overview {dateRange.from && dateRange.to 
                  ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
                  : ''}
              </CardTitle>
              <CardDescription>
                {dateRange.from && dateRange.to 
                  ? `Wallet activity for selected date range` 
                  : 'Current status of all CXO wallets'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Company Spent</TableHead>
                    <TableHead className="text-right">Reimbursed</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Proof Pending</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletTableData && Array.isArray(walletTableData) && walletTableData.length > 0 ? (
                    walletTableData.map((wallet) => (
                      <TableRow key={wallet.user_id}>
                        <TableCell className="font-medium">{wallet.users?.name || 'Unknown User'}</TableCell>
                        <TableCell className="text-right">₹{wallet.allocated?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">₹{wallet.company_spent?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">₹{wallet.reimbursed?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right font-semibold">₹{wallet.balance?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right text-warning">₹{wallet.proof_pending?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/wallets`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {dateRange.from && dateRange.to ? 'No wallet activity found for selected date range' : 'No wallet data available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Spend Distribution</CardTitle>
              <CardDescription>Company vs Reimbursed expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spendData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {spendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>Last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        {user.role === "cfo" && (
          <Card>
            <CardHeader>
              <CardTitle>
                Recent Expense Submissions {dateRange.from && dateRange.to 
                  ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
                  : ''}
              </CardTitle>
              <CardDescription>
                Latest expense requests requiring attention {dateRange.from && dateRange.to ? 'for selected date range' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses && filteredExpenses.length > 0 ? (
                    filteredExpenses.slice(0, 5).map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-mono">{expense.id?.substring(0, 8) || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{expense.userName || 'Unknown User'}</TableCell>
                        <TableCell className="font-medium">{expense.category || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={expense.source === "company" ? "default" : "secondary"}>
                            {expense.source === "company" ? "Company" : "Personal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">₹{(expense.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell>
                          {expense.submittedOn ? new Date(expense.submittedOn).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {dateRange.from && dateRange.to ? 'No expenses found for selected date range' : 'Recent expenses will appear here after users submit them'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => navigate("/approvals")}>View All Approvals</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}