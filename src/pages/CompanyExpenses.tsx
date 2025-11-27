// import React, { useState, useEffect } from "react";
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
// import { PlusCircle, Download, FileText, CalendarIcon } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
// import { NavLink } from "react-router-dom";

// // UPDATED EXPENSE TYPES WITH SUB-CATEGORIES
// const expenseCategories = {
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

// export default function CompanyExpenses() {
//   const [open, setOpen] = useState(false);
//   const [type, setType] = useState("");
//   const [subCategory, setSubCategory] = useState("");
//   const [vendor, setVendor] = useState("");
//   const [amount, setAmount] = useState("");
//   const [paymentRef, setPaymentRef] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [notes, setNotes] = useState("");
//   const [expenseDate, setExpenseDate] = useState<Date | null>(null);
//   const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);
//   const [companyExpenses, setCompanyExpenses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch company expenses
//   useEffect(() => {
//     fetchCompanyExpenses();
//   }, []);

//   const fetchCompanyExpenses = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('company_expenses')
//         .select('*')
//         .order('date', { ascending: false });

//       if (error) throw error;
//       setCompanyExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching company expenses:', err);
//       toast.error("Failed to fetch company expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!type || !vendor || !amount || !paymentRef || !paymentMethod || !expenseDate) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     // If category has sub-categories but none is selected
//     if (expenseCategories[type] && expenseCategories[type].length > 0 && !subCategory) {
//       toast.error("Please select a sub-category");
//       return;
//     }

//     try {
//       const amountValue = parseFloat(amount);
//       if (isNaN(amountValue) || amountValue <= 0) {
//         toast.error("Please enter a valid amount");
//         return;
//       }

//       const { error } = await supabase
//         .from('company_expenses')
//         .insert([
//           {
//             type,
//             subcategory: subCategory || null, // Store subcategory in database
//             vendor,
//             amount: amountValue,
//             date: expenseDate.toISOString(),
//             payment_ref: paymentRef,
//             payment_method: paymentMethod,
//             notes: notes || null,
//             created_at: new Date().toISOString(),
//           }
//         ]);

//       if (error) throw error;

//       toast.success("Company expense recorded successfully!");
//       setOpen(false);
//       setType("");
//       setSubCategory(""); // Reset subcategory
//       setVendor("");
//       setAmount("");
//       setPaymentRef("");
//       setPaymentMethod("");
//       setExpenseDate(null);
//       setNotes("");
//       fetchCompanyExpenses(); // Refresh the list
//     } catch (error: any) {
//       toast.error("Failed to record company expense: " + (error.message || "Unknown error"));
//       console.error("Error recording company expense:", error);
//     }
//   };

//   const handleExport = (format: "csv" | "pdf") => {
//     toast.success(`Exporting company expenses as ${format.toUpperCase()}...`);
//   };

//   // Filter expenses based on date range
//   const filteredExpensesByDate = (expensesToFilter: any[]) => {
//     // If no date range is selected, return all expenses
//     if (!dateRange.from || !dateRange.to) return expensesToFilter;
    
//     return expensesToFilter.filter(expense => {
//       const expenseDateField = expense.date;
//       if (!expenseDateField) return false;
      
//       const expenseDate = new Date(expenseDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(expenseDate, { start: startDate, end: endDate });
//     });
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

//   // Filter expenses by date range
//   const filteredExpenses = filteredExpensesByDate(companyExpenses);
  
//   const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Company Expenses</h1>
//             <p className="text-muted-foreground">Track and manage central company expenses</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
//                   Add Expense
//                 </Button>
//               </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>Add Company Expense</DialogTitle>
//                 <DialogDescription>Record a new company-level expense</DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Expense Type *</Label>
//                     <Select 
//                       value={type} 
//                       onValueChange={(value) => {
//                         setType(value);
//                         setSubCategory(""); // Reset subcategory when main category changes
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.keys(expenseCategories).map((category) => (
//                           <SelectItem key={category} value={category}>
//                             {category}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Amount (₹) *</Label>
//                     <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
//                   </div>
//                 </div>

//                 {/* SUB-CATEGORY SECTION */}
//                 {expenseCategories[type] && expenseCategories[type].length > 0 && (
//                   <div className="space-y-2">
//                     <Label>Sub-Category *</Label>
//                     <Select value={subCategory} onValueChange={setSubCategory}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select sub-category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {expenseCategories[type].map((sub) => (
//                           <SelectItem key={sub} value={sub}>{sub}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <Label>Vendor/Payee *</Label>
//                   <Input placeholder="Enter vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Payment Reference *</Label>
//                     <Input placeholder="Transaction ID / Invoice number" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Payment Method *</Label>
//                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="india_bank">India Bank</SelectItem>
//                         <SelectItem value="upi">UPI</SelectItem>
//                         <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Expense Date *</Label>
//                   <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="w-full justify-start text-left font-normal"
//                       >
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {expenseDate ? format(expenseDate, "dd-MM-yyyy") : "Select date"}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={expenseDate || undefined}
//                         onSelect={(date) => {
//                           setExpenseDate(date || null);
//                           setIsExpenseDateOpen(false);
//                         }}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Proof Upload</Label>
//                   <Input type="file" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Notes</Label>
//                   <Textarea placeholder="Additional details" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => {
//                   setOpen(false);
//                   setExpenseDate(null);
//                   setSubCategory(""); // Reset subcategory when closing
//                 }}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleSubmit}>Save Expense</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//           </div>
//         </div>

//         {/* Summary Card */}
//         <Card className="card-hover">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Company Expenses</p>
//                 <p className="text-3xl font-bold mt-2">₹{totalExpense.toLocaleString()}</p>
//                 <p className="text-xs text-muted-foreground mt-1">This month</p>
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-2">
//                   <Download className="w-4 h-4" />
//                   CSV
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} className="gap-2">
//                   <Download className="w-4 h-4" />
//                   PDF
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Expense Register */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Company Expense Register {dateRange.from && dateRange.to 
//                 ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                 : ''}
//             </CardTitle>
//             <CardDescription>
//               {dateRange.from && dateRange.to 
//                 ? `Company expenses for selected date range` 
//                 : 'All recorded company-level expenses'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">Loading company expenses...</p>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Vendor</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Payment Ref</TableHead>
//                     <TableHead>Payment Method</TableHead>
//                     <TableHead>Proof</TableHead>
//                     <TableHead>Notes</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredExpenses.length > 0 ? (
//                     filteredExpenses.map((expense) => (
//                       <TableRow key={expense.id}>
//                         <TableCell>
//                           {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           <NavLink 
//                             to={`/expense-categories?category=${encodeURIComponent(expense.type || '')}&type=company`} 
//                             className="text-blue-600 hover:text-blue-800 hover:underline"
//                           >
//                             {expense.type || 'N/A'}
//                           </NavLink>
//                           {expense.subcategory && (
//                             <div className="text-xs text-muted-foreground mt-1">
//                               {expense.subcategory}
//                             </div>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           {expense.vendor || 'N/A'}
//                         </TableCell>
//                         <TableCell className="text-right font-semibold">
//                           ₹{(expense.amount || 0).toLocaleString()}
//                         </TableCell>
//                         <TableCell className="font-mono text-sm">
//                           {expense.payment_ref || 'N/A'}
//                         </TableCell>
//                         <TableCell>
//                           {expense.payment_method ? (
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
//                               {expense.payment_method.replace('_', ' ')}
//                             </span>
//                           ) : (
//                             <span className="text-muted-foreground text-sm">-</span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           {expense.proof_url ? (
//                             <Button variant="ghost" size="sm">
//                               <FileText className="w-4 h-4" />
//                             </Button>
//                           ) : (
//                             <span className="text-muted-foreground text-sm">-</span>
//                           )}
//                         </TableCell>
//                         <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
//                           {expense.notes || 'No notes'}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
//                         {dateRange.from && dateRange.to ? 'No company expenses found for selected date range' : 'No company expenses recorded yet'}
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






























































import React, { useState, useEffect } from "react";
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
import { PlusCircle, Download, FileText, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { NavLink } from "react-router-dom";

// UPDATED EXPENSE TYPES WITH SUB-CATEGORIES
const expenseCategories = {
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

export default function CompanyExpenses() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date | null>(null);
  const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);
  const [companyExpenses, setCompanyExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Fetch company expenses
  useEffect(() => {
    fetchCompanyExpenses();
  }, []);

  const fetchCompanyExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setCompanyExpenses(data || []);
    } catch (err) {
      console.error('Error fetching company expenses:', err);
      toast.error("Failed to fetch company expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!type || !vendor || !amount || !paymentRef || !paymentMethod || !expenseDate) {
      toast.error("Please fill all required fields");
      return;
    }

    // If category has sub-categories but none is selected
    if (expenseCategories[type] && expenseCategories[type].length > 0 && !subCategory) {
      toast.error("Please select a sub-category");
      return;
    }

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const { error } = await supabase
        .from('company_expenses')
        .insert([
          {
            type,
            subcategory: subCategory || null, // Store subcategory in database
            vendor,
            amount: amountValue,
            date: expenseDate.toISOString(),
            payment_ref: paymentRef,
            payment_method: paymentMethod,
            notes: notes || null,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast.success("Company expense recorded successfully!");
      setOpen(false);
      setType("");
      setSubCategory(""); // Reset subcategory when main category changes
      setVendor("");
      setAmount("");
      setPaymentRef("");
      setPaymentMethod("");
      setExpenseDate(null);
      setNotes("");
      fetchCompanyExpenses(); // Refresh the list
    } catch (error: any) {
      toast.error("Failed to record company expense: " + (error.message || "Unknown error"));
      console.error("Error recording company expense:", error);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Exporting company expenses as ${format.toUpperCase()}...`);
  };

  // Filter expenses based on date range
  const filteredExpensesByDate = (expensesToFilter: any[]) => {
    // If no date range is selected, return all expenses
    if (!dateRange.from || !dateRange.to) return expensesToFilter;
    
    return expensesToFilter.filter(expense => {
      const expenseDateField = expense.date;
      if (!expenseDateField) return false;
      
      const expenseDate = new Date(expenseDateField);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
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

  // Filter expenses by date range
  const filteredExpenses = filteredExpensesByDate(companyExpenses);
  
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Company Expenses</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track and manage central company expenses</p>
          </div>
          
          {/* Filters Section - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Date Range */}
            <div className="w-full sm:w-auto">
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal h-9 sm:h-10">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{getDateRangeDisplay()}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
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

            {/* Add Expense Button */}
            <div className="w-full sm:w-auto">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto h-9 sm:h-10">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Add Expense</span>
                  </Button>
                </DialogTrigger>
                {/* <DialogContent className="max-w-[95vw] sm:max-w-2xl"> */}
                  <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Add Company Expense</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">Record a new company-level expense</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Expense Type *</Label>
                        <Select 
                          value={type} 
                          onValueChange={(value) => {
                            setType(value);
                            setSubCategory(""); // Reset subcategory when main category changes
                          }}
                        >
                          <SelectTrigger className="h-9 sm:h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(expenseCategories).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Amount (₹) *</Label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-9 sm:h-10"
                        />
                      </div>
                    </div>

                    {/* SUB-CATEGORY SECTION */}
                    {expenseCategories[type] && expenseCategories[type].length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Sub-Category *</Label>
                        <Select value={subCategory} onValueChange={setSubCategory}>
                          <SelectTrigger className="h-9 sm:h-10">
                            <SelectValue placeholder="Select sub-category" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories[type].map((sub) => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Vendor/Payee *</Label>
                      <Input 
                        placeholder="Enter vendor name" 
                        value={vendor} 
                        onChange={(e) => setVendor(e.target.value)}
                        className="h-9 sm:h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Payment Reference *</Label>
                        <Input 
                          placeholder="Transaction ID / Invoice number" 
                          value={paymentRef} 
                          onChange={(e) => setPaymentRef(e.target.value)}
                          className="h-9 sm:h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Payment Method *</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="h-9 sm:h-10">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india_bank">India Bank</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="dubai_bank">Dubai Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Expense Date *</Label>
                      <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 sm:h-10"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expenseDate ? format(expenseDate, "dd-MM-yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expenseDate || undefined}
                            onSelect={(date) => {
                              setExpenseDate(date || null);
                              setIsExpenseDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Proof Upload</Label>
                      <Input type="file" className="h-9 sm:h-10" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Notes</Label>
                      <Textarea 
                        placeholder="Additional details" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        rows={3}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setOpen(false);
                        setExpenseDate(null);
                        setSubCategory(""); // Reset subcategory when closing
                      }}
                      className="h-9 sm:h-10 flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="h-9 sm:h-10 flex-1 sm:flex-none"
                    >
                      Save Expense
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Company Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold">₹{totalExpense.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExport("csv")} 
                  className="gap-2 flex-1 sm:flex-none h-9"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </Button>
                <Button 
              
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExport("pdf")} 
                  className="gap-2 flex-1 sm:flex-none h-9"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Register */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Company Expense Register {dateRange.from && dateRange.to 
                ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
                : ''}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {dateRange.from && dateRange.to 
                ? `Company expenses for selected date range` 
                : 'All recorded company-level expenses'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading company expenses...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap">Vendor</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Payment Ref</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Payment Method</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Proof</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="whitespace-nowrap">
                            {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            <NavLink 
                              to={`/expense-categories?category=${encodeURIComponent(expense.type || '')}&type=company`} 
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {expense.type || 'N/A'}
                            </NavLink>
                            {expense.subcategory && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {expense.subcategory}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {expense.vendor || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            ₹{(expense.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-sm whitespace-nowrap hidden sm:table-cell">
                            {expense.payment_ref || 'N/A'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap hidden md:table-cell">
                            {expense.payment_method ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {expense.payment_method.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap hidden lg:table-cell">
                            {expense.proof_url ? (
                              <Button variant="ghost" size="sm">
                                <FileText className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                            {expense.notes || 'No notes'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {dateRange.from && dateRange.to ? 'No company expenses found for selected date range' : 'No company expenses recorded yet'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}