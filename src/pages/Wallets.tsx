
// import { useState, useEffect, useMemo } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { supabase } from "@/lib/supabaseClient";
// import { PlusCircle, TrendingUp, Wallet, CalendarIcon, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Wallets() {
//   const [open, setOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [amount, setAmount] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [allocationDate, setAllocationDate] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [walletAllocations, setWalletAllocations] = useState<any[]>([]);
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch all data
//   useEffect(() => {
//     fetchWallets();
//     fetchUsers();
//     fetchWalletAllocations();
//     fetchExpenses();
//   }, []);

//   // Filter wallet allocations based on date range
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

//   // Filter expenses based on date range
//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
    
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

//   // Calculate accurate wallet metrics using the same logic as CXO's MyWallet page
//   const calculateAccurateWalletMetrics = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
//       return {
//         totalBalance: 0,
//         totalProofPending: 0,
//         totalAllocated: 0,
//         totalCompanySpent: 0,
//         totalReimbursed: 0
//       };
//     }

//     // If no date range is selected, calculate from all data
//     if (!dateRange.from || !dateRange.to) {
//       const totalBalance = wallets.reduce((sum, wallet) => {
//         // Use the same calculation logic as CXO's MyWallet
//         const companySpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const approvedPersonalSpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const totalSpent = companySpent + approvedPersonalSpent;
//         return sum + ((wallet.allocated || 0) - totalSpent);
//       }, 0);

//       const totalProofPending = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'rejected')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       const totalAllocated = wallets.reduce((sum, wallet) => sum + (wallet.allocated || 0), 0);
//       const totalCompanySpent = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);
//       const totalReimbursed = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       return {
//         totalBalance,
//         totalProofPending,
//         totalAllocated,
//         totalCompanySpent,
//         totalReimbursed
//       };
//     }

//     // With date range filtering
//     const totalBalance = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const companySpent = userExpensesInRange
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const approvedPersonalSpent = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const totalSpent = companySpent + approvedPersonalSpent;
      
//       // Calculate allocated amount within date range
//       const userAllocationsInRange = filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id);
//       const allocatedInRange = userAllocationsInRange.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
      
//       return sum + (allocatedInRange - totalSpent);
//     }, 0);

//     const totalProofPending = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
//       return sum + userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     }, 0);

//     const totalAllocated = filteredWalletAllocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
//     const totalCompanySpent = filteredExpenses
//       .filter(expense => expense.source === 'company')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     const totalReimbursed = filteredExpenses
//       .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//     return {
//       totalBalance,
//       totalProofPending,
//       totalAllocated,
//       totalCompanySpent,
//       totalReimbursed
//     };
//   }, [wallets, expenses, filteredExpenses, filteredWalletAllocations, dateRange]);

//   // Calculate filtered wallet data for table display - COMPLETELY REWRITTEN FOR ACCURACY
//   const filteredWallets = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
//     console.log('Calculating wallets with:', {
//       walletsCount: wallets.length,
//       expensesCount: expenses.length,
//       filteredExpensesCount: filteredExpenses.length,
//       dateRange
//     });

//     return wallets.map(wallet => {
//       // Determine which expenses and allocations to use based on date range
//       const userExpensesToUse = dateRange.from && dateRange.to 
//         ? filteredExpenses.filter(expense => expense.user_id === wallet.user_id)
//         : expenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const userAllocationsToUse = dateRange.from && dateRange.to
//         ? filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id)
//         : walletAllocations.filter(allocation => allocation.user_id === wallet.user_id);

//       console.log(`User ${wallet.user_id} expenses:`, userExpensesToUse);
//       console.log(`User ${wallet.user_id} allocations:`, userAllocationsToUse);

//       // Calculate allocated amount
//       const allocated = userAllocationsToUse.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
      
//       // Calculate company spent - ONLY expenses with source = "company"
//       const companySpent = userExpensesToUse
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate approved personal expenses (reimbursed)
//       const reimbursed = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate proof pending (rejected personal expenses)
//       const proofPending = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       // Calculate balance: allocated - (company_spent + approved_personal)
//       const balance = allocated - (companySpent + reimbursed);

//       console.log(`User ${wallet.user_id} calculations:`, {
//         allocated,
//         companySpent,
//         reimbursed,
//         proofPending,
//         balance,
//         expensesBreakdown: userExpensesToUse.map(e => ({
//           id: e.id,
//           amount: e.amount,
//           source: e.source,
//           status: e.status,
//           category: e.category
//         }))
//       });

//       return {
//         ...wallet,
//         allocated,
//         company_spent: companySpent,
//         reimbursed,
//         balance,
//         proof_pending: proofPending
//       };
//     });
//   }, [wallets, expenses, walletAllocations, filteredExpenses, filteredWalletAllocations, dateRange]);

//   const fetchWallets = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('wallets')
//         .select(`
//           *,
//           users (id, name, email)
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setWallets(data || []);
//     } catch (err) {
//       console.error('Error fetching wallets:', err);
//       toast.error("Failed to fetch wallet data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       // First try to fetch all users without role filter to debug
//       let query = supabase
//         .from('users')
//         .select('id, name, email, role')
//         .order('name');

//       // Try with role filter, but if it fails, fall back to all users
//       const { data, error } = await query;

//       if (error) {
//         console.warn('Error fetching users with role filter, trying without filter:', error);
//         // Fallback: fetch all users without role filter
//         const { data: allUsers, error: allUsersError } = await supabase
//           .from('users')
//           .select('id, name, email, role')
//           .order('name');
          
//         if (allUsersError) throw allUsersError;
//         setUsers(allUsers || []);
//         return;
//       }

//       // If successful with role filter, use the filtered data
//       // If no specific role users found, use all users
//       const filteredUsers = data && data.length > 0 ? data : [];
//       setUsers(filteredUsers);
      
//     } catch (err: any) {
//       console.error('Error fetching users:', err);
//       // Don't show error toast for users fetch to prevent disruption
//       // Just set empty array and continue
//       setUsers([]);
//     }
//   };

//   const fetchWalletAllocations = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select('*');

//       if (error) {
//         console.error('Error fetching wallet allocations:', error);
//         return;
//       }
//       setWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching wallet allocations:', err);
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*');

//       if (error) throw error;
//       setExpenses(data || []);
      
//       // Debug: log expenses to see what we're working with
//       console.log('Fetched expenses:', data);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//     }
//   };

//   const handleAllocate = async () => {
//     if (!selectedUser || !amount || !purpose || !allocationDate || !paymentMethod) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const amountValue = parseFloat(amount);
//       if (isNaN(amountValue) || amountValue <= 0) {
//         toast.error("Please enter a valid amount");
//         return;
//       }

//       // Create wallet allocation record with payment method
//       const { data: allocationData, error: allocationError } = await supabase
//         .from('wallet_allocations')
//         .insert([
//           {
//             user_id: selectedUser,
//             amount: amountValue,
//             purpose,
//             date: new Date(allocationDate).toISOString(),
//             payment_method: paymentMethod,
//           }
//         ])
//         .select();

//       if (allocationError) {
//         console.error('Error creating allocation record:', allocationError);
//         toast.error("Failed to create allocation record: " + allocationError.message);
//         return;
//       }

//       // Update or create wallet record
//       const userWallet = wallets.find(w => w.user_id === selectedUser);
      
//       if (userWallet) {
//         const newAllocated = (userWallet.allocated || 0) + amountValue;
//         const newBalance = (userWallet.balance || 0) + amountValue;
        
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .update({
//             allocated: newAllocated,
//             balance: newBalance,
//             updated_at: new Date().toISOString()
//           })
//           .eq('user_id', selectedUser);
          
//         if (walletError) {
//           console.error('Error updating wallet:', walletError);
//           toast.error("Failed to update wallet: " + walletError.message);
//           return;
//         }
//       } else {
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .insert([
//             {
//               user_id: selectedUser,
//               allocated: amountValue,
//               company_spent: 0,
//               reimbursed: 0,
//               balance: amountValue,
//               proof_pending: 0,
//               created_at: new Date().toISOString(),
//               updated_at: new Date().toISOString(),
//             }
//           ]);
          
//         if (walletError) {
//           console.error('Error creating wallet:', walletError);
//           toast.error("Failed to create wallet: " + walletError.message);
//           return;
//         }
//       }

//       toast.success(`₹${amountValue.toLocaleString()} allocated successfully via ${paymentMethod}!`);
//       setOpen(false);
//       setSelectedUser("");
//       setAmount("");
//       setPurpose("");
//       setAllocationDate("");
//       setPaymentMethod("");
      
//       // Refresh all data
//       fetchWallets();
//       fetchWalletAllocations();
//       fetchExpenses();
      
//       window.dispatchEvent(new CustomEvent('walletUpdated', { 
//         detail: { userId: selectedUser } 
//       }));
//     } catch (error: any) {
//       toast.error("Failed to allocate funds: " + (error.message || "Unknown error"));
//       console.error("Error allocating funds:", error);
//     }
//   };

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

//   // Use accurate metrics for display
//   const { totalBalance, totalProofPending, totalAllocated, totalCompanySpent, totalReimbursed } = calculateAccurateWalletMetrics;

//   // Determine which wallet data to use for table display
//   const displayWallets = filteredWallets;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
//             <p className="text-muted-foreground">Allocate and manage CXO wallet funds</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             {/* Date Range Selector */}
//             <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {getDateRangeDisplay()}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-4" align="end">
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

//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogTrigger asChild>
//                 <Button className="gap-2">
//                   <PlusCircle className="w-4 h-4" />
//                   Allocate Funds
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Allocate Wallet Funds</DialogTitle>
//                   <DialogDescription>Add funds to a CXO wallet</DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <div className="space-y-2">
//                     <Label>Select CXO</Label>
//                     <Select value={selectedUser} onValueChange={setSelectedUser}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choose a CXO" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {users.length > 0 ? (
//                           users.map((user) => (
//                             <SelectItem key={user.id} value={user.id}>
//                               {user.name} ({user.role || 'user'})
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-users" disabled>
//                             No users available
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                     {users.length === 0 && (
//                       <p className="text-sm text-muted-foreground">
//                         No users found. Please check your database connection.
//                       </p>
//                     )}
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Amount (₹)</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="allocationDate">Allocation Date *</Label>
//                     <Input
//                       id="allocationDate"
//                       type="date"
//                       value={allocationDate}
//                       onChange={(e) => setAllocationDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Payment Method *</Label>
//                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select payment method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="india_bank">India Bank</SelectItem>
//                         <SelectItem value="upi">UPI</SelectItem>
//                         <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Purpose/Notes</Label>
//                     <Textarea
//                       placeholder="Describe the purpose of allocation"
//                       value={purpose}
//                       onChange={(e) => setPurpose(e.target.value)}
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button onClick={handleAllocate} disabled={users.length === 0}>
//                     Allocate Funds
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Summary Cards with Accurate Calculations */}
//         <div className="grid gap-4 md:grid-cols-3">
//           {/* <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalBalance.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Available across all CXO wallets
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
//                   <Wallet className="w-6 h-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card> */}

//           <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalAllocated.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Funds allocated to CXOs
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-xl flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-success" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//             <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalBalance.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Available across all CXO wallets
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
//                   <Wallet className="w-6 h-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover border-warning">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Proof Pending</p>
//                   <p className="text-2xl font-bold text-warning">
//                     ₹{totalProofPending.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Rejected expenses requiring proof
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-6 h-6 text-warning" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Additional Metrics Row */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Company Spent</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalCompanySpent.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Reimbursed</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalReimbursed.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Wallet Details Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Wallet Details {dateRange.from && dateRange.to 
//                 ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                 : ''}
//             </CardTitle>
//             <CardDescription>
//               {dateRange.from && dateRange.to 
//                 ? `Wallet activity for selected date range` 
//                 : 'Complete breakdown of all CXO wallets'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">Loading wallet data...</p>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Wallet Start</TableHead>
//                     <TableHead className="text-right">Allocated</TableHead>
//                     <TableHead className="text-right">Company Spent</TableHead>
//                     <TableHead className="text-right">Reimbursed</TableHead>
//                     <TableHead className="text-right">Wallet End</TableHead>
//                     <TableHead className="text-right">Proof Pending</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {displayWallets.length > 0 ? (
//                     displayWallets.map((wallet) => (
//                       <TableRow key={wallet.user_id}>
//                         <TableCell className="font-medium">
//                           {wallet.users?.name || 'Unknown User'}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.company_spent || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.reimbursed || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right font-bold text-primary">
//                           ₹{(wallet.balance || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right text-warning font-semibold">
//                           ₹{(wallet.proof_pending || 0).toLocaleString()}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to 
//                           ? 'No wallet activity found for selected date range' 
//                           : 'No wallet data available. Allocate funds to get started.'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }




































// import { useState, useEffect, useMemo } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { supabase } from "@/lib/supabaseClient";
// import { PlusCircle, TrendingUp, Wallet, CalendarIcon, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Wallets() {
//   const [open, setOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [amount, setAmount] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [allocationDate, setAllocationDate] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [walletAllocations, setWalletAllocations] = useState<any[]>([]);
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch all data
//   useEffect(() => {
//     fetchWallets();
//     fetchUsers();
//     fetchWalletAllocations();
//     fetchExpenses();
//   }, []);

//   // Filter wallet allocations based on date range
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

//   // Filter expenses based on date range
//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
    
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

//   // Calculate accurate wallet metrics using the same logic as CXO's MyWallet page
//   const calculateAccurateWalletMetrics = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
//       return {
//         totalBalance: 0,
//         totalProofPending: 0,
//         totalAllocated: 0,
//         totalCompanySpent: 0,
//         totalReimbursed: 0
//       };
//     }

//     // If no date range is selected, calculate from all data
//     if (!dateRange.from || !dateRange.to) {
//       const totalBalance = wallets.reduce((sum, wallet) => {
//         // Use the same calculation logic as CXO's MyWallet
//         const companySpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const approvedPersonalSpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const totalSpent = companySpent + approvedPersonalSpent;
//         return sum + ((wallet.allocated || 0) - totalSpent);
//       }, 0);

//       const totalProofPending = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'rejected')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       const totalAllocated = wallets.reduce((sum, wallet) => sum + (wallet.allocated || 0), 0);
//       const totalCompanySpent = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);
//       const totalReimbursed = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       return {
//         totalBalance,
//         totalProofPending,
//         totalAllocated,
//         totalCompanySpent,
//         totalReimbursed
//       };
//     }

//     // With date range filtering
//     const totalBalance = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const companySpent = userExpensesInRange
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const approvedPersonalSpent = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const totalSpent = companySpent + approvedPersonalSpent;
      
//       // Calculate allocated amount within date range
//       const userAllocationsInRange = filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id);
//       const allocatedInRange = userAllocationsInRange.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
      
//       return sum + (allocatedInRange - totalSpent);
//     }, 0);

//     const totalProofPending = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
//       return sum + userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     }, 0);

//     const totalAllocated = filteredWalletAllocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
//     const totalCompanySpent = filteredExpenses
//       .filter(expense => expense.source === 'company')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     const totalReimbursed = filteredExpenses
//       .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//     return {
//       totalBalance,
//       totalProofPending,
//       totalAllocated,
//       totalCompanySpent,
//       totalReimbursed
//     };
//   }, [wallets, expenses, filteredExpenses, filteredWalletAllocations, dateRange]);

//   // Calculate filtered wallet data for table display - COMPLETELY REWRITTEN FOR ACCURACY
//   const filteredWallets = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
//     console.log('Calculating wallets with:', {
//       walletsCount: wallets.length,
//       expensesCount: expenses.length,
//       filteredExpensesCount: filteredExpenses.length,
//       dateRange
//     });

//     return wallets.map(wallet => {
//       // Determine which expenses and allocations to use based on date range
//       const userExpensesToUse = dateRange.from && dateRange.to 
//         ? filteredExpenses.filter(expense => expense.user_id === wallet.user_id)
//         : expenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const userAllocationsToUse = dateRange.from && dateRange.to
//         ? filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id)
//         : walletAllocations.filter(allocation => allocation.user_id === wallet.user_id);

//       console.log(`User ${wallet.user_id} expenses:`, userExpensesToUse);
//       console.log(`User ${wallet.user_id} allocations:`, userAllocationsToUse);

//       // Calculate allocated amount
//       const allocated = userAllocationsToUse.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
      
//       // Calculate company spent - ONLY expenses with source = "company"
//       const companySpent = userExpensesToUse
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate approved personal expenses (reimbursed)
//       const reimbursed = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate proof pending (rejected personal expenses)
//       const proofPending = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       // Calculate balance: allocated - (company_spent + approved_personal)
//       const balance = allocated - (companySpent + reimbursed);

//       console.log(`User ${wallet.user_id} calculations:`, {
//         allocated,
//         companySpent,
//         reimbursed,
//         proofPending,
//         balance,
//         expensesBreakdown: userExpensesToUse.map(e => ({
//           id: e.id,
//           amount: e.amount,
//           source: e.source,
//           status: e.status,
//           category: e.category
//         }))
//       });

//       return {
//         ...wallet,
//         allocated,
//         company_spent: companySpent,
//         reimbursed,
//         balance,
//         proof_pending: proofPending
//       };
//     });
//   }, [wallets, expenses, walletAllocations, filteredExpenses, filteredWalletAllocations, dateRange]);

//   const fetchWallets = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('wallets')
//         .select(`
//           *,
//           users (id, name, email)
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setWallets(data || []);
//     } catch (err) {
//       console.error('Error fetching wallets:', err);
//       toast.error("Failed to fetch wallet data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       // First try to fetch all users without role filter to debug
//       let query = supabase
//         .from('users')
//         .select('id, name, email, role')
//         .order('name');

//       // Try with role filter, but if it fails, fall back to all users
//       const { data, error } = await query;

//       if (error) {
//         console.warn('Error fetching users with role filter, trying without filter:', error);
//         // Fallback: fetch all users without role filter
//         const { data: allUsers, error: allUsersError } = await supabase
//           .from('users')
//           .select('id, name, email, role')
//           .order('name');
          
//         if (allUsersError) throw allUsersError;
//         setUsers(allUsers || []);
//         return;
//       }

//       // If successful with role filter, use the filtered data
//       // If no specific role users found, use all users
//       const filteredUsers = data && data.length > 0 ? data : [];
//       setUsers(filteredUsers);
      
//     } catch (err: any) {
//       console.error('Error fetching users:', err);
//       // Don't show error toast for users fetch to prevent disruption
//       // Just set empty array and continue
//       setUsers([]);
//     }
//   };

//   const fetchWalletAllocations = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select('*');

//       if (error) {
//         console.error('Error fetching wallet allocations:', error);
//         return;
//       }
//       setWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching wallet allocations:', err);
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*');

//       if (error) throw error;
//       setExpenses(data || []);
      
//       // Debug: log expenses to see what we're working with
//       console.log('Fetched expenses:', data);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//     }
//   };

//   const handleAllocate = async () => {
//     if (!selectedUser || !amount || !purpose || !allocationDate || !paymentMethod) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const amountValue = parseFloat(amount);
//       if (isNaN(amountValue) || amountValue <= 0) {
//         toast.error("Please enter a valid amount");
//         return;
//       }

//       // Create wallet allocation record with payment method
//       const { data: allocationData, error: allocationError } = await supabase
//         .from('wallet_allocations')
//         .insert([
//           {
//             user_id: selectedUser,
//             amount: amountValue,
//             purpose,
//             date: new Date(allocationDate).toISOString(),
//             payment_method: paymentMethod,
//           }
//         ])
//         .select();

//       if (allocationError) {
//         console.error('Error creating allocation record:', allocationError);
//         toast.error("Failed to create allocation record: " + allocationError.message);
//         return;
//       }

//       // Update or create wallet record
//       const userWallet = wallets.find(w => w.user_id === selectedUser);
      
//       if (userWallet) {
//         const newAllocated = (userWallet.allocated || 0) + amountValue;
//         const newBalance = (userWallet.balance || 0) + amountValue;
        
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .update({
//             allocated: newAllocated,
//             balance: newBalance,
//             updated_at: new Date().toISOString()
//           })
//           .eq('user_id', selectedUser);
          
//         if (walletError) {
//           console.error('Error updating wallet:', walletError);
//           toast.error("Failed to update wallet: " + walletError.message);
//           return;
//         }
//       } else {
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .insert([
//             {
//               user_id: selectedUser,
//               allocated: amountValue,
//               company_spent: 0,
//               reimbursed: 0,
//               balance: amountValue,
//               proof_pending: 0,
//               created_at: new Date().toISOString(),
//               updated_at: new Date().toISOString(),
//             }
//           ]);
          
//         if (walletError) {
//           console.error('Error creating wallet:', walletError);
//           toast.error("Failed to create wallet: " + walletError.message);
//           return;
//         }
//       }

//       toast.success(`₹${amountValue.toLocaleString()} allocated successfully via ${paymentMethod}!`);
//       setOpen(false);
//       setSelectedUser("");
//       setAmount("");
//       setPurpose("");
//       setAllocationDate("");
//       setPaymentMethod("");
      
//       // Refresh all data
//       fetchWallets();
//       fetchWalletAllocations();
//       fetchExpenses();
      
//       window.dispatchEvent(new CustomEvent('walletUpdated', { 
//         detail: { userId: selectedUser } 
//       }));
//     } catch (error: any) {
//       toast.error("Failed to allocate funds: " + (error.message || "Unknown error"));
//       console.error("Error allocating funds:", error);
//     }
//   };

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

//   // Use accurate metrics for display
//   const { totalBalance, totalProofPending, totalAllocated, totalCompanySpent, totalReimbursed } = calculateAccurateWalletMetrics;

//   // Determine which wallet data to use for table display
//   const displayWallets = filteredWallets;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
//             <p className="text-muted-foreground">Allocate and manage CXO wallet funds</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             {/* Date Range Selector */}
//             <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {getDateRangeDisplay()}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-4" align="end">
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

//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogTrigger asChild>
//                 <Button className="gap-2">
//                   <PlusCircle className="w-4 h-4" />
//                   Allocate Funds
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Allocate Wallet Funds</DialogTitle>
//                   <DialogDescription>Add funds to a CXO wallet</DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <div className="space-y-2">
//                     <Label>Select CXO</Label>
//                     <Select value={selectedUser} onValueChange={setSelectedUser}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choose a CXO" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {users.length > 0 ? (
//                           users.map((user) => (
//                             <SelectItem key={user.id} value={user.id}>
//                               {user.name} ({user.role || 'user'})
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-users" disabled>
//                             No users available
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                     {users.length === 0 && (
//                       <p className="text-sm text-muted-foreground">
//                         No users found. Please check your database connection.
//                       </p>
//                     )}
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Amount (₹)</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="allocationDate">Allocation Date *</Label>
//                     <Input
//                       id="allocationDate"
//                       type="date"
//                       value={allocationDate}
//                       onChange={(e) => setAllocationDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Payment Method *</Label>
//                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select payment method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="india_bank">India Bank</SelectItem>
//                         <SelectItem value="upi">UPI</SelectItem>
//                         <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Purpose/Notes</Label>
//                     <Textarea
//                       placeholder="Describe the purpose of allocation"
//                       value={purpose}
//                       onChange={(e) => setPurpose(e.target.value)}
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button onClick={handleAllocate} disabled={users.length === 0}>
//                     Allocate Funds
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Summary Cards with Accurate Calculations */}
//         <div className="grid gap-4 md:grid-cols-3">
//           {/* <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalBalance.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Available across all CXO wallets
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
//                   <Wallet className="w-6 h-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card> */}

//           <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalAllocated.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Funds allocated to CXOs
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-xl flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-success" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//             <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalBalance.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Available across all CXO wallets
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
//                   <Wallet className="w-6 h-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover border-warning">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Proof Pending</p>
//                   <p className="text-2xl font-bold text-warning">
//                     ₹{totalProofPending.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Rejected expenses requiring proof
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-6 h-6 text-warning" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Additional Metrics Row */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Company Spent</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalCompanySpent.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Reimbursed</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalReimbursed.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Wallet Details Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Wallet Details {dateRange.from && dateRange.to 
//                 ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                 : ''}
//             </CardTitle>
//             <CardDescription>
//               {dateRange.from && dateRange.to 
//                 ? `Wallet activity for selected date range` 
//                 : 'Complete breakdown of all CXO wallets'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">Loading wallet data...</p>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Wallet Start</TableHead>
//                     <TableHead className="text-right">Allocated</TableHead>
//                     <TableHead className="text-right">Company Spent</TableHead>
//                     <TableHead className="text-right">Reimbursed</TableHead>
//                     <TableHead className="text-right">Wallet End</TableHead>
//                     <TableHead className="text-right">Proof Pending</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {displayWallets.length > 0 ? (
//                     displayWallets.map((wallet) => (
//                       <TableRow key={wallet.user_id}>
//                         <TableCell className="font-medium">
//                           {wallet.users?.name || 'Unknown User'}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.company_spent || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.reimbursed || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right font-bold text-primary">
//                           ₹{(wallet.balance || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right text-warning font-semibold">
//                           ₹{(wallet.proof_pending || 0).toLocaleString()}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to 
//                           ? 'No wallet activity found for selected date range' 
//                           : 'No wallet data available. Allocate funds to get started.'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }






























































































// import { useState, useEffect, useMemo } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { supabase } from "@/lib/supabaseClient";
// import { PlusCircle, TrendingUp, Wallet, CalendarIcon, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Wallets() {
//   const [open, setOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [amount, setAmount] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [allocationDate, setAllocationDate] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [walletAllocations, setWalletAllocations] = useState<any[]>([]);
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch all data
//   useEffect(() => {
//     fetchWallets();
//     fetchUsers();
//     fetchWalletAllocations();
//     fetchExpenses();
//   }, []);

//   // Filter wallet allocations based on date range
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

//   // Filter expenses based on date range
//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
    
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

//   // Calculate accurate wallet metrics using the same logic as CXO's MyWallet page
//   const calculateAccurateWalletMetrics = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
//       return {
//         totalBalance: 0,
//         totalProofPending: 0,
//         totalAllocated: 0,
//         totalCompanySpent: 0,
//         totalReimbursed: 0
//       };
//     }

//     // If no date range is selected, calculate from all data
//     if (!dateRange.from || !dateRange.to) {
//       const totalBalance = wallets.reduce((sum, wallet) => {
//         // Use the same calculation logic as CXO's MyWallet
//         const companySpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const approvedPersonalSpent = expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//         const totalSpent = companySpent + approvedPersonalSpent;
//         return sum + ((wallet.allocated || 0) - totalSpent);
//       }, 0);

//       const totalProofPending = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'rejected')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       const totalAllocated = wallets.reduce((sum, wallet) => sum + (wallet.allocated || 0), 0);
//       const totalCompanySpent = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);
//       const totalReimbursed = wallets.reduce((sum, wallet) => {
//         return sum + expenses
//           .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
//           .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//       }, 0);

//       return {
//         totalBalance,
//         totalProofPending,
//         totalAllocated,
//         totalCompanySpent,
//         totalReimbursed
//       };
//     }

//     // With date range filtering
//     const totalBalance = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const companySpent = userExpensesInRange
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const approvedPersonalSpent = userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       const totalSpent = companySpent + approvedPersonalSpent;
      
//       // Calculate allocated amount within date range
//       const userAllocationsInRange = filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id);
//       const allocatedInRange = userAllocationsInRange.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
      
//       return sum + (allocatedInRange - totalSpent);
//     }, 0);

//     const totalProofPending = wallets.reduce((sum, wallet) => {
//       const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
//       return sum + userExpensesInRange
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     }, 0);

//     const totalAllocated = filteredWalletAllocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
//     const totalCompanySpent = filteredExpenses
//       .filter(expense => expense.source === 'company')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);
//     const totalReimbursed = filteredExpenses
//       .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//     return {
//       totalBalance,
//       totalProofPending,
//       totalAllocated,
//       totalCompanySpent,
//       totalReimbursed
//     };
//   }, [wallets, expenses, filteredExpenses, filteredWalletAllocations, dateRange]);

//   // Calculate filtered wallet data for table display - COMPLETELY REWRITTEN FOR ACCURACY
//   const filteredWallets = useMemo(() => {
//     if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
//     console.log('Calculating wallets with:', {
//       walletsCount: wallets.length,
//       expensesCount: expenses.length,
//       filteredExpensesCount: filteredExpenses.length,
//       dateRange
//     });

//     return wallets.map(wallet => {
//       // Determine which expenses and allocations to use based on date range
//       const userExpensesToUse = dateRange.from && dateRange.to 
//         ? filteredExpenses.filter(expense => expense.user_id === wallet.user_id)
//         : expenses.filter(expense => expense.user_id === wallet.user_id);
      
//       const userAllocationsToUse = dateRange.from && dateRange.to
//         ? filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id)
//         : walletAllocations.filter(allocation => allocation.user_id === wallet.user_id);

//       console.log(`User ${wallet.user_id} expenses:`, userExpensesToUse);
//       console.log(`User ${wallet.user_id} allocations:`, userAllocationsToUse);

//       // Calculate allocated amount
//       const allocated = userAllocationsToUse.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
      
//       // Calculate company spent - ONLY expenses with source = "company"
//       const companySpent = userExpensesToUse
//         .filter(expense => expense.source === 'company')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate approved personal expenses (reimbursed)
//       const reimbursed = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'approved')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
//       // Calculate proof pending (rejected personal expenses)
//       const proofPending = userExpensesToUse
//         .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
//         .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

//       // Calculate balance: allocated - (company_spent + approved_personal)
//       const balance = allocated - (companySpent + reimbursed);

//       console.log(`User ${wallet.user_id} calculations:`, {
//         allocated,
//         companySpent,
//         reimbursed,
//         proofPending,
//         balance,
//         expensesBreakdown: userExpensesToUse.map(e => ({
//           id: e.id,
//           amount: e.amount,
//           source: e.source,
//           status: e.status,
//           category: e.category
//         }))
//       });

//       return {
//         ...wallet,
//         allocated,
//         company_spent: companySpent,
//         reimbursed,
//         balance,
//         proof_pending: proofPending
//       };
//     });
//   }, [wallets, expenses, walletAllocations, filteredExpenses, filteredWalletAllocations, dateRange]);

//   const fetchWallets = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('wallets')
//         .select(`
//           *,
//           users (id, name, email)
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setWallets(data || []);
//     } catch (err) {
//       console.error('Error fetching wallets:', err);
//       toast.error("Failed to fetch wallet data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       // First try to fetch all users without role filter to debug
//       let query = supabase
//         .from('users')
//         .select('id, name, email, role')
//         .order('name');

//       // Try with role filter, but if it fails, fall back to all users
//       const { data, error } = await query;

//       if (error) {
//         console.warn('Error fetching users with role filter, trying without filter:', error);
//         // Fallback: fetch all users without role filter
//         const { data: allUsers, error: allUsersError } = await supabase
//           .from('users')
//           .select('id, name, email, role')
//           .order('name');
          
//         if (allUsersError) throw allUsersError;
//         setUsers(allUsers || []);
//         return;
//       }

//       // If successful with role filter, use the filtered data
//       // If no specific role users found, use all users
//       const filteredUsers = data && data.length > 0 ? data : [];
//       setUsers(filteredUsers);
      
//     } catch (err: any) {
//       console.error('Error fetching users:', err);
//       // Don't show error toast for users fetch to prevent disruption
//       // Just set empty array and continue
//       setUsers([]);
//     }
//   };

//   const fetchWalletAllocations = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('wallet_allocations')
//         .select('*');

//       if (error) {
//         console.error('Error fetching wallet allocations:', error);
//         return;
//       }
//       setWalletAllocations(data || []);
//     } catch (err) {
//       console.error('Error fetching wallet allocations:', err);
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('expenses')
//         .select('*');

//       if (error) throw error;
//       setExpenses(data || []);
      
//       // Debug: log expenses to see what we're working with
//       console.log('Fetched expenses:', data);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//     }
//   };

//   const handleAllocate = async () => {
//     if (!selectedUser || !amount || !purpose || !allocationDate || !paymentMethod) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const amountValue = parseFloat(amount);
//       if (isNaN(amountValue) || amountValue <= 0) {
//         toast.error("Please enter a valid amount");
//         return;
//       }

//       // Create wallet allocation record with payment method
//       const { data: allocationData, error: allocationError } = await supabase
//         .from('wallet_allocations')
//         .insert([
//           {
//             user_id: selectedUser,
//             amount: amountValue,
//             purpose,
//             date: new Date(allocationDate).toISOString(),
//             payment_method: paymentMethod,
//           }
//         ])
//         .select();

//       if (allocationError) {
//         console.error('Error creating allocation record:', allocationError);
//         toast.error("Failed to create allocation record: " + allocationError.message);
//         return;
//       }

//       // Update or create wallet record
//       const userWallet = wallets.find(w => w.user_id === selectedUser);
      
//       if (userWallet) {
//         const newAllocated = (userWallet.allocated || 0) + amountValue;
//         const newBalance = (userWallet.balance || 0) + amountValue;
        
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .update({
//             allocated: newAllocated,
//             balance: newBalance,
//             updated_at: new Date().toISOString()
//           })
//           .eq('user_id', selectedUser);
          
//         if (walletError) {
//           console.error('Error updating wallet:', walletError);
//           toast.error("Failed to update wallet: " + walletError.message);
//           return;
//         }
//       } else {
//         const { error: walletError } = await supabase
//           .from('wallets')
//           .insert([
//             {
//               user_id: selectedUser,
//               allocated: amountValue,
//               company_spent: 0,
//               reimbursed: 0,
//               balance: amountValue,
//               proof_pending: 0,
//               created_at: new Date().toISOString(),
//               updated_at: new Date().toISOString(),
//             }
//           ]);
          
//         if (walletError) {
//           console.error('Error creating wallet:', walletError);
//           toast.error("Failed to create wallet: " + walletError.message);
//           return;
//         }
//       }

//       toast.success(`₹${amountValue.toLocaleString()} allocated successfully via ${paymentMethod}!`);
//       setOpen(false);
//       setSelectedUser("");
//       setAmount("");
//       setPurpose("");
//       setAllocationDate("");
//       setPaymentMethod("");
      
//       // Refresh all data
//       fetchWallets();
//       fetchWalletAllocations();
//       fetchExpenses();
      
//       window.dispatchEvent(new CustomEvent('walletUpdated', { 
//         detail: { userId: selectedUser } 
//       }));
//     } catch (error: any) {
//       toast.error("Failed to allocate funds: " + (error.message || "Unknown error"));
//       console.error("Error allocating funds:", error);
//     }
//   };

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

//   // Use accurate metrics for display
//   const { totalBalance, totalProofPending, totalAllocated, totalCompanySpent, totalReimbursed } = calculateAccurateWalletMetrics;

//   // Determine which wallet data to use for table display
//   const displayWallets = filteredWallets;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         {/* Header Section - Stacked on mobile, row on desktop */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
//             <p className="text-muted-foreground">Allocate and manage CXO wallet funds</p>
//           </div>
          
//           {/* Desktop Controls - Hidden on mobile */}
//           <div className="hidden sm:flex items-center gap-3">
//             {/* Date Range Selector */}
//             <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {getDateRangeDisplay()}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-4" align="end">
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

//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogTrigger asChild>
//                 <Button className="gap-2">
//                   <PlusCircle className="w-4 h-4" />
//                   Allocate Funds
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Allocate Wallet Funds</DialogTitle>
//                   <DialogDescription>Add funds to a CXO wallet</DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <div className="space-y-2">
//                     <Label>Select CXO</Label>
//                     <Select value={selectedUser} onValueChange={setSelectedUser}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choose a CXO" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {users.length > 0 ? (
//                           users.map((user) => (
//                             <SelectItem key={user.id} value={user.id}>
//                               {user.name} ({user.role || 'user'})
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-users" disabled>
//                             No users available
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                     {users.length === 0 && (
//                       <p className="text-sm text-muted-foreground">
//                         No users found. Please check your database connection.
//                       </p>
//                     )}
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Amount (₹)</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="allocationDate">Allocation Date *</Label>
//                     <Input
//                       id="allocationDate"
//                       type="date"
//                       value={allocationDate}
//                       onChange={(e) => setAllocationDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Payment Method *</Label>
//                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select payment method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="india_bank">India Bank</SelectItem>
//                         <SelectItem value="upi">UPI</SelectItem>
//                         <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Purpose/Notes</Label>
//                     <Textarea
//                       placeholder="Describe the purpose of allocation"
//                       value={purpose}
//                       onChange={(e) => setPurpose(e.target.value)}
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button onClick={handleAllocate} disabled={users.length === 0}>
//                     Allocate Funds
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Mobile Controls - Shown above KPI cards, hidden on desktop */}
//         <div className="sm:hidden space-y-3">
//           {/* Date Range Selector for Mobile */}
//           <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//             <PopoverTrigger asChild>
//               <Button variant="outline" className="w-full justify-start text-left font-normal">
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {getDateRangeDisplay()}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-[90vw] p-4" align="center">
//               <div className="space-y-4">
//                 <div className="text-sm font-medium">Date Range</div>
                
//                 <div className="space-y-3">
//                   <div className="space-y-2">
//                     <Label htmlFor="start-date" className="text-xs text-muted-foreground">
//                       Start Date
//                     </Label>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="w-full justify-start text-left font-normal h-9"
//                         >
//                           <CalendarIcon className="mr-2 h-4 w-4" />
//                           {dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={dateRange.from || undefined}
//                           onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || null }))}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="end-date" className="text-xs text-muted-foreground">
//                       End Date
//                     </Label>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="w-full justify-start text-left font-normal h-9"
//                         >
//                           <CalendarIcon className="mr-2 h-4 w-4" />
//                           {dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "dd-mm-yyyy"}
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={dateRange.to || undefined}
//                           onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || null }))}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 pt-2">
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="flex-1" 
//                     onClick={handleClearDateRange}
//                   >
//                     Clear
//                   </Button>
//                   <Button 
//                     size="sm" 
//                     className="flex-1" 
//                     onClick={handleApplyDateRange}
//                     disabled={!dateRange.from || !dateRange.to}
//                   >
//                     Apply
//                   </Button>
//                 </div>
//               </div>
//             </PopoverContent>
//           </Popover>

//           {/* Allocate Funds Button for Mobile */}
//           <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2 w-full">
//                 <PlusCircle className="w-4 h-4" />
//                 Allocate Funds
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Allocate Wallet Funds</DialogTitle>
//                 <DialogDescription>Add funds to a CXO wallet</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 py-4">
//                 <div className="space-y-2">
//                   <Label>Select CXO</Label>
//                   <Select value={selectedUser} onValueChange={setSelectedUser}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Choose a CXO" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {users.length > 0 ? (
//                         users.map((user) => (
//                           <SelectItem key={user.id} value={user.id}>
//                             {user.name} ({user.role || 'user'})
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem value="no-users" disabled>
//                           No users available
//                         </SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                   {users.length === 0 && (
//                     <p className="text-sm text-muted-foreground">
//                       No users found. Please check your database connection.
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Amount (₹)</Label>
//                   <Input
//                     type="number"
//                     placeholder="Enter amount"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="allocationDate">Allocation Date *</Label>
//                   <Input
//                     id="allocationDate"
//                     type="date"
//                     value={allocationDate}
//                     onChange={(e) => setAllocationDate(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Payment Method *</Label>
//                   <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select payment method" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="india_bank">India Bank</SelectItem>
//                       <SelectItem value="upi">UPI</SelectItem>
//                       <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Purpose/Notes</Label>
//                   <Textarea
//                     placeholder="Describe the purpose of allocation"
//                     value={purpose}
//                     onChange={(e) => setPurpose(e.target.value)}
//                     rows={3}
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleAllocate} disabled={users.length === 0}>
//                   Allocate Funds
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Summary Cards with Accurate Calculations */}
//         <div className="grid gap-4 md:grid-cols-3">
//           <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalAllocated.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Funds allocated to CXOs
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-xl flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-success" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//             <Card className="card-hover">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
//                   <p className="text-2xl font-bold">
//                     ₹{totalBalance.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Available across all CXO wallets
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
//                   <Wallet className="w-6 h-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover border-warning">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-muted-foreground">Total Proof Pending</p>
//                   <p className="text-2xl font-bold text-warning">
//                     ₹{totalProofPending.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Rejected expenses requiring proof
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-6 h-6 text-warning" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Additional Metrics Row */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Company Spent</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalCompanySpent.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="card-hover">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Reimbursed</p>
//                   <p className="text-xl font-bold">
//                     ₹{totalReimbursed.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Wallet Details Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Wallet Details {dateRange.from && dateRange.to 
//                 ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                 : ''}
//             </CardTitle>
//             <CardDescription>
//               {dateRange.from && dateRange.to 
//                 ? `Wallet activity for selected date range` 
//                 : 'Complete breakdown of all CXO wallets'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">Loading wallet data...</p>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Wallet Start</TableHead>
//                     <TableHead className="text-right">Allocated</TableHead>
//                     <TableHead className="text-right">Company Spent</TableHead>
//                     <TableHead className="text-right">Reimbursed</TableHead>
//                     <TableHead className="text-right">Wallet End</TableHead>
//                     <TableHead className="text-right">Proof Pending</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {displayWallets.length > 0 ? (
//                     displayWallets.map((wallet) => (
//                       <TableRow key={wallet.user_id}>
//                         <TableCell className="font-medium">
//                           {wallet.users?.name || 'Unknown User'}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.allocated || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.company_spent || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ₹{(wallet.reimbursed || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right font-bold text-primary">
//                           ₹{(wallet.balance || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right text-warning font-semibold">
//                           ₹{(wallet.proof_pending || 0).toLocaleString()}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to 
//                           ? 'No wallet activity found for selected date range' 
//                           : 'No wallet data available. Allocate funds to get started.'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }
































































import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";
import { PlusCircle, TrendingUp, Wallet, CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function Wallets() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [allocationDate, setAllocationDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAllocations, setWalletAllocations] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchWallets();
    fetchUsers();
    fetchWalletAllocations();
    fetchExpenses();
  }, []);

  // Filter wallet allocations based on date range
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

  // Filter expenses based on date range
  const filteredExpenses = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return [];
    
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

  // Calculate accurate wallet metrics using the same logic as CXO's MyWallet page
  const calculateAccurateWalletMetrics = useMemo(() => {
    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
      return {
        totalBalance: 0,
        totalProofPending: 0,
        totalAllocated: 0,
        totalCompanySpent: 0,
        totalReimbursed: 0
      };
    }

    // If no date range is selected, calculate from all data
    if (!dateRange.from || !dateRange.to) {
      const totalBalance = wallets.reduce((sum, wallet) => {
        // Use the same calculation logic as CXO's MyWallet
        const companySpent = expenses
          .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);

        const approvedPersonalSpent = expenses
          .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);

        const totalSpent = companySpent + approvedPersonalSpent;
        return sum + ((wallet.allocated || 0) - totalSpent);
      }, 0);

      const totalProofPending = wallets.reduce((sum, wallet) => {
        return sum + expenses
          .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'rejected')
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }, 0);

      const totalAllocated = wallets.reduce((sum, wallet) => sum + (wallet.allocated || 0), 0);
      const totalCompanySpent = wallets.reduce((sum, wallet) => {
        return sum + expenses
          .filter(expense => expense.user_id === wallet.user_id && expense.source === 'company')
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }, 0);
      const totalReimbursed = wallets.reduce((sum, wallet) => {
        return sum + expenses
          .filter(expense => expense.user_id === wallet.user_id && expense.source === 'personal' && expense.status === 'approved')
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      }, 0);

      return {
        totalBalance,
        totalProofPending,
        totalAllocated,
        totalCompanySpent,
        totalReimbursed
      };
    }

    // With date range filtering
    const totalBalance = wallets.reduce((sum, wallet) => {
      const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
      
      const companySpent = userExpensesInRange
        .filter(expense => expense.source === 'company')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const approvedPersonalSpent = userExpensesInRange
        .filter(expense => expense.source === 'personal' && expense.status === 'approved')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const totalSpent = companySpent + approvedPersonalSpent;
      
      // Calculate allocated amount within date range
      const userAllocationsInRange = filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id);
      const allocatedInRange = userAllocationsInRange.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
      
      return sum + (allocatedInRange - totalSpent);
    }, 0);

    const totalProofPending = wallets.reduce((sum, wallet) => {
      const userExpensesInRange = filteredExpenses.filter(expense => expense.user_id === wallet.user_id);
      return sum + userExpensesInRange
        .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    }, 0);

    const totalAllocated = filteredWalletAllocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
    const totalCompanySpent = filteredExpenses
      .filter(expense => expense.source === 'company')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalReimbursed = filteredExpenses
      .filter(expense => expense.source === 'personal' && expense.status === 'approved')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return {
      totalBalance,
      totalProofPending,
      totalAllocated,
      totalCompanySpent,
      totalReimbursed
    };
  }, [wallets, expenses, filteredExpenses, filteredWalletAllocations, dateRange]);

  // Calculate filtered wallet data for table display - COMPLETELY REWRITTEN FOR ACCURACY
  const filteredWallets = useMemo(() => {
    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) return [];
    
    console.log('Calculating wallets with:', {
      walletsCount: wallets.length,
      expensesCount: expenses.length,
      filteredExpensesCount: filteredExpenses.length,
      dateRange
    });

    return wallets.map(wallet => {
      // Determine which expenses and allocations to use based on date range
      const userExpensesToUse = dateRange.from && dateRange.to 
        ? filteredExpenses.filter(expense => expense.user_id === wallet.user_id)
        : expenses.filter(expense => expense.user_id === wallet.user_id);
      
      const userAllocationsToUse = dateRange.from && dateRange.to
        ? filteredWalletAllocations.filter(allocation => allocation.user_id === wallet.user_id)
        : walletAllocations.filter(allocation => allocation.user_id === wallet.user_id);

      console.log(`User ${wallet.user_id} expenses:`, userExpensesToUse);
      console.log(`User ${wallet.user_id} allocations:`, userAllocationsToUse);

      // Calculate allocated amount
      const allocated = userAllocationsToUse.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
      
      // Calculate company spent - ONLY expenses with source = "company"
      const companySpent = userExpensesToUse
        .filter(expense => expense.source === 'company')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      // Calculate approved personal expenses (reimbursed)
      const reimbursed = userExpensesToUse
        .filter(expense => expense.source === 'personal' && expense.status === 'approved')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      // Calculate proof pending (rejected personal expenses)
      const proofPending = userExpensesToUse
        .filter(expense => expense.source === 'personal' && expense.status === 'rejected')
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      // Calculate balance: allocated - (company_spent + approved_personal)
      const balance = allocated - (companySpent + reimbursed);

      console.log(`User ${wallet.user_id} calculations:`, {
        allocated,
        companySpent,
        reimbursed,
        proofPending,
        balance,
        expensesBreakdown: userExpensesToUse.map(e => ({
          id: e.id,
          amount: e.amount,
          source: e.source,
          status: e.status,
          category: e.category
        }))
      });

      return {
        ...wallet,
        allocated,
        company_spent: companySpent,
        reimbursed,
        balance,
        proof_pending: proofPending
      };
    });
  }, [wallets, expenses, walletAllocations, filteredExpenses, filteredWalletAllocations, dateRange]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          *,
          users (id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      toast.error("Failed to fetch wallet data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // First try to fetch all users without role filter to debug
      let query = supabase
        .from('users')
        .select('id, name, email, role')
        .order('name');

      // Try with role filter, but if it fails, fall back to all users
      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching users with role filter, trying without filter:', error);
        // Fallback: fetch all users without role filter
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, name, email, role')
          .order('name');
          
        if (allUsersError) throw allUsersError;
        setUsers(allUsers || []);
        return;
      }

      // If successful with role filter, use the filtered data
      // If no specific role users found, use all users
      const filteredUsers = data && data.length > 0 ? data : [];
      setUsers(filteredUsers);
      
    } catch (err: any) {
      console.error('Error fetching users:', err);
      // Don't show error toast for users fetch to prevent disruption
      // Just set empty array and continue
      setUsers([]);
    }
  };

  const fetchWalletAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_allocations')
        .select('*');

      if (error) {
        console.error('Error fetching wallet allocations:', error);
        return;
      }
      setWalletAllocations(data || []);
    } catch (err) {
      console.error('Error fetching wallet allocations:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;
      setExpenses(data || []);
      
      // Debug: log expenses to see what we're working with
      console.log('Fetched expenses:', data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleAllocate = async () => {
    if (!selectedUser || !amount || !purpose || !allocationDate || !paymentMethod) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Create wallet allocation record with payment method
      const { data: allocationData, error: allocationError } = await supabase
        .from('wallet_allocations')
        .insert([
          {
            user_id: selectedUser,
            amount: amountValue,
            purpose,
            date: new Date(allocationDate).toISOString(),
            payment_method: paymentMethod,
          }
        ])
        .select();

      if (allocationError) {
        console.error('Error creating allocation record:', allocationError);
        toast.error("Failed to create allocation record: " + allocationError.message);
        return;
      }

      // Update or create wallet record
      const userWallet = wallets.find(w => w.user_id === selectedUser);
      
      if (userWallet) {
        const newAllocated = (userWallet.allocated || 0) + amountValue;
        const newBalance = (userWallet.balance || 0) + amountValue;
        
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            allocated: newAllocated,
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedUser);
          
        if (walletError) {
          console.error('Error updating wallet:', walletError);
          toast.error("Failed to update wallet: " + walletError.message);
          return;
        }
      } else {
        const { error: walletError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: selectedUser,
              allocated: amountValue,
              company_spent: 0,
              reimbursed: 0,
              balance: amountValue,
              proof_pending: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);
          
        if (walletError) {
          console.error('Error creating wallet:', walletError);
          toast.error("Failed to create wallet: " + walletError.message);
          return;
        }
      }

      toast.success(`₹${amountValue.toLocaleString()} allocated successfully via ${paymentMethod}!`);
      setOpen(false);
      setSelectedUser("");
      setAmount("");
      setPurpose("");
      setAllocationDate("");
      setPaymentMethod("");
      
      // Refresh all data
      fetchWallets();
      fetchWalletAllocations();
      fetchExpenses();
      
      window.dispatchEvent(new CustomEvent('walletUpdated', { 
        detail: { userId: selectedUser } 
      }));
    } catch (error: any) {
      toast.error("Failed to allocate funds: " + (error.message || "Unknown error"));
      console.error("Error allocating funds:", error);
    }
  };

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

  // Use accurate metrics for display
  const { totalBalance, totalProofPending, totalAllocated, totalCompanySpent, totalReimbursed } = calculateAccurateWalletMetrics;

  // Determine which wallet data to use for table display
  const displayWallets = filteredWallets;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
            <p className="text-muted-foreground">Allocate and manage CXO wallet funds</p>
          </div>
          
          {/* Controls Section - Moved below the header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border">
            {/* Date Range Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
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

            {/* Allocate Funds Button */}
            <div className="w-full sm:w-auto">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <PlusCircle className="w-4 h-4" />
                    Allocate Funds
                  </Button>
                </DialogTrigger>
                {/* <DialogContent> */}
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-4">

                  <DialogHeader>
                    <DialogTitle>Allocate Wallet Funds</DialogTitle>
                    <DialogDescription>Add funds to a CXO wallet</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select CXO</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a CXO" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length > 0 ? (
                            users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role || 'user'})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-users" disabled>
                              No users available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {users.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No users found. Please check your database connection.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allocationDate">Allocation Date *</Label>
                      <Input
                        id="allocationDate"
                        type="date"
                        value={allocationDate}
                        onChange={(e) => setAllocationDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india_bank">India Bank</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose/Notes</Label>
                      <Textarea
                        placeholder="Describe the purpose of allocation"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAllocate} disabled={users.length === 0}>
                      Allocate Funds
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Summary Cards with Accurate Calculations */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                  <p className="text-2xl font-bold">
                    ₹{totalAllocated.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Funds allocated to CXOs
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Current Balance</p>
                  <p className="text-2xl font-bold">
                    ₹{totalBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Available across all CXO wallets
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-warning">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Proof Pending</p>
                  <p className="text-2xl font-bold text-warning">
                    ₹{totalProofPending.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rejected expenses requiring proof
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Company Spent</p>
                  <p className="text-xl font-bold">
                    ₹{totalCompanySpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reimbursed</p>
                  <p className="text-xl font-bold">
                    ₹{totalReimbursed.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Wallet Details {dateRange.from && dateRange.to 
                ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
                : ''}
            </CardTitle>
            <CardDescription>
              {dateRange.from && dateRange.to 
                ? `Wallet activity for selected date range` 
                : 'Complete breakdown of all CXO wallets'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading wallet data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Wallet Start</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Company Spent</TableHead>
                    <TableHead className="text-right">Reimbursed</TableHead>
                    <TableHead className="text-right">Wallet End</TableHead>
                    <TableHead className="text-right">Proof Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayWallets.length > 0 ? (
                    displayWallets.map((wallet) => (
                      <TableRow key={wallet.user_id}>
                        <TableCell className="font-medium">
                          {wallet.users?.name || 'Unknown User'}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(wallet.allocated || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(wallet.allocated || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(wallet.company_spent || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(wallet.reimbursed || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₹{(wallet.balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-warning font-semibold">
                          ₹{(wallet.proof_pending || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {dateRange.from && dateRange.to 
                          ? 'No wallet activity found for selected date range' 
                          : 'No wallet data available. Allocate funds to get started.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}