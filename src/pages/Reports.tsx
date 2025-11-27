// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import KPICard from "@/components/KPICard";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { mockWallets, mockCompanyExpenses } from "@/lib/mockData";
// import { supabase } from "@/lib/supabaseClient";
// import { Download, Wallet, DollarSign, TrendingUp, AlertCircle, CalendarIcon } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Reports() {
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [companyExpenses, setCompanyExpenses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch data for reports
//   useEffect(() => {
//     fetchDataWithFilters();
//   }, []);

//   // Calculate KPIs from Supabase data only, show 0 when no data
//   const totalAllocated = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (w.allocated || 0), 0)
//     : 0;
    
//   const totalCompanySpent = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (w.company_spent || 0), 0)
//     : 0;
    
//   const totalReimbursed = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0) // Ensure positive value
//     : 0;
    
//   const totalProofPending = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (w.proof_pending || 0), 0)
//     : 0;
    
//   const totalCompanyExpenses = companyExpenses && Array.isArray(companyExpenses) && companyExpenses.length > 0
//     ? companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
//     : 0;

//   // Generate monthly summary from actual data
//   const generateMonthlySummary = () => {
//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();
    
//     // Get last 3 months including current month
//     const months = [];
//     for (let i = 2; i >= 0; i--) {
//       const date = new Date(currentYear, currentMonth - i, 1);
//       const monthName = format(date, "MMM");
//       const year = date.getFullYear();
      
//       // Filter wallets for this month
//       const monthWallets = wallets.filter(wallet => {
//         if (!wallet.created_at) return false;
//         const walletDate = new Date(wallet.created_at);
//         return walletDate.getMonth() === date.getMonth() && walletDate.getFullYear() === year;
//       });
      
//       // Filter company expenses for this month
//       const monthCompanyExpenses = companyExpenses.filter(expense => {
//         if (!expense.date) return false;
//         const expenseDate = new Date(expense.date);
//         return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === year;
//       });
      
//       // Calculate totals for the month - ensure reimbursed is positive
//       const walletDistributed = monthWallets.reduce((sum, w) => sum + (w.allocated || 0), 0);
//       const companySpend = monthCompanyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
//       const reimbursed = monthWallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0); // Ensure positive value
//       const proofPending = monthWallets.reduce((sum, w) => sum + (w.proof_pending || 0), 0);
      
//       months.push({
//         month: monthName,
//         year: year,
//         wallet: walletDistributed,
//         company: companySpend,
//         reimbursed: reimbursed, // This will always be positive
//         pending: proofPending,
//         total: walletDistributed + companySpend + reimbursed
//       });
//     }
    
//     return months;
//   };

//   const monthlySummaryData = generateMonthlySummary();

//   // Generate category data from actual expenses
//   const generateCategoryData = () => {
//     const categories: { [key: string]: number } = {};
    
//     companyExpenses.forEach(expense => {
//       if (expense.category && expense.amount) {
//         categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
//       }
//     });
    
//     // Convert to array format for chart
//     return Object.entries(categories).map(([category, amount]) => ({
//       category: category.charAt(0).toUpperCase() + category.slice(1),
//       amount: amount
//     }));
//   };

//   const categoryData = generateCategoryData().length > 0 
//     ? generateCategoryData() 
//     : [
//         { category: "Marketing", amount: 47000 },
//         { category: "Tech", amount: 70000 },
//         { category: "Travel", amount: 28000 },
//         { category: "Office", amount: 18000 },
//         { category: "Utilities", amount: 12000 },
//       ];

//   // Generate monthly chart data from actual data - ensure reimbursed is positive
//   const monthlyChartData = monthlySummaryData.map(monthData => ({
//     month: monthData.month,
//     wallet: monthData.wallet,
//     company: monthData.company,
//     reimbursed: monthData.reimbursed, // Already positive from monthly summary
//     pending: monthData.pending
//   }));

//   const handleExport = (format: "pdf" | "csv") => {
//     toast.success(`Generating ${format.toUpperCase()} report...`);
//   };

//   // Filter wallets based on date range
//   const filteredWalletsByDate = (walletsToFilter: any[]) => {
//     // If no date range is selected, return all wallets
//     if (!dateRange.from || !dateRange.to) return walletsToFilter;
    
//     return walletsToFilter.filter(wallet => {
//       const walletDateField = wallet.created_at;
//       if (!walletDateField) return false;
      
//       const walletDate = new Date(walletDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(walletDate, { start: startDate, end: endDate });
//     });
//   };

//   // Filter company expenses based on date range
//   const filteredCompanyExpensesByDate = (expensesToFilter: any[]) => {
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
//     // Refresh data with date filter
//     fetchData();
//   };

//   const handleClearDateRange = () => {
//     setDateRange({ from: null, to: null });
//     setIsDateRangeOpen(false);
//     // Refresh data without date filter
//     fetchData();
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

//   // Override fetchData to use date filters if needed
//   const fetchDataWithFilters = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch wallets
//       const { data: walletsData, error: walletsError } = await supabase
//         .from('wallets')
//         .select('*');
        
//       if (walletsError) throw walletsError;
      
//       // Fetch company expenses
//       const { data: companyExpensesData, error: companyExpensesError } = await supabase
//         .from('company_expenses')
//         .select('*');
        
//       if (companyExpensesError) throw companyExpensesError;
      
//       // Apply date filters if range is selected
//       const filteredWallets = filteredWalletsByDate(walletsData || []);
//       const filteredCompanyExpenses = filteredCompanyExpensesByDate(companyExpensesData || []);
      
//       setWallets(filteredWallets);
//       setCompanyExpenses(filteredCompanyExpenses);
//     } catch (err) {
//       console.error('Error fetching report data:', err);
//       toast.error("Failed to fetch report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchData = fetchDataWithFilters;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
//             <p className="text-muted-foreground">Comprehensive financial overview and insights</p>
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
//                       <label htmlFor="start-date" className="text-xs text-muted-foreground">
//                         Start Date
//                       </label>
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
//                       <label htmlFor="end-date" className="text-xs text-muted-foreground">
//                         End Date
//                       </label>
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
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => handleExport("pdf")} className="gap-2">
//                 <Download className="w-4 h-4" />
//                 Export PDF
//               </Button>
//               <Button variant="outline" onClick={() => handleExport("csv")} className="gap-2">
//                 <Download className="w-4 h-4" />
//                 Export CSV
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* KPI Cards - Reimbursements KPI now shows positive value */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <KPICard title="Wallet Allocated" value={`₹${totalAllocated.toLocaleString()}`} icon={Wallet} trend="+12%" trendUp />
//           <KPICard title="Company Expenses" value={`₹${totalCompanyExpenses.toLocaleString()}`} icon={DollarSign} trend="+8%" trendUp />
//           <KPICard title="Reimbursements" value={`₹${totalReimbursed.toLocaleString()}`} icon={TrendingUp} trend="+5%" trendUp />
//           <KPICard
//             title="Proof Pending"
//             value={`₹${totalProofPending.toLocaleString()}`}
//             icon={AlertCircle}
//             className="border-warning"
//           />
//         </div>

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Spend by Category</CardTitle>
//               <CardDescription>Breakdown of expenses by category</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={categoryData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="category" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="amount" fill="hsl(var(--primary))" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Expense Overview</CardTitle>
//               <CardDescription>Last 3 months trend</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={monthlyChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="wallet" stroke="hsl(var(--chart-1))" name="Wallet Spend" />
//                   <Line type="monotone" dataKey="company" stroke="hsl(var(--chart-2))" name="Company Expense" />
//                   <Line type="monotone" dataKey="reimbursed" stroke="hsl(var(--chart-3))" name="Reimbursed" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Monthly Summary Table - Reimbursements now show as positive values */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Summary</CardTitle>
//             <CardDescription>Detailed breakdown by month</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Month</TableHead>
//                   <TableHead className="text-right">Wallet Distributed</TableHead>
//                   <TableHead className="text-right">Company Spend</TableHead>
//                   <TableHead className="text-right">Reimbursed</TableHead>
//                   <TableHead className="text-right">Proof Pending</TableHead>
//                   <TableHead className="text-right">Total</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {monthlySummaryData.map((data) => (
//                   <TableRow key={`${data.month}-${data.year}`}>
//                     <TableCell className="font-medium">{data.month} {data.year}</TableCell>
//                     <TableCell className="text-right">₹{data.wallet.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">₹{data.company.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">₹{data.reimbursed.toLocaleString()}</TableCell>
//                     <TableCell className="text-right text-warning">₹{data.pending.toLocaleString()}</TableCell>
//                     <TableCell className="text-right font-bold">
//                       ₹{data.total.toLocaleString()}
//                     </TableCell>
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































// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import KPICard from "@/components/KPICard";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { mockWallets, mockCompanyExpenses } from "@/lib/mockData";
// import { supabase } from "@/lib/supabaseClient";
// import { Download, Wallet, DollarSign, TrendingUp, AlertCircle, CalendarIcon } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Reports() {
//   const [wallets, setWallets] = useState<any[]>([]);
//   const [companyExpenses, setCompanyExpenses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch data for reports
//   useEffect(() => {
//     fetchDataWithFilters();
//   }, []);

//   // Calculate KPIs from Supabase data only, show 0 when no data
//   const totalAllocated = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (w.allocated || 0), 0)
//     : 0;
    
//   const totalCompanySpent = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (w.company_spent || 0), 0)
//     : 0;
    
//   const totalReimbursed = wallets && Array.isArray(wallets) && wallets.length > 0 
//     ? wallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0) // Ensure positive value
//     : 0;
    
//   // const totalProofPending = wallets && Array.isArray(wallets) && wallets.length > 0 
//   //   ? wallets.reduce((sum, w) => sum + (w.proof_pending || 0), 0)
//   //   : 0;




// const [expenses, setExpenses] = useState<any[]>([]);
//   const [monthlySummaryData, setMonthlySummaryData] = useState<any[]>([]);

//   // Update monthly summary when data changes
//   useEffect(() => {
//     setMonthlySummaryData(generateMonthlySummary());
//   }, [wallets, companyExpenses]);

//   const totalCompanyExpenses = companyExpenses && Array.isArray(companyExpenses) && companyExpenses.length > 0
//     ? companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
//     : 0;

//   // Calculate total proof pending from expenses
//   const totalProofPending = expenses && Array.isArray(expenses) && expenses.length > 0
//     ? expenses
//         .filter(e => e.status === "rejected" || e.status === "proof_pending")
//         .reduce((sum, e) => sum + Number(e.amount || 0), 0)
//     : 0;

//   // Generate monthly summary from actual data
//   const generateMonthlySummary = () => {
//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();
    
//     // Get last 3 months including current month
//     const months = [];
//     for (let i = 2; i >= 0; i--) {
//       const date = new Date(currentYear, currentMonth - i, 1);
//       const monthName = format(date, "MMM");
//       const year = date.getFullYear();
      
//       // Filter wallets for this month
//       const monthWallets = wallets.filter(wallet => {
//         if (!wallet.created_at) return false;
//         const walletDate = new Date(wallet.created_at);
//         return walletDate.getMonth() === date.getMonth() && walletDate.getFullYear() === year;
//       });
      
//       // Filter company expenses for this month
//       const monthCompanyExpenses = companyExpenses.filter(expense => {
//         if (!expense.date) return false;
//         const expenseDate = new Date(expense.date);
//         return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === year;
//       });
      
//       // Calculate totals for the month - ensure reimbursed is positive
//       const walletDistributed = monthWallets.reduce((sum, w) => sum + (w.allocated || 0), 0);
//       const companySpend = monthCompanyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
//       const reimbursed = monthWallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0); // Ensure positive value
//       const proofPending = monthWallets.reduce((sum, w) => sum + (w.proof_pending || 0), 0);
      
//       months.push({
//         month: monthName,
//         year: year,
//         wallet: walletDistributed,
//         company: companySpend,
//         reimbursed: reimbursed, // This will always be positive
//         pending: proofPending,
//         total: walletDistributed + companySpend + reimbursed
//       });
//     }
    
//     return months;
//   };

//   // Generate category data from actual expenses
//   const generateCategoryData = () => {
//     const categories: { [key: string]: number } = {};
    
//     companyExpenses.forEach(expense => {
//       if (expense.category && expense.amount) {
//         categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
//       }
//     });
    
//     // Convert to array format for chart
//     return Object.entries(categories).map(([category, amount]) => ({
//       category: category.charAt(0).toUpperCase() + category.slice(1),
//       amount: amount
//     }));
//   };

//   const categoryData = generateCategoryData().length > 0 
//     ? generateCategoryData() 
//     : [
//         { category: "Marketing", amount: 47000 },
//         { category: "Tech", amount: 70000 },
//         { category: "Travel", amount: 28000 },
//         { category: "Office", amount: 18000 },
//         { category: "Utilities", amount: 12000 },
//       ];

//   // Generate monthly chart data from actual data - ensure reimbursed is positive
//   const monthlyChartData = monthlySummaryData.map(monthData => ({
//     month: monthData.month,
//     wallet: monthData.wallet,
//     company: monthData.company,
//     reimbursed: monthData.reimbursed, // Already positive from monthly summary
//     pending: monthData.pending
//   }));

//   const handleExport = (format: "pdf" | "csv") => {
//     toast.success(`Generating ${format.toUpperCase()} report...`);
//   };

//   // Filter wallets based on date range
//   const filteredWalletsByDate = (walletsToFilter: any[]) => {
//     // If no date range is selected, return all wallets
//     if (!dateRange.from || !dateRange.to) return walletsToFilter;
    
//     return walletsToFilter.filter(wallet => {
//       const walletDateField = wallet.created_at;
//       if (!walletDateField) return false;
      
//       const walletDate = new Date(walletDateField);
//       const startDate = startOfDay(dateRange.from!);
//       const endDate = endOfDay(dateRange.to!);
      
//       return isWithinInterval(walletDate, { start: startDate, end: endDate });
//     });
//   };

//   // Filter company expenses based on date range
//   const filteredCompanyExpensesByDate = (expensesToFilter: any[]) => {
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
//     // Refresh data with date filter
//     fetchData();
//   };

//   const handleClearDateRange = () => {
//     setDateRange({ from: null, to: null });
//     setIsDateRangeOpen(false);
//     // Refresh data without date filter
//     fetchData();
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

//   // Override fetchData to use date filters if needed
//   const fetchDataWithFilters = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch wallets
//       const { data: walletsData, error: walletsError } = await supabase
//         .from('wallets')
//         .select('*');
        
//       if (walletsError) throw walletsError;
      
//       // Fetch company expenses
//       const { data: companyExpensesData, error: companyExpensesError } = await supabase
//         .from('company_expenses')
//         .select('*');
        
//       if (companyExpensesError) throw companyExpensesError;
      
//       // Fetch expenses
//       const { data: expensesData, error: expensesError } = await supabase
//         .from('expenses')
//         .select('*');
        
//       if (expensesError) throw expensesError;
      
//       // Apply date filters if range is selected
//       const filteredWallets = filteredWalletsByDate(walletsData || []);
//       const filteredCompanyExpenses = filteredCompanyExpensesByDate(companyExpensesData || []);
      
//       setWallets(filteredWallets);
//       setCompanyExpenses(filteredCompanyExpenses);
//       setExpenses(expensesData || []);
//     } catch (err) {
//       console.error('Error fetching report data:', err);
//       toast.error("Failed to fetch report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchData = fetchDataWithFilters;

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
//             <p className="text-muted-foreground">Comprehensive financial overview and insights</p>
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
//                       <label htmlFor="start-date" className="text-xs text-muted-foreground">
//                         Start Date
//                       </label>
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
//                       <label htmlFor="end-date" className="text-xs text-muted-foreground">
//                         End Date
//                       </label>
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
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => handleExport("pdf")} className="gap-2">
//                 <Download className="w-4 h-4" />
//                 Export PDF
//               </Button>
//               <Button variant="outline" onClick={() => handleExport("csv")} className="gap-2">
//                 <Download className="w-4 h-4" />
//                 Export CSV
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* KPI Cards - Reimbursements KPI now shows positive value */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <KPICard title="Wallet Allocated" value={`₹${totalAllocated.toLocaleString()}`} icon={Wallet} trend="+12%" trendUp />
//           <KPICard title="Company Expenses" value={`₹${totalCompanyExpenses.toLocaleString()}`} icon={DollarSign} trend="+8%" trendUp />
//           <KPICard title="Reimbursements" value={`₹${totalReimbursed.toLocaleString()}`} icon={TrendingUp} trend="+5%" trendUp />
//           <KPICard
//             title="Proof Pending"
//             value={`₹${totalProofPending.toLocaleString()}`}
//             icon={AlertCircle}
//             className="border-warning"
//           />
//         </div>

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Spend by Category</CardTitle>
//               <CardDescription>Breakdown of expenses by category</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={categoryData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="category" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="amount" fill="hsl(var(--primary))" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Expense Overview</CardTitle>
//               <CardDescription>Last 3 months trend</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={monthlyChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="wallet" stroke="hsl(var(--chart-1))" name="Wallet Spend" />
//                   <Line type="monotone" dataKey="company" stroke="hsl(var(--chart-2))" name="Company Expense" />
//                   <Line type="monotone" dataKey="reimbursed" stroke="hsl(var(--chart-3))" name="Reimbursed" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Monthly Summary Table - Reimbursements now show as positive values */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Summary</CardTitle>
//             <CardDescription>Detailed breakdown by month</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Month</TableHead>
//                   <TableHead className="text-right">Wallet Distributed</TableHead>
//                   <TableHead className="text-right">Company Spend</TableHead>
//                   <TableHead className="text-right">Reimbursed</TableHead>
//                   <TableHead className="text-right">Proof Pending</TableHead>
//                   <TableHead className="text-right">Total</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {monthlySummaryData.map((data) => (
//                   <TableRow key={`${data.month}-${data.year}`}>
//                     <TableCell className="font-medium">{data.month} {data.year}</TableCell>
//                     <TableCell className="text-right">₹{data.wallet.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">₹{data.company.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">₹{data.reimbursed.toLocaleString()}</TableCell>
//                     <TableCell className="text-right text-warning">₹{data.pending.toLocaleString()}</TableCell>
//                     <TableCell className="text-right font-bold">
//                       ₹{data.total.toLocaleString()}
//                     </TableCell>
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























































































import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import KPICard from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { mockWallets, mockCompanyExpenses } from "@/lib/mockData";
import { supabase } from "@/lib/supabaseClient";
import { Download, Wallet, DollarSign, TrendingUp, AlertCircle, CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function Reports() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Fetch data for reports
  useEffect(() => {
    fetchDataWithFilters();
  }, []);

  // Calculate KPIs from Supabase data only, show 0 when no data
  const totalAllocated = wallets && Array.isArray(wallets) && wallets.length > 0 
    ? wallets.reduce((sum, w) => sum + (w.allocated || 0), 0)
    : 0;
    
  const totalCompanySpent = wallets && Array.isArray(wallets) && wallets.length > 0 
    ? wallets.reduce((sum, w) => sum + (w.company_spent || 0), 0)
    : 0;
    
  const totalReimbursed = wallets && Array.isArray(wallets) && wallets.length > 0 
    ? wallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0) // Ensure positive value
    : 0;

  const [expenses, setExpenses] = useState<any[]>([]);
  const [monthlySummaryData, setMonthlySummaryData] = useState<any[]>([]);

  // Update monthly summary when data changes
  useEffect(() => {
    setMonthlySummaryData(generateMonthlySummary());
  }, [wallets, companyExpenses]);

  const totalCompanyExpenses = companyExpenses && Array.isArray(companyExpenses) && companyExpenses.length > 0
    ? companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    : 0;

  // Calculate total proof pending from expenses
  const totalProofPending = expenses && Array.isArray(expenses) && expenses.length > 0
    ? expenses
        .filter(e => e.status === "rejected" || e.status === "proof_pending")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0)
    : 0;

  // Generate monthly summary from actual data
  const generateMonthlySummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get last 3 months including current month
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = format(date, "MMM");
      const year = date.getFullYear();
      
      // Filter wallets for this month
      const monthWallets = wallets.filter(wallet => {
        if (!wallet.created_at) return false;
        const walletDate = new Date(wallet.created_at);
        return walletDate.getMonth() === date.getMonth() && walletDate.getFullYear() === year;
      });
      
      // Filter company expenses for this month
      const monthCompanyExpenses = companyExpenses.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === year;
      });
      
      // Calculate totals for the month - ensure reimbursed is positive
      const walletDistributed = monthWallets.reduce((sum, w) => sum + (w.allocated || 0), 0);
      const companySpend = monthCompanyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const reimbursed = monthWallets.reduce((sum, w) => sum + (Math.abs(w.reimbursed) || 0), 0); // Ensure positive value
      const proofPending = monthWallets.reduce((sum, w) => sum + (w.proof_pending || 0), 0);
      
      months.push({
        month: monthName,
        year: year,
        wallet: walletDistributed,
        company: companySpend,
        reimbursed: reimbursed, // This will always be positive
        pending: proofPending,
        total: walletDistributed + companySpend + reimbursed
      });
    }
    
    return months;
  };

  // Generate category data from actual expenses
  const generateCategoryData = () => {
    const categories: { [key: string]: number } = {};
    
    companyExpenses.forEach(expense => {
      if (expense.category && expense.amount) {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(categories).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: amount
    }));
  };

  const categoryData = generateCategoryData().length > 0 
    ? generateCategoryData() 
    : [
        { category: "Marketing", amount: 47000 },
        { category: "Tech", amount: 70000 },
        { category: "Travel", amount: 28000 },
        { category: "Office", amount: 18000 },
        { category: "Utilities", amount: 12000 },
      ];

  // Generate monthly chart data from actual data - ensure reimbursed is positive
  const monthlyChartData = monthlySummaryData.map(monthData => ({
    month: monthData.month,
    wallet: monthData.wallet,
    company: monthData.company,
    reimbursed: monthData.reimbursed, // Already positive from monthly summary
    pending: monthData.pending
  }));

  const handleExport = (format: "pdf" | "csv") => {
    toast.success(`Generating ${format.toUpperCase()} report...`);
  };

  // Filter wallets based on date range
  const filteredWalletsByDate = (walletsToFilter: any[]) => {
    // If no date range is selected, return all wallets
    if (!dateRange.from || !dateRange.to) return walletsToFilter;
    
    return walletsToFilter.filter(wallet => {
      const walletDateField = wallet.created_at;
      if (!walletDateField) return false;
      
      const walletDate = new Date(walletDateField);
      const startDate = startOfDay(dateRange.from!);
      const endDate = endOfDay(dateRange.to!);
      
      return isWithinInterval(walletDate, { start: startDate, end: endDate });
    });
  };

  // Filter company expenses based on date range
  const filteredCompanyExpensesByDate = (expensesToFilter: any[]) => {
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
    // Refresh data with date filter
    fetchData();
  };

  const handleClearDateRange = () => {
    setDateRange({ from: null, to: null });
    setIsDateRangeOpen(false);
    // Refresh data without date filter
    fetchData();
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

  // Override fetchData to use date filters if needed
  const fetchDataWithFilters = async () => {
    try {
      setLoading(true);
      
      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*');
        
      if (walletsError) throw walletsError;
      
      // Fetch company expenses
      const { data: companyExpensesData, error: companyExpensesError } = await supabase
        .from('company_expenses')
        .select('*');
        
      if (companyExpensesError) throw companyExpensesError;
      
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*');
        
      if (expensesError) throw expensesError;
      
      // Apply date filters if range is selected
      const filteredWallets = filteredWalletsByDate(walletsData || []);
      const filteredCompanyExpenses = filteredCompanyExpensesByDate(companyExpensesData || []);
      
      setWallets(filteredWallets);
      setCompanyExpenses(filteredCompanyExpenses);
      setExpenses(expensesData || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = fetchDataWithFilters;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Comprehensive financial overview and insights</p>
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
                <PopoverContent className="w-[360px] p-4" align="start">
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Date Range</div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="start-date" className="text-xs text-muted-foreground">
                          Start Date
                        </label>
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
                        <label htmlFor="end-date" className="text-xs text-muted-foreground">
                          End Date
                        </label>
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

            {/* Export Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => handleExport("pdf")} 
                className="gap-2 flex-1 sm:flex-none h-9 sm:h-10"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Export</span> PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport("csv")} 
                className="gap-2 flex-1 sm:flex-none h-9 sm:h-10"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Export</span> CSV
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards - Responsive Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <KPICard 
            title="Wallet Allocated" 
            value={`₹${totalAllocated.toLocaleString()}`} 
            icon={Wallet} 
            trend="+12%" 
            trendUp 
            className="text-sm"
          />
          <KPICard 
            title="Company Expenses" 
            value={`₹${totalCompanyExpenses.toLocaleString()}`} 
            icon={DollarSign} 
            trend="+8%" 
            trendUp 
            className="text-sm"
          />
          <KPICard 
            title="Reimbursements" 
            value={`₹${totalReimbursed.toLocaleString()}`} 
            icon={TrendingUp} 
            trend="+5%" 
            trendUp 
            className="text-sm"
          />
          <KPICard
            title="Proof Pending"
            value={`₹${totalProofPending.toLocaleString()}`}
            icon={AlertCircle}
            className="border-warning text-sm"
          />
        </div>

        {/* Charts - Responsive Layout */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Spend by Category</CardTitle>
              <CardDescription className="text-sm sm:text-base">Breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Monthly Expense Overview</CardTitle>
              <CardDescription className="text-sm sm:text-base">Last 3 months trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="wallet" stroke="hsl(var(--chart-1))" name="Wallet Spend" strokeWidth={2} />
                  <Line type="monotone" dataKey="company" stroke="hsl(var(--chart-2))" name="Company Expense" strokeWidth={2} />
                  <Line type="monotone" dataKey="reimbursed" stroke="hsl(var(--chart-3))" name="Reimbursed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary Table - Responsive */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Monthly Summary</CardTitle>
            <CardDescription className="text-sm sm:text-base">Detailed breakdown by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Month</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Wallet Distributed</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden sm:table-cell">Company Spend</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden md:table-cell">Reimbursed</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">Proof Pending</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummaryData.map((data) => (
                    <TableRow key={`${data.month}-${data.year}`}>
                      <TableCell className="font-medium whitespace-nowrap">{data.month} {data.year}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">₹{data.wallet.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap hidden sm:table-cell">₹{data.company.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap hidden md:table-cell">₹{data.reimbursed.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-warning whitespace-nowrap hidden lg:table-cell">₹{data.pending.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold whitespace-nowrap">
                        ₹{data.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card> */}




        <Card>
  <CardHeader>
    <CardTitle className="text-lg sm:text-xl">Monthly Summary</CardTitle>
    <CardDescription className="text-sm sm:text-base">Detailed breakdown by month</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Mobile Card View */}
    <div className="space-y-4 sm:hidden">
      {monthlySummaryData.map((data) => (
        <div key={`${data.month}-${data.year}`} className="border rounded-lg p-4 space-y-3">
          {/* Month Header */}
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-semibold text-base">{data.month} {data.year}</h3>
            <span className="font-bold text-primary">₹{data.total.toLocaleString()}</span>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Wallet Distributed</p>
              <p className="font-medium">₹{data.wallet.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Company Spend</p>
              <p className="font-medium">₹{data.company.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reimbursed</p>
              <p className="font-medium">₹{data.reimbursed.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Proof Pending</p>
              <p className="font-medium text-warning">₹{data.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
      
      {monthlySummaryData.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No monthly data available
        </div>
      )}
    </div>

    {/* Desktop Table View */}
    <div className="hidden sm:block">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Month</TableHead>
              <TableHead className="text-right whitespace-nowrap">Wallet Distributed</TableHead>
              <TableHead className="text-right whitespace-nowrap">Company Spend</TableHead>
              <TableHead className="text-right whitespace-nowrap">Reimbursed</TableHead>
              <TableHead className="text-right whitespace-nowrap">Proof Pending</TableHead>
              <TableHead className="text-right whitespace-nowrap">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlySummaryData.map((data) => (
              <TableRow key={`${data.month}-${data.year}`}>
                <TableCell className="font-medium whitespace-nowrap">{data.month} {data.year}</TableCell>
                <TableCell className="text-right whitespace-nowrap">₹{data.wallet.toLocaleString()}</TableCell>
                <TableCell className="text-right whitespace-nowrap">₹{data.company.toLocaleString()}</TableCell>
                <TableCell className="text-right whitespace-nowrap">₹{data.reimbursed.toLocaleString()}</TableCell>
                <TableCell className="text-right text-warning whitespace-nowrap">₹{data.pending.toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">
                  ₹{data.total.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </CardContent>
</Card>
      </div>
    </Layout>
  );
}