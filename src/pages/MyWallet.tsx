// // FULL MODIFIED CODE WITH REJECTED EXPENSES NOT DEDUCTED FROM BALANCE
// // -----------------------------------------------

// import { useState, useEffect, useMemo } from "react";
// import Layout from "@/components/Layout";
// import KPICard from "@/components/KPICard";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { supabase } from "@/lib/supabaseClient";
// import { useAuth } from "@/contexts/AuthContext";
// import { useExpenses } from "@/hooks/useExpenses";
// import { PlusCircle, Wallet, DollarSign, TrendingUp, AlertCircle, CalendarIcon } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
// import { NavLink } from "react-router-dom";

// // UPDATED CATEGORIES WITH SUB-CATEGORIES
// const categories = {
//   "Commission": [],
//   "Company Incorporation": [],
//   "Course": [],
//   "Food": ["Snacks", "Tea", "Biscuits", "Meals", "Coffee", "Drinks"],
//   "Influencers Fees": [],
//   "Internet": [],
//   "Management Expenses": [],
//   "Marketing": [],
//   "Miscellaneous": [],
//   "Office Equipment": [],
//   "Software": [
//     "Supabase",
//     "AWS",
//     "Microsoft",
//     "Microsoft Emails",
//     "Domain",
//     "Canva",
//     "Freepik",
//     "Apify",
//     "ChatGPT"
//   ],
//   "Travel": [],
//   "Office Supplies": [],
//   "Tech Infrastructure": [],
//   "Other": []
// };

// export default function MyWallet() {
//   const { user } = useAuth();
//   const { expenses, submitExpense, error } = useExpenses(user?.id);
//   const [open, setOpen] = useState(false);
//   const [category, setCategory] = useState("");
//   const [subCategory, setSubCategory] = useState("");
//   const [amount, setAmount] = useState("");
//   const [source, setSource] = useState("company");
//   const [notes, setNotes] = useState("");
//   const [userWallet, setUserWallet] = useState(null);
//   const [dateRange, setDateRange] = useState({ from: null, to: null });
//   const [expenseDate, setExpenseDate] = useState(new Date());
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const filteredExpenses = useMemo(() => {
//     if (!expenses || !Array.isArray(expenses)) return [];
//     if (!dateRange.from || !dateRange.to) return expenses;

//     return expenses.filter(expense => {
//       const expenseDateField = expense.submittedOn;
//       if (!expenseDateField) return false;

//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from);
//       const endDate = endOfDay(dateRange.to);

//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
//   }, [expenses, dateRange]);

//   const calculatePersonalExpenses = useMemo(() => {
//     const personalExpenses = filteredExpenses.filter(e => e.source === 'personal');

//     return {
//       pending: personalExpenses.filter(e => e.status === 'pending').reduce((s,e)=>s+(e.amount||0),0),
//       approved: personalExpenses.filter(e => e.status === 'approved').reduce((s,e)=>s+(e.amount||0),0),
//       rejected: personalExpenses.filter(e => e.status === 'rejected').reduce((s,e)=>s+(e.amount||0),0),
//       total: personalExpenses.reduce((s,e)=>s+(e.amount||0),0)
//     };
//   }, [filteredExpenses]);

//   useEffect(() => {
//     const fetchUserWallet = async () => {
//       if (!user?.id) return;

//       const { data, error } = await supabase
//         .from('wallets')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();

//       if (!error) setUserWallet(data);
//     };

//     fetchUserWallet();

//     const handleWalletUpdate = (event) => {
//       if (event.detail.userId === user?.id) fetchUserWallet();
//     };

//     window.addEventListener('walletUpdated', handleWalletUpdate);
//     return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
//   }, [user?.id]);

//   const calculateWalletFromExpenses = useMemo(() => {
//     if (!filteredExpenses || !Array.isArray(filteredExpenses)) {
//       return {
//         balance: (userWallet?.allocated || 0) - (userWallet?.company_spent || 0),
//         company_spent: userWallet?.company_spent || 0,
//         reimbursed: 0,
//         proof_pending: 0
//       };
//     }

//     const personal = filteredExpenses.filter(e => e.source === 'personal');
//     const company = filteredExpenses.filter(e => e.source === 'company');

//     const companySpent = company.reduce((s,e)=>s+(e.amount||0),0);
    
//     // Only count personal expenses that are NOT rejected (pending + approved)
//     const validPersonalSpent = personal
//       .filter(e => e.status !== 'rejected')
//       .reduce((s,e)=>s+(e.amount||0),0);
    
//     // Calculate total spent (company + valid personal expenses)
//     const totalSpent = companySpent + validPersonalSpent;
    
//     return {
//       balance: (userWallet?.allocated || 0) - totalSpent, // Subtract only non-rejected expenses
//       company_spent: companySpent,
//       reimbursed: personal.filter(e=>e.status==='pending').reduce((s,e)=>s+(e.amount||0),0),
//       proof_pending: personal.filter(e=>e.status==='rejected').reduce((s,e)=>s+(e.amount||0),0)
//     };
//   }, [filteredExpenses, userWallet]);

//   const handleSubmit = async () => {
//     if (!category || !amount || !expenseDate) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     // If category has sub-categories but none is selected
//     if (categories[category] && categories[category].length > 0 && !subCategory) {
//       toast.error("Please select a sub-category");
//       return;
//     }

//     const amountValue = parseFloat(amount);
//     if (isNaN(amountValue) || amountValue <= 0) {
//       toast.error("Invalid amount");
//       return;
//     }

//     const isCXO = user?.role === 'cxo';
//     const expenseStatus = (isCXO && source === "company") ? "approved" : "pending";

//     setIsSubmitting(true);

//     try {
//       // Direct Supabase insertion with ALL required fields including subcategory
//       const { data, error } = await supabase
//         .from('expenses')
//         .insert([
//           {
//             user_id: user.id,
//             category: category,
//             subcategory: subCategory || null, // This will store the selected subcategory
//             amount: amountValue,
//             source: source,
//             status: expenseStatus,
//             submitted_on: format(expenseDate, 'yyyy-MM-dd'),
//             notes: notes
//           }
//         ])
//         .select();

//       if (error) {
//         console.error('Supabase error:', error);
//         throw error;
//       }

//       // Refresh expenses to show the new one
//       // refreshExpenses is not available, so we'll rely on the useEffect to refresh

//       toast.success("Expense submitted successfully");

//       setOpen(false);
//       setCategory("");
//       setSubCategory("");
//       setAmount("");
//       setSource("company");
//       setNotes("");
//       setExpenseDate(new Date());

//     } catch (error) {
//       console.error('Error submitting expense:', error);
//       toast.error("Failed to submit expense: " + error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const variants = {
//       approved: "default",
//       pending: "secondary",
//       rejected: "destructive",
//       proof_pending: "outline",
//     };
//     return <Badge variant={variants[status] || "default"}>{status}</Badge>;
//   };

//   const displayWallet = calculateWalletFromExpenses;

//   const getExpenseDate = (expense) => expense.submittedOn;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
//             <p className="text-muted-foreground">Track your expenses and wallet balance</p>
//           </div>

//           <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <PlusCircle className="w-4 h-4" />
//                 Add Expense
//               </Button>
//             </DialogTrigger>

//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Submit New Expense</DialogTitle>
//                 <DialogDescription>Add an expense for CFO approval</DialogDescription>
//               </DialogHeader>

//               <div className="space-y-4 py-4">
//                 {/* CATEGORY */}
//                 <div className="space-y-2">
//                   <Label>Category *</Label>
//                   <Select
//                     value={category}
//                     onValueChange={(value) => {
//                       setCategory(value);
//                       setSubCategory("");
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Object.keys(categories).map((cat) => (
//                         <SelectItem key={cat} value={cat}>{cat}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* SUB CATEGORY */}
//                 {categories[category] && categories[category].length > 0 && (
//                   <div className="space-y-2">
//                     <Label>Sub-Category *</Label>
//                     <Select value={subCategory} onValueChange={setSubCategory}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select sub-category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories[category].map((sub) => (
//                           <SelectItem key={sub} value={sub}>{sub}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <Label>Amount (₹) *</Label>
//                   <Input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Source *</Label>
//                   <Select value={source} onValueChange={setSource}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="company">Company Wallet</SelectItem>
//                       <SelectItem value="personal">Personal (Reimbursement)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Date *</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className="w-full justify-start">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {format(expenseDate, "PPP")}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0">
//                       <Calendar
//                         mode="single"
//                         selected={expenseDate}
//                         onSelect={(date)=>date && setExpenseDate(date)}
//                       />
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Notes</Label>
//                   <Textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
//                 </div>
//               </div>

//               <DialogFooter>
//                 <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
//                 <Button onClick={handleSubmit} disabled={isSubmitting}>
//                   {isSubmitting ? "Submitting..." : "Submit Expense"}
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <KPICard title="Current Balance" value={`₹${displayWallet.balance}`} icon={Wallet} />
//           <KPICard title="Company Spent" value={`₹${displayWallet.company_spent}`} icon={DollarSign} />
//           <KPICard title="Reimbursed" value={`₹${displayWallet.reimbursed}`} icon={TrendingUp} />
//           <KPICard title="Proof Pending" value={`₹${displayWallet.proof_pending}`} icon={AlertCircle} />
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>My Expense History</CardTitle>
//             <CardDescription>{filteredExpenses.length} records found</CardDescription>
//           </CardHeader>

//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Expense ID</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Sub Category</TableHead>
//                   <TableHead>Source</TableHead>
//                   <TableHead className="text-right">Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Submitted</TableHead>
//                   <TableHead>Notes</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredExpenses.map((expense) => (
//                   <TableRow key={expense.id}>
//                     <TableCell>{expense.id?.substring(0,8)}</TableCell>
//                     <TableCell>
//                       <NavLink 
//                         to="/expense-categories" 
//                         className="text-blue-600 hover:text-blue-800 hover:underline"
//                       >
//                         {expense.category}
//                       </NavLink>
//                     </TableCell>
//                     <TableCell>{expense.subcategory || '-'}</TableCell>
//                     <TableCell>
//                       <Badge variant={expense.source==="company"?"default":"secondary"}>
//                         {expense.source === "company" ? "Company" : "Personal"}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right">₹{expense.amount}</TableCell>
//                     <TableCell>{getStatusBadge(expense.status)}</TableCell>
//                     <TableCell>{getExpenseDate(expense) ? new Date(getExpenseDate(expense)).toLocaleDateString() : 'N/A'}</TableCell>
//                     <TableCell className="max-w-[200px] truncate">{expense.notes || 'No notes'}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }
















// FULL MODIFIED CODE WITH CORRECT REIMBURSEMENT LOGIC
// -----------------------------------------------

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import KPICard from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { PlusCircle, Wallet, DollarSign, TrendingUp, AlertCircle, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { NavLink } from "react-router-dom";

// UPDATED CATEGORIES WITH SUB-CATEGORIES
const categories = {
  "Commission": [],
  "Company Incorporation": [],
  "Course": [],
  "Food": ["Snacks", "Tea", "Biscuits", "Meals", "Coffee", "Drinks"],
  "Influencers Fees": [],
  "Internet": [],
  "Management Expenses": [],
  "Marketing": [],
  "Miscellaneous": [],
  "Office Equipment": [],
  "Software": [
    "Supabase",
    "AWS",
    "Microsoft",
    "Microsoft Emails",
    "Domain",
    "Canva",
    "Freepik",
    "Apify",
    "ChatGPT"
  ],
  "Travel": [],
  "Office Supplies": [],
  "Tech Infrastructure": [],
  "Other": []
};

export default function MyWallet() {
  const { user } = useAuth();
  const { expenses, submitExpense, error } = useExpenses(user?.id);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("company");
  const [notes, setNotes] = useState("");
  const [userWallet, setUserWallet] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredExpenses = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return [];
    if (!dateRange.from || !dateRange.to) return expenses;

    return expenses.filter(expense => {
      const expenseDateField = expense.submittedOn;
      if (!expenseDateField) return false;

      const expenseDate = new Date(expenseDateField);
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);

      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
  }, [expenses, dateRange]);

  const calculatePersonalExpenses = useMemo(() => {
    const personalExpenses = filteredExpenses.filter(e => e.source === 'personal');

    return {
      pending: personalExpenses.filter(e => e.status === 'pending').reduce((s,e)=>s+(e.amount||0),0),
      approved: personalExpenses.filter(e => e.status === 'approved').reduce((s,e)=>s+(e.amount||0),0),
      rejected: personalExpenses.filter(e => e.status === 'rejected').reduce((s,e)=>s+(e.amount||0),0),
      total: personalExpenses.reduce((s,e)=>s+(e.amount||0),0)
    };
  }, [filteredExpenses]);

  useEffect(() => {
    const fetchUserWallet = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error) setUserWallet(data);
    };

    fetchUserWallet();

    const handleWalletUpdate = (event) => {
      if (event.detail.userId === user?.id) fetchUserWallet();
    };

    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [user?.id]);

  const calculateWalletFromExpenses = useMemo(() => {
    if (!filteredExpenses || !Array.isArray(filteredExpenses)) {
      return {
        balance: (userWallet?.allocated || 0) - (userWallet?.company_spent || 0),
        company_spent: userWallet?.company_spent || 0,
        reimbursed: 0,
        proof_pending: 0
      };
    }

    const personal = filteredExpenses.filter(e => e.source === 'personal');
    const company = filteredExpenses.filter(e => e.source === 'company');

    const companySpent = company.reduce((s,e)=>s+(e.amount||0),0);
    
    // Only count APPROVED personal expenses for balance deduction
    const approvedPersonalSpent = personal
      .filter(e => e.status === 'approved')
      .reduce((s,e)=>s+(e.amount||0),0);
    
    // Calculate total spent (company + approved personal expenses)
    const totalSpent = companySpent + approvedPersonalSpent;
    
    return {
      balance: (userWallet?.allocated || 0) - totalSpent, // Subtract only company and approved personal expenses
      company_spent: companySpent,
      reimbursed: personal.filter(e=>e.status==='pending').reduce((s,e)=>s+(e.amount||0),0),
      proof_pending: personal.filter(e=>e.status==='rejected').reduce((s,e)=>s+(e.amount||0),0)
    };
  }, [filteredExpenses, userWallet]);

  const handleSubmit = async () => {
    if (!category || !amount || !expenseDate) {
      toast.error("Please fill all required fields");
      return;
    }

    // If category has sub-categories but none is selected
    if (categories[category] && categories[category].length > 0 && !subCategory) {
      toast.error("Please select a sub-category");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Invalid amount");
      return;
    }

    const isCXO = user?.role === 'cxo';
    const expenseStatus = (isCXO && source === "company") ? "approved" : "pending";

    setIsSubmitting(true);

    try {
      // Direct Supabase insertion with ALL required fields including subcategory
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            category: category,
            subcategory: subCategory || null, // This will store the selected subcategory
            amount: amountValue,
            source: source,
            status: expenseStatus,
            submitted_on: format(expenseDate, 'yyyy-MM-dd'),
            notes: notes
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Refresh expenses to show the new one
      // refreshExpenses is not available, so we'll rely on the useEffect to refresh

      toast.success("Expense submitted successfully");

      setOpen(false);
      setCategory("");
      setSubCategory("");
      setAmount("");
      setSource("company");
      setNotes("");
      setExpenseDate(new Date());

    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error("Failed to submit expense: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      proof_pending: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const displayWallet = calculateWalletFromExpenses;

  const getExpenseDate = (expense) => expense.submittedOn;
  
  // Handle date range apply
  const handleApplyDateRange = () => {
    setIsDateRangeOpen(false);
  };

  // Handle date range clear
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

  return (
  <Layout>
    <div className="space-y-6">
      {/* Header Section - Fixed for mobile */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">Track your expenses and wallet balance</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Date Range Selector */}
          <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateRangeDisplay()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-4" align="end">
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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <PlusCircle className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>

            {/* <DialogContent> */}
               <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-4">
              {/* Dialog content remains exactly the same */}
              <DialogHeader>
                <DialogTitle>Submit New Expense</DialogTitle>
                <DialogDescription>Add an expense for CFO approval</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* CATEGORY */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value);
                      setSubCategory("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SUB CATEGORY */}
                {categories[category] && categories[category].length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub-Category *</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[category].map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
                  <Input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Source *</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company Wallet</SelectItem>
                      <SelectItem value="personal">Personal (Reimbursement)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(expenseDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expenseDate}
                        onSelect={(date)=>date && setExpenseDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rest of your code remains exactly the same */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Current Balance" value={`₹${displayWallet.balance}`} icon={Wallet} />
        <KPICard title="Company Spent" value={`₹${displayWallet.company_spent}`} icon={DollarSign} />
        <KPICard title="Reimbursed" value={`₹${displayWallet.reimbursed}`} icon={TrendingUp} />
        <KPICard title="Proof Pending" value={`₹${displayWallet.proof_pending}`} icon={AlertCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            My Expense History - {dateRange.from && dateRange.to 
              ? `${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
              : 'All Dates'}
          </CardTitle>
          <CardDescription>
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found {dateRange.from && dateRange.to ? 'for selected date range' : 'across all dates'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.id?.substring(0,8)}</TableCell>
                  <TableCell>
                    <NavLink 
                      to="/expense-categories" 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {expense.category}
                    </NavLink>
                  </TableCell>
                  <TableCell>{expense.subcategory || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={expense.source==="company"?"default":"secondary"}>
                      {expense.source === "company" ? "Company" : "Personal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{expense.amount}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell>{getExpenseDate(expense) ? new Date(getExpenseDate(expense)).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{expense.notes || 'No notes'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </Layout>
);
}