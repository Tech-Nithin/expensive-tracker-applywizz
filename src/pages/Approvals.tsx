// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { supabase } from "@/lib/supabaseClient";
// import { CheckCircle, XCircle, MessageCircle, FileText, Search } from "lucide-react";
// import { toast } from "sonner";

// export default function Approvals() {
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Fetch all expenses for CFO approval dashboard
//   useEffect(() => {
//     fetchAllExpenses();
//   }, []);

//   const fetchAllExpenses = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('expenses')
//         .select(`
//           *,
//           users (name)
//         `)
//         .order('submitted_on', { ascending: false });

//       if (error) throw error;
      
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (expense: any) => {
//     try {
//       // Update expense status to approved
//       const { error: updateError } = await supabase
//         .from('expenses')
//         .update({ status: 'approved', updated_at: new Date() })
//         .eq('id', expense.id);

//       if (updateError) throw updateError;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', expense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this is a personal expense, process reimbursement
//       if (expense.source === "personal") {
//         try {
//           // Get user's current wallet
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (walletError) {
//             console.error('Error fetching wallet:', walletError);
//             // Try to create a new wallet if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: 0,
//                   reimbursed: isCXO ? -expense.amount : expense.amount,
//                   balance: isCXO ? -expense.amount : 0,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet:', createWalletError);
//               toast.error("Failed to process reimbursement - could not create wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           } else if (walletData) {
//             // Process reimbursement for existing wallet
//             const updatedProofPending = Math.max(0, walletData.proof_pending - expense.amount);
            
//             // For CXO, deduct from reimbursed and balance; for others, add to reimbursed
//             const updatedReimbursed = isCXO 
//               ? walletData.reimbursed - expense.amount 
//               : walletData.reimbursed + expense.amount;
//             const updatedBalance = isCXO 
//               ? walletData.balance - expense.amount 
//               : walletData.balance;
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               reimbursed: updatedReimbursed,
//               updated_at: new Date()
//             };
            
//             // Only update balance for CXO
//             if (isCXO) {
//               updateData.balance = updatedBalance;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet:', walletUpdateError);
//               toast.error("Failed to process reimbursement - could not update wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           }
//         } catch (walletProcessingError) {
//           console.error('Error processing reimbursement:', walletProcessingError);
//           toast.error("Failed to process reimbursement - unexpected error");
//           return;
//         }
//       } else {
//         // For company expenses, update company_spent in wallet
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             // For CXO, also deduct from reimbursed and balance
//             const updateData: any = {
//               company_spent: walletData.company_spent + expense.amount,
//               updated_at: new Date()
//             };
            
//             if (isCXO) {
//               updateData.reimbursed = walletData.reimbursed - expense.amount;
//               updateData.balance = walletData.balance - expense.amount;
//             } else {
//               updateData.balance = walletData.balance - expense.amount;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet for company expense:', walletUpdateError);
//             }
//           } else if (walletError) {
//             // Create new wallet for company expense if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: expense.amount,
//                   reimbursed: isCXO ? -expense.amount : 0,
//                   balance: isCXO ? -expense.amount * 2 : -expense.amount,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet for company expense:', createWalletError);
//             }
//           }
          
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! Wallet updated.`);
//         } catch (walletProcessingError) {
//           console.error('Error processing company expense:', walletProcessingError);
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! (Wallet update had issues)`);
//         }
//       }

//       setSelectedExpense(null);
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to approve expense");
//       console.error("Error approving expense:", error);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a rejection reason");
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('expenses')
//         .update({ 
//           status: 'rejected', 
//           rejection_reason: rejectionReason,
//           updated_at: new Date() 
//         })
//         .eq('id', selectedExpense.id);

//       if (error) throw error;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', selectedExpense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this was a personal expense, we should also reduce the proof_pending amount
//       // For CXO, we might also need to adjust balance and reimbursed amounts
//       if (selectedExpense.source === "personal") {
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updatedProofPending = Math.max(0, walletData.proof_pending - selectedExpense.amount);
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               updated_at: new Date()
//             };
            
//             // For CXO personal expenses, we might need to adjust balance and reimbursed
//             // This would depend on the specific business logic for rejected CXO expenses
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for rejection:', walletError);
//         }
//       } else if (isCXO) {
//         // For rejected company expenses from CXO, we might need to adjust balance and reimbursed
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updateData: any = {
//               updated_at: new Date()
//             };
            
//             // For rejected CXO company expenses, reverse the adjustments
//             // This would depend on the specific business logic
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for CXO company expense rejection:', walletError);
//         }
//       }

//       toast.error(`Expense ${selectedExpense.id.substring(0, 8)} rejected.`);
//       setSelectedExpense(null);
//       setRejectionReason("");
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to reject expense");
//       console.error("Error rejecting expense:", error);
//     }
//   };

//   const handleAskInfo = (expense: any) => {
//     toast.info(`Information request sent to ${expense.users?.name || 'user'}`);
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
//       approved: { variant: "default", label: "Approved" },
//       pending: { variant: "secondary", label: "Pending" },
//       rejected: { variant: "destructive", label: "Rejected" },
//       proof_pending: { variant: "outline", label: "Proof Pending" },
//     };
//     const config = variants[status] || variants.pending;
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   const filteredExpenses = expenses.filter(
//     (e) =>
//       (e.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       e.id.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const ExpenseTable = ({ status, source }: { status?: string; source?: string }) => {
//     let expensesToDisplay = filteredExpenses;
    
//     // Filter by status if provided
//     if (status) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.status === status);
//     }
    
//     // Filter by source if provided
//     if (source) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.source === source);
//     }
    
//     // Check if this is the company spent view
//     const isCompanySpentView = source === "company";

//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Expense ID</TableHead>
//             <TableHead>User</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead>Source</TableHead>
//             <TableHead className="text-right">Amount</TableHead>
//             <TableHead>Proof</TableHead>
//             <TableHead>Submitted</TableHead>
//             <TableHead>Status</TableHead>
//             {!isCompanySpentView && <TableHead>Action</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {expensesToDisplay.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={isCompanySpentView ? 8 : 9} className="text-center text-muted-foreground py-8">
//                 No expenses found
//               </TableCell>
//             </TableRow>
//           ) : (
//             expensesToDisplay.map((expense) => (
//               <TableRow key={expense.id}>
//                 <TableCell className="font-mono">{expense.id.substring(0, 8)}</TableCell>
//                 <TableCell className="font-medium">{expense.users?.name || 'Unknown User'}</TableCell>
//                 <TableCell>{expense.category}</TableCell>
//                 <TableCell>
//                   <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                     {expense.source === "company" ? "Company" : "Personal"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
//                 <TableCell>
//                   {expense.proof_url ? (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setSelectedExpense(expense)}
//                       className="gap-1"
//                     >
//                       <FileText className="w-4 h-4" />
//                       View
//                     </Button>
//                   ) : (
//                     <span className="text-muted-foreground text-sm">No proof</span>
//                   )}
//                 </TableCell>
//                 <TableCell>{new Date(expense.submitted_on).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   {isCompanySpentView ? (
//                     <Badge variant="default">Auto-approved</Badge>
//                   ) : (
//                     getStatusBadge(expense.status)
//                   )}
//                 </TableCell>
//                 {!isCompanySpentView && (
//                   <TableCell>
//                     {expense.status === "pending" && (
//                       <div className="flex gap-1">
//                         <Button size="sm" variant="default" onClick={() => handleApprove(expense)}>
//                           <CheckCircle className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => {
//                             setSelectedExpense(expense);
//                             setRejectionReason("");
//                           }}
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => handleAskInfo(expense)}>
//                           <MessageCircle className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
//             <p className="text-muted-foreground">Review and approve expense submissions</p>
//           </div>
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search expenses..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Expense Submissions</CardTitle>
//             <CardDescription>Manage all expense approvals in one place</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="pending" className="space-y-4">
//               <TabsList>
//                 <TabsTrigger value="pending">Pending</TabsTrigger>
//                 <TabsTrigger value="approved">Approved</TabsTrigger>
//                 <TabsTrigger value="rejected">Rejected</TabsTrigger>
//                 <TabsTrigger value="proof_pending">Proof Pending</TabsTrigger>
//                 <TabsTrigger value="company_spent">Company Spent</TabsTrigger>
//               </TabsList>
//               <TabsContent value="pending">
//                 <ExpenseTable status="pending" />
//               </TabsContent>
//               <TabsContent value="approved">
//                 <ExpenseTable status="approved" />
//               </TabsContent>
//               <TabsContent value="rejected">
//                 <ExpenseTable status="rejected" />
//               </TabsContent>
//               <TabsContent value="proof_pending">
//                 <ExpenseTable status="proof_pending" />
//               </TabsContent>
//               <TabsContent value="company_spent">
//                 <ExpenseTable source="company" />
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         {/* Rejection Dialog */}
//         <Dialog open={!!selectedExpense && !selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Reject Expense</DialogTitle>
//               <DialogDescription>Provide a reason for rejection</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <Textarea
//                 placeholder="Enter rejection reason..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 rows={4}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={handleReject}>
//                 Reject Expense
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Proof Preview Dialog */}
//         <Dialog open={!!selectedExpense && !!selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Expense Proof - {selectedExpense?.id.substring(0, 8)}</DialogTitle>
//               <DialogDescription>
//                 {selectedExpense?.users?.name || 'Unknown User'} • {selectedExpense?.category} • ₹
//                 {selectedExpense?.amount?.toLocaleString()}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="bg-muted rounded-lg p-8 text-center">
//                 <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
//                 <p className="text-sm text-muted-foreground">Proof: {selectedExpense?.proof_url}</p>
//                 <p className="text-xs text-muted-foreground mt-2">Mock proof preview</p>
//               </div>
//               {selectedExpense?.notes && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Notes:</p>
//                   <p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
//                 </div>
//               )}
//             </div>
//             {selectedExpense?.status === "pending" && (
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                   Close
//                 </Button>
//                 <Button variant="destructive" onClick={() => setRejectionReason("")}>
//                   Reject
//                 </Button>
//                 <Button onClick={() => selectedExpense && handleApprove(selectedExpense)}>Approve</Button>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// }















// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { supabase } from "@/lib/supabaseClient";
// import { CheckCircle, XCircle, MessageCircle, FileText, Search, ChevronDown } from "lucide-react";
// import { toast } from "sonner";

// export default function Approvals() {
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [cxoUsers, setCxoUsers] = useState<any[]>([]);
//   const [selectedCxo, setSelectedCxo] = useState<string>("all");
//   const [isCxoDropdownOpen, setIsCxoDropdownOpen] = useState(false);

//   // Fetch all expenses for CFO approval dashboard
//   useEffect(() => {
//     fetchAllExpenses();
//     fetchCxoUsers();
//   }, []);

//   const fetchAllExpenses = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('expenses')
//         .select(`
//           *,
//           users (name)
//         `)
//         .order('submitted_on', { ascending: false });

//       if (error) throw error;
      
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCxoUsers = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select('id, name, role')
//         .eq('role', 'cxo');

//       if (error) throw error;
      
//       setCxoUsers(data || []);
//     } catch (err) {
//       console.error('Error fetching CXO users:', err);
//     }
//   };

//   const handleApprove = async (expense: any) => {
//     try {
//       // Update expense status to approved
//       const { error: updateError } = await supabase
//         .from('expenses')
//         .update({ status: 'approved', updated_at: new Date() })
//         .eq('id', expense.id);

//       if (updateError) throw updateError;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', expense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this is a personal expense, process reimbursement
//       if (expense.source === "personal") {
//         try {
//           // Get user's current wallet
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (walletError) {
//             console.error('Error fetching wallet:', walletError);
//             // Try to create a new wallet if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: 0,
//                   reimbursed: isCXO ? -expense.amount : expense.amount,
//                   balance: isCXO ? -expense.amount : 0,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet:', createWalletError);
//               toast.error("Failed to process reimbursement - could not create wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           } else if (walletData) {
//             // Process reimbursement for existing wallet
//             const updatedProofPending = Math.max(0, walletData.proof_pending - expense.amount);
            
//             // For CXO, deduct from reimbursed and balance; for others, add to reimbursed
//             const updatedReimbursed = isCXO 
//               ? walletData.reimbursed - expense.amount 
//               : walletData.reimbursed + expense.amount;
//             const updatedBalance = isCXO 
//               ? walletData.balance - expense.amount 
//               : walletData.balance;
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               reimbursed: updatedReimbursed,
//               updated_at: new Date()
//             };
            
//             // Only update balance for CXO
//             if (isCXO) {
//               updateData.balance = updatedBalance;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet:', walletUpdateError);
//               toast.error("Failed to process reimbursement - could not update wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           }
//         } catch (walletProcessingError) {
//           console.error('Error processing reimbursement:', walletProcessingError);
//           toast.error("Failed to process reimbursement - unexpected error");
//           return;
//         }
//       } else {
//         // For company expenses, update company_spent in wallet
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             // For CXO, also deduct from reimbursed and balance
//             const updateData: any = {
//               company_spent: walletData.company_spent + expense.amount,
//               updated_at: new Date()
//             };
            
//             if (isCXO) {
//               updateData.reimbursed = walletData.reimbursed - expense.amount;
//               updateData.balance = walletData.balance - expense.amount;
//             } else {
//               updateData.balance = walletData.balance - expense.amount;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet for company expense:', walletUpdateError);
//             }
//           } else if (walletError) {
//             // Create new wallet for company expense if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: expense.amount,
//                   reimbursed: isCXO ? -expense.amount : 0,
//                   balance: isCXO ? -expense.amount * 2 : -expense.amount,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet for company expense:', createWalletError);
//             }
//           }
          
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! Wallet updated.`);
//         } catch (walletProcessingError) {
//           console.error('Error processing company expense:', walletProcessingError);
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! (Wallet update had issues)`);
//         }
//       }

//       setSelectedExpense(null);
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to approve expense");
//       console.error("Error approving expense:", error);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a rejection reason");
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('expenses')
//         .update({ 
//           status: 'rejected', 
//           rejection_reason: rejectionReason,
//           updated_at: new Date() 
//         })
//         .eq('id', selectedExpense.id);

//       if (error) throw error;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', selectedExpense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this was a personal expense, we should also reduce the proof_pending amount
//       // For CXO, we might also need to adjust balance and reimbursed amounts
//       if (selectedExpense.source === "personal") {
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updatedProofPending = Math.max(0, walletData.proof_pending - selectedExpense.amount);
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               updated_at: new Date()
//             };
            
//             // For CXO personal expenses, we might need to adjust balance and reimbursed
//             // This would depend on the specific business logic for rejected CXO expenses
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for rejection:', walletError);
//         }
//       } else if (isCXO) {
//         // For rejected company expenses from CXO, we might need to adjust balance and reimbursed
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updateData: any = {
//               updated_at: new Date()
//             };
            
//             // For rejected CXO company expenses, reverse the adjustments
//             // This would depend on the specific business logic
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for CXO company expense rejection:', walletError);
//         }
//       }

//       toast.error(`Expense ${selectedExpense.id.substring(0, 8)} rejected.`);
//       setSelectedExpense(null);
//       setRejectionReason("");
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to reject expense");
//       console.error("Error rejecting expense:", error);
//     }
//   };

//   const handleAskInfo = (expense: any) => {
//     toast.info(`Information request sent to ${expense.users?.name || 'user'}`);
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
//       approved: { variant: "default", label: "Approved" },
//       pending: { variant: "secondary", label: "Pending" },
//       rejected: { variant: "destructive", label: "Rejected" },
//       proof_pending: { variant: "outline", label: "Proof Pending" },
//     };
//     const config = variants[status] || variants.pending;
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   const filteredExpenses = expenses.filter(
//     (e) =>
//       (e.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       e.id.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const ExpenseTable = ({ status, source }: { status?: string; source?: string }) => {
//     let expensesToDisplay = filteredExpenses;
    
//     // Filter by status if provided
//     if (status) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.status === status);
//     }
    
//     // Filter by source if provided
//     if (source) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.source === source);
//     }
    
//     // Filter by selected CXO if not "all"
//     if (selectedCxo !== "all") {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.user_id === selectedCxo);
//     }
    
//     // Check if this is the company spent view
//     const isCompanySpentView = source === "company";

//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Expense ID</TableHead>
//             <TableHead>User</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead>Source</TableHead>
//             <TableHead className="text-right">Amount</TableHead>
//             <TableHead>Proof</TableHead>
//             <TableHead>Submitted</TableHead>
//             <TableHead>Status</TableHead>
//             {!isCompanySpentView && <TableHead>Action</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {expensesToDisplay.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={isCompanySpentView ? 8 : 9} className="text-center text-muted-foreground py-8">
//                 No expenses found
//               </TableCell>
//             </TableRow>
//           ) : (
//             expensesToDisplay.map((expense) => (
//               <TableRow key={expense.id}>
//                 <TableCell className="font-mono">{expense.id.substring(0, 8)}</TableCell>
//                 <TableCell className="font-medium">{expense.users?.name || 'Unknown User'}</TableCell>
//                 <TableCell>{expense.category}</TableCell>
//                 <TableCell>
//                   <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                     {expense.source === "company" ? "Company" : "Personal"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
//                 <TableCell>
//                   {expense.proof_url ? (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setSelectedExpense(expense)}
//                       className="gap-1"
//                     >
//                       <FileText className="w-4 h-4" />
//                       View
//                     </Button>
//                   ) : (
//                     <span className="text-muted-foreground text-sm">No proof</span>
//                   )}
//                 </TableCell>
//                 <TableCell>{new Date(expense.submitted_on).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   {isCompanySpentView ? (
//                     <Badge variant="default">Auto-approved</Badge>
//                   ) : (
//                     getStatusBadge(expense.status)
//                   )}
//                 </TableCell>
//                 {!isCompanySpentView && (
//                   <TableCell>
//                     {expense.status === "pending" && (
//                       <div className="flex gap-1">
//                         <Button size="sm" variant="default" onClick={() => handleApprove(expense)}>
//                           <CheckCircle className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => {
//                             setSelectedExpense(expense);
//                             setRejectionReason("");
//                           }}
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => handleAskInfo(expense)}>
//                           <MessageCircle className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
//             <p className="text-muted-foreground">Review and approve expense submissions</p>
//           </div>
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search expenses..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle>Expense Submissions</CardTitle>
//               <CardDescription>Manage all expense approvals in one place</CardDescription>
//             </div>
//             <div className="relative">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsCxoDropdownOpen(!isCxoDropdownOpen)}
//                 className="flex items-center gap-2"
//               >
//                 {selectedCxo === "all" 
//                   ? "All CXOs" 
//                   : cxoUsers.find(cxo => cxo.id === selectedCxo)?.name || "Select CXO"}
//                 <ChevronDown className="h-4 w-4" />
//               </Button>
//               {isCxoDropdownOpen && (
//                 <div className="absolute right-0 top-12 z-10 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
//                   <div className="p-2">
//                     <Input
//                       placeholder="Search CXO..."
//                       className="mb-2"
//                       onClick={(e) => e.stopPropagation()}
//                     />
//                   </div>
//                   <div 
//                     className="flex flex-col max-h-60 overflow-y-auto"
//                     onClick={() => setIsCxoDropdownOpen(false)}
//                   >
//                     <button
//                       className={`flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${
//                         selectedCxo === "all" ? "bg-accent" : ""
//                       }`}
//                       onClick={() => setSelectedCxo("all")}
//                     >
//                       All CXOs
//                     </button>
//                     {cxoUsers.map((cxo) => (
//                       <button
//                         key={cxo.id}
//                         className={`flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${
//                           selectedCxo === cxo.id ? "bg-accent" : ""
//                         }`}
//                         onClick={() => setSelectedCxo(cxo.id)}
//                       >
//                         {cxo.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="pending" className="space-y-4">
//               <TabsList>
//                 <TabsTrigger value="pending">Pending</TabsTrigger>
//                 <TabsTrigger value="approved">Approved</TabsTrigger>
//                 <TabsTrigger value="rejected">Rejected</TabsTrigger>
//                 <TabsTrigger value="proof_pending">Proof Pending</TabsTrigger>
//                 <TabsTrigger value="company_spent">Company Spent</TabsTrigger>
//               </TabsList>
//               <TabsContent value="pending">
//                 <ExpenseTable status="pending" />
//               </TabsContent>
//               <TabsContent value="approved">
//                 <ExpenseTable status="approved" />
//               </TabsContent>
//               <TabsContent value="rejected">
//                 <ExpenseTable status="rejected" />
//               </TabsContent>
//               <TabsContent value="proof_pending">
//                 <ExpenseTable status="proof_pending" />
//               </TabsContent>
//               <TabsContent value="company_spent">
//                 <ExpenseTable source="company" />
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         {/* Rejection Dialog */}
//         <Dialog open={!!selectedExpense && !selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Reject Expense</DialogTitle>
//               <DialogDescription>Provide a reason for rejection</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <Textarea
//                 placeholder="Enter rejection reason..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 rows={4}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={handleReject}>
//                 Reject Expense
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Proof Preview Dialog */}
//         <Dialog open={!!selectedExpense && !!selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Expense Proof - {selectedExpense?.id.substring(0, 8)}</DialogTitle>
//               <DialogDescription>
//                 {selectedExpense?.users?.name || 'Unknown User'} • {selectedExpense?.category} • ₹
//                 {selectedExpense?.amount?.toLocaleString()}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="bg-muted rounded-lg p-8 text-center">
//                 <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
//                 <p className="text-sm text-muted-foreground">Proof: {selectedExpense?.proof_url}</p>
//                 <p className="text-xs text-muted-foreground mt-2">Mock proof preview</p>
//               </div>
//               {selectedExpense?.notes && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Notes:</p>
//                   <p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
//                 </div>
//               )}
//             </div>
//             {selectedExpense?.status === "pending" && (
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                   Close
//                 </Button>
//                 <Button variant="destructive" onClick={() => setRejectionReason("")}>
//                   Reject
//                 </Button>
//                 <Button onClick={() => selectedExpense && handleApprove(selectedExpense)}>Approve</Button>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// }



























// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { supabase } from "@/lib/supabaseClient";
// import { CheckCircle, XCircle, MessageCircle, FileText, Search, ChevronDown } from "lucide-react";
// import { toast } from "sonner";

// export default function Approvals() {
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [cxoUsers, setCxoUsers] = useState<any[]>([]);
//   const [selectedCxo, setSelectedCxo] = useState<string>("all");
//   const [isCxoDropdownOpen, setIsCxoDropdownOpen] = useState(false);
//   const [cxoSearchQuery, setCxoSearchQuery] = useState("");

//   // Fetch all expenses for CFO approval dashboard
//   useEffect(() => {
//     fetchAllExpenses();
//     fetchCxoUsers();
//   }, []);

//   const fetchAllExpenses = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('expenses')
//         .select(`
//           *,
//           users (name, role)
//         `)
//         .order('submitted_on', { ascending: false });

//       if (error) throw error;
      
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCxoUsers = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select('id, name, role')
//         .eq('role', 'cxo')
//         .order('name', { ascending: true });

//       if (error) throw error;
      
//       setCxoUsers(data || []);
//     } catch (err) {
//       console.error('Error fetching CXO users:', err);
//     }
//   };

//   const handleApprove = async (expense: any) => {
//     try {
//       // Update expense status to approved
//       const { error: updateError } = await supabase
//         .from('expenses')
//         .update({ status: 'approved', updated_at: new Date() })
//         .eq('id', expense.id);

//       if (updateError) throw updateError;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', expense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this is a personal expense, process reimbursement
//       if (expense.source === "personal") {
//         try {
//           // Get user's current wallet
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (walletError) {
//             console.error('Error fetching wallet:', walletError);
//             // Try to create a new wallet if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: 0,
//                   reimbursed: isCXO ? -expense.amount : expense.amount,
//                   balance: isCXO ? -expense.amount : 0,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet:', createWalletError);
//               toast.error("Failed to process reimbursement - could not create wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           } else if (walletData) {
//             // Process reimbursement for existing wallet
//             const updatedProofPending = Math.max(0, walletData.proof_pending - expense.amount);
            
//             // For CXO, deduct from reimbursed and balance; for others, add to reimbursed
//             const updatedReimbursed = isCXO 
//               ? walletData.reimbursed - expense.amount 
//               : walletData.reimbursed + expense.amount;
//             const updatedBalance = isCXO 
//               ? walletData.balance - expense.amount 
//               : walletData.balance;
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               reimbursed: updatedReimbursed,
//               updated_at: new Date()
//             };
            
//             // Only update balance for CXO
//             if (isCXO) {
//               updateData.balance = updatedBalance;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet:', walletUpdateError);
//               toast.error("Failed to process reimbursement - could not update wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           }
//         } catch (walletProcessingError) {
//           console.error('Error processing reimbursement:', walletProcessingError);
//           toast.error("Failed to process reimbursement - unexpected error");
//           return;
//         }
//       } else {
//         // For company expenses, update company_spent in wallet
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             // For CXO, also deduct from reimbursed and balance
//             const updateData: any = {
//               company_spent: walletData.company_spent + expense.amount,
//               updated_at: new Date()
//             };
            
//             if (isCXO) {
//               updateData.reimbursed = walletData.reimbursed - expense.amount;
//               updateData.balance = walletData.balance - expense.amount;
//             } else {
//               updateData.balance = walletData.balance - expense.amount;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet for company expense:', walletUpdateError);
//             }
//           } else if (walletError) {
//             // Create new wallet for company expense if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: expense.amount,
//                   reimbursed: isCXO ? -expense.amount : 0,
//                   balance: isCXO ? -expense.amount * 2 : -expense.amount,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet for company expense:', createWalletError);
//             }
//           }
          
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! Wallet updated.`);
//         } catch (walletProcessingError) {
//           console.error('Error processing company expense:', walletProcessingError);
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! (Wallet update had issues)`);
//         }
//       }

//       setSelectedExpense(null);
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to approve expense");
//       console.error("Error approving expense:", error);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a rejection reason");
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('expenses')
//         .update({ 
//           status: 'rejected', 
//           rejection_reason: rejectionReason,
//           updated_at: new Date() 
//         })
//         .eq('id', selectedExpense.id);

//       if (error) throw error;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', selectedExpense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this was a personal expense, we should also reduce the proof_pending amount
//       // For CXO, we might also need to adjust balance and reimbursed amounts
//       if (selectedExpense.source === "personal") {
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updatedProofPending = Math.max(0, walletData.proof_pending - selectedExpense.amount);
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               updated_at: new Date()
//             };
            
//             // For CXO personal expenses, we might need to adjust balance and reimbursed
//             // This would depend on the specific business logic for rejected CXO expenses
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for rejection:', walletError);
//         }
//       } else if (isCXO) {
//         // For rejected company expenses from CXO, we might need to adjust balance and reimbursed
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updateData: any = {
//               updated_at: new Date()
//             };
            
//             // For rejected CXO company expenses, reverse the adjustments
//             // This would depend on the specific business logic
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for CXO company expense rejection:', walletError);
//         }
//       }

//       toast.error(`Expense ${selectedExpense.id.substring(0, 8)} rejected.`);
//       setSelectedExpense(null);
//       setRejectionReason("");
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to reject expense");
//       console.error("Error rejecting expense:", error);
//     }
//   };

//   const handleAskInfo = (expense: any) => {
//     toast.info(`Information request sent to ${expense.users?.name || 'user'}`);
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
//       approved: { variant: "default", label: "Approved" },
//       pending: { variant: "secondary", label: "Pending" },
//       rejected: { variant: "destructive", label: "Rejected" },
//       proof_pending: { variant: "outline", label: "Proof Pending" },
//     };
//     const config = variants[status] || variants.pending;
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   // Filter expenses based on search query and selected CXO
//   const getFilteredExpenses = () => {
//     let filtered = expenses;

//     // Apply CXO filter
//     if (selectedCxo !== "all") {
//       filtered = filtered.filter(expense => expense.user_id === selectedCxo);
//     }

//     // Apply search query filter
//     if (searchQuery) {
//       filtered = filtered.filter(expense =>
//         expense.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         expense.id.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return filtered;
//   };

//   const filteredExpenses = getFilteredExpenses();

//   // Filter CXO users for dropdown search
//   const filteredCxoUsers = cxoUsers.filter(cxo =>
//     cxo.name.toLowerCase().includes(cxoSearchQuery.toLowerCase())
//   );

//   const ExpenseTable = ({ status, source }: { status?: string; source?: string }) => {
//     let expensesToDisplay = filteredExpenses;
    
//     // Filter by status if provided
//     if (status) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.status === status);
//     }
    
//     // Filter by source if provided
//     if (source) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.source === source);
//     }
    
//     // Check if this is the company spent view
//     const isCompanySpentView = source === "company";

//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Expense ID</TableHead>
//             <TableHead>User</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead>Source</TableHead>
//             <TableHead className="text-right">Amount</TableHead>
//             <TableHead>Proof</TableHead>
//             <TableHead>Submitted</TableHead>
//             <TableHead>Status</TableHead>
//             {!isCompanySpentView && <TableHead>Action</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {expensesToDisplay.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={isCompanySpentView ? 8 : 9} className="text-center text-muted-foreground py-8">
//                 No expenses found
//               </TableCell>
//             </TableRow>
//           ) : (
//             expensesToDisplay.map((expense) => (
//               <TableRow key={expense.id}>
//                 <TableCell className="font-mono">{expense.id.substring(0, 8)}</TableCell>
//                 <TableCell className="font-medium">{expense.users?.name || 'Unknown User'}</TableCell>
//                 <TableCell>{expense.category}</TableCell>
//                 <TableCell>
//                   <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                     {expense.source === "company" ? "Company" : "Personal"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
//                 <TableCell>
//                   {expense.proof_url ? (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setSelectedExpense(expense)}
//                       className="gap-1"
//                     >
//                       <FileText className="w-4 h-4" />
//                       View
//                     </Button>
//                   ) : (
//                     <span className="text-muted-foreground text-sm">No proof</span>
//                   )}
//                 </TableCell>
//                 <TableCell>{new Date(expense.submitted_on).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   {isCompanySpentView ? (
//                     <Badge variant="default">Auto-approved</Badge>
//                   ) : (
//                     getStatusBadge(expense.status)
//                   )}
//                 </TableCell>
//                 {!isCompanySpentView && (
//                   <TableCell>
//                     {expense.status === "pending" && (
//                       <div className="flex gap-1">
//                         <Button size="sm" variant="default" onClick={() => handleApprove(expense)}>
//                           <CheckCircle className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => {
//                             setSelectedExpense(expense);
//                             setRejectionReason("");
//                           }}
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => handleAskInfo(expense)}>
//                           <MessageCircle className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     );
//   };

//   const getSelectedCxoName = () => {
//     if (selectedCxo === "all") return "All CXOs";
//     const cxo = cxoUsers.find(c => c.id === selectedCxo);
//     return cxo ? cxo.name : "Select CXO";
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
//             <p className="text-muted-foreground">Review and approve expense submissions</p>
//           </div>
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search expenses..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-4">
//             <div>
//               <CardTitle>Expense Submissions</CardTitle>
//               <CardDescription>
//                 {selectedCxo === "all" 
//                   ? "Managing all expense approvals" 
//                   : `Viewing expenses for ${getSelectedCxoName()}`}
//               </CardDescription>
//             </div>
//             <div className="relative">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsCxoDropdownOpen(!isCxoDropdownOpen)}
//                 className="flex items-center gap-2 w-48 justify-between"
//               >
//                 <span className="truncate">{getSelectedCxoName()}</span>
//                 <ChevronDown className="h-4 w-4 flex-shrink-0" />
//               </Button>
              
//               {isCxoDropdownOpen && (
//                 <div className="absolute right-0 top-12 z-50 w-64 rounded-md border bg-popover shadow-md">
//                   <div className="p-2 border-b">
//                     <div className="relative">
//                       <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         placeholder="Search CXO..."
//                         value={cxoSearchQuery}
//                         onChange={(e) => setCxoSearchQuery(e.target.value)}
//                         className="pl-8 h-9"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto py-1">
//                     <div
//                       className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
//                         selectedCxo === "all" ? "bg-accent font-medium" : ""
//                       }`}
//                       onClick={() => {
//                         setSelectedCxo("all");
//                         setIsCxoDropdownOpen(false);
//                         setCxoSearchQuery("");
//                       }}
//                     >
//                       All CXOs
//                     </div>
//                     {filteredCxoUsers.map((cxo) => (
//                       <div
//                         key={cxo.id}
//                         className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
//                           selectedCxo === cxo.id ? "bg-accent font-medium" : ""
//                         }`}
//                         onClick={() => {
//                           setSelectedCxo(cxo.id);
//                           setIsCxoDropdownOpen(false);
//                           setCxoSearchQuery("");
//                         }}
//                       >
//                         {cxo.name}
//                       </div>
//                     ))}
//                     {filteredCxoUsers.length === 0 && (
//                       <div className="px-3 py-2 text-sm text-muted-foreground text-center">
//                         No CXOs found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="pending" className="space-y-4">
//               <TabsList>
//                 <TabsTrigger value="pending">Pending</TabsTrigger>
//                 <TabsTrigger value="approved">Approved</TabsTrigger>
//                 <TabsTrigger value="rejected">Rejected</TabsTrigger>
//                 <TabsTrigger value="proof_pending">Proof Pending</TabsTrigger>
//                 <TabsTrigger value="company_spent">Company Spent</TabsTrigger>
//               </TabsList>
//               <TabsContent value="pending">
//                 <ExpenseTable status="pending" />
//               </TabsContent>
//               <TabsContent value="approved">
//                 <ExpenseTable status="approved" />
//               </TabsContent>
//               <TabsContent value="rejected">
//                 <ExpenseTable status="rejected" />
//               </TabsContent>
//               <TabsContent value="proof_pending">
//                 <ExpenseTable status="proof_pending" />
//               </TabsContent>
//               <TabsContent value="company_spent">
//                 <ExpenseTable source="company" />
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         {/* Rejection Dialog */}
//         <Dialog open={!!selectedExpense && !selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Reject Expense</DialogTitle>
//               <DialogDescription>Provide a reason for rejection</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <Textarea
//                 placeholder="Enter rejection reason..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 rows={4}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={handleReject}>
//                 Reject Expense
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Proof Preview Dialog */}
//         <Dialog open={!!selectedExpense && !!selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Expense Proof - {selectedExpense?.id.substring(0, 8)}</DialogTitle>
//               <DialogDescription>
//                 {selectedExpense?.users?.name || 'Unknown User'} • {selectedExpense?.category} • ₹
//                 {selectedExpense?.amount?.toLocaleString()}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="bg-muted rounded-lg p-8 text-center">
//                 <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
//                 <p className="text-sm text-muted-foreground">Proof: {selectedExpense?.proof_url}</p>
//                 <p className="text-xs text-muted-foreground mt-2">Mock proof preview</p>
//               </div>
//               {selectedExpense?.notes && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Notes:</p>
//                   <p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
//                 </div>
//               )}
//             </div>
//             {selectedExpense?.status === "pending" && (
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                   Close
//                 </Button>
//                 <Button variant="destructive" onClick={() => setRejectionReason("")}>
//                   Reject
//                 </Button>
//                 <Button onClick={() => selectedExpense && handleApprove(selectedExpense)}>Approve</Button>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// }





















// import { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { supabase } from "@/lib/supabaseClient";
// import { CheckCircle, XCircle, MessageCircle, FileText, Search, ChevronDown, CalendarIcon } from "lucide-react";
// import { toast } from "sonner";
// import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

// export default function Approvals() {
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [cxoUsers, setCxoUsers] = useState<any[]>([]);
//   const [selectedCxo, setSelectedCxo] = useState<string>("all");
//   const [isCxoDropdownOpen, setIsCxoDropdownOpen] = useState(false);
//   const [cxoSearchQuery, setCxoSearchQuery] = useState("");
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
//   const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

//   // Fetch all expenses for CFO approval dashboard
//   useEffect(() => {
//     fetchAllExpenses();
//     fetchCxoUsers();
//   }, []);

//   const fetchAllExpenses = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('expenses')
//         .select(`
//           *,
//           users (name, role)
//         `)
//         .order('submitted_on', { ascending: false });

//       if (error) throw error;
      
//       setExpenses(data || []);
//     } catch (err) {
//       console.error('Error fetching expenses:', err);
//       toast.error("Failed to fetch expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter expenses based on date range
//   const filteredExpensesByDate = (expensesToFilter: any[]) => {
//     // If no date range is selected, return all expenses
//     if (!dateRange.from || !dateRange.to) return expensesToFilter;
    
//     return expensesToFilter.filter(expense => {
//       const expenseDateField = expense.submitted_on;
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

//   const fetchCxoUsers = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select('id, name, role')
//         .eq('role', 'cxo')
//         .order('name', { ascending: true });

//       if (error) throw error;
      
//       setCxoUsers(data || []);
//     } catch (err) {
//       console.error('Error fetching CXO users:', err);
//     }
//   };

//   const handleApprove = async (expense: any) => {
//     try {
//       // Update expense status to approved
//       const { error: updateError } = await supabase
//         .from('expenses')
//         .update({ status: 'approved', updated_at: new Date() })
//         .eq('id', expense.id);

//       if (updateError) throw updateError;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', expense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this is a personal expense, process reimbursement
//       if (expense.source === "personal") {
//         try {
//           // Get user's current wallet
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (walletError) {
//             console.error('Error fetching wallet:', walletError);
//             // Try to create a new wallet if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: 0,
//                   reimbursed: isCXO ? -expense.amount : expense.amount,
//                   balance: isCXO ? -expense.amount : 0,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet:', createWalletError);
//               toast.error("Failed to process reimbursement - could not create wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           } else if (walletData) {
//             // Process reimbursement for existing wallet
//             const updatedProofPending = Math.max(0, walletData.proof_pending - expense.amount);
            
//             // For CXO, deduct from reimbursed and balance; for others, add to reimbursed
//             const updatedReimbursed = isCXO 
//               ? walletData.reimbursed - expense.amount 
//               : walletData.reimbursed + expense.amount;
//             const updatedBalance = isCXO 
//               ? walletData.balance - expense.amount 
//               : walletData.balance;
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               reimbursed: updatedReimbursed,
//               updated_at: new Date()
//             };
            
//             // Only update balance for CXO
//             if (isCXO) {
//               updateData.balance = updatedBalance;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet:', walletUpdateError);
//               toast.error("Failed to process reimbursement - could not update wallet");
//               return;
//             }
            
//             toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
//           }
//         } catch (walletProcessingError) {
//           console.error('Error processing reimbursement:', walletProcessingError);
//           toast.error("Failed to process reimbursement - unexpected error");
//           return;
//         }
//       } else {
//         // For company expenses, update company_spent in wallet
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', expense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             // For CXO, also deduct from reimbursed and balance
//             const updateData: any = {
//               company_spent: walletData.company_spent + expense.amount,
//               updated_at: new Date()
//             };
            
//             if (isCXO) {
//               updateData.reimbursed = walletData.reimbursed - expense.amount;
//               updateData.balance = walletData.balance - expense.amount;
//             } else {
//               updateData.balance = walletData.balance - expense.amount;
//             }
            
//             const { error: walletUpdateError } = await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', expense.user_id);

//             if (walletUpdateError) {
//               console.error('Error updating wallet for company expense:', walletUpdateError);
//             }
//           } else if (walletError) {
//             // Create new wallet for company expense if it doesn't exist
//             const { error: createWalletError } = await supabase
//               .from('wallets')
//               .insert([
//                 {
//                   user_id: expense.user_id,
//                   allocated: 0,
//                   company_spent: expense.amount,
//                   reimbursed: isCXO ? -expense.amount : 0,
//                   balance: isCXO ? -expense.amount * 2 : -expense.amount,
//                   proof_pending: 0,
//                 }
//               ]);

//             if (createWalletError) {
//               console.error('Error creating wallet for company expense:', createWalletError);
//             }
//           }
          
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! Wallet updated.`);
//         } catch (walletProcessingError) {
//           console.error('Error processing company expense:', walletProcessingError);
//           toast.success(`Expense ${expense.id.substring(0, 8)} approved! (Wallet update had issues)`);
//         }
//       }

//       setSelectedExpense(null);
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to approve expense");
//       console.error("Error approving expense:", error);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a rejection reason");
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('expenses')
//         .update({ 
//           status: 'rejected', 
//           rejection_reason: rejectionReason,
//           updated_at: new Date() 
//         })
//         .eq('id', selectedExpense.id);

//       if (error) throw error;

//       // Check if the user is a CXO
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('role')
//         .eq('id', selectedExpense.user_id)
//         .single();

//       const isCXO = !userError && userData?.role === 'cxo';

//       // If this was a personal expense, we should also reduce the proof_pending amount
//       // For CXO, we might also need to adjust balance and reimbursed amounts
//       if (selectedExpense.source === "personal") {
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updatedProofPending = Math.max(0, walletData.proof_pending - selectedExpense.amount);
            
//             const updateData: any = {
//               proof_pending: updatedProofPending,
//               updated_at: new Date()
//             };
            
//             // For CXO personal expenses, we might need to adjust balance and reimbursed
//             // This would depend on the specific business logic for rejected CXO expenses
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for rejection:', walletError);
//         }
//       } else if (isCXO) {
//         // For rejected company expenses from CXO, we might need to adjust balance and reimbursed
//         try {
//           const { data: walletData, error: walletError } = await supabase
//             .from('wallets')
//             .select('*')
//             .eq('user_id', selectedExpense.user_id)
//             .single();

//           if (!walletError && walletData) {
//             const updateData: any = {
//               updated_at: new Date()
//             };
            
//             // For rejected CXO company expenses, reverse the adjustments
//             // This would depend on the specific business logic
            
//             await supabase
//               .from('wallets')
//               .update(updateData)
//               .eq('user_id', selectedExpense.user_id);
//           }
//         } catch (walletError) {
//           console.error('Error updating wallet for CXO company expense rejection:', walletError);
//         }
//       }

//       toast.error(`Expense ${selectedExpense.id.substring(0, 8)} rejected.`);
//       setSelectedExpense(null);
//       setRejectionReason("");
//       fetchAllExpenses(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to reject expense");
//       console.error("Error rejecting expense:", error);
//     }
//   };

//   const handleAskInfo = (expense: any) => {
//     toast.info(`Information request sent to ${expense.users?.name || 'user'}`);
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
//       approved: { variant: "default", label: "Approved" },
//       pending: { variant: "secondary", label: "Pending" },
//       rejected: { variant: "destructive", label: "Rejected" },
//       proof_pending: { variant: "outline", label: "Proof Pending" },
//     };
//     const config = variants[status] || variants.pending;
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   // Filter expenses based on search query, selected CXO, and date range
//   const getFilteredExpenses = () => {
//     let filtered = expenses;

//     // Apply CXO filter
//     if (selectedCxo !== "all") {
//       filtered = filtered.filter(expense => expense.user_id === selectedCxo);
//     }

//     // Apply search query filter
//     if (searchQuery) {
//       filtered = filtered.filter(expense =>
//         expense.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         expense.id.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Apply date range filter
//     filtered = filteredExpensesByDate(filtered);

//     return filtered;
//   };

//   const filteredExpenses = getFilteredExpenses();

//   // Filter CXO users for dropdown search
//   const filteredCxoUsers = cxoUsers.filter(cxo =>
//     cxo.name.toLowerCase().includes(cxoSearchQuery.toLowerCase())
//   );

//   const ExpenseTable = ({ status, source }: { status?: string; source?: string }) => {
//     let expensesToDisplay = filteredExpenses;
    
//     // Filter by status if provided
//     if (status) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.status === status);
//     }
    
//     // Filter by source if provided
//     if (source) {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.source === source);
//     }
    
//     // Special filter for approved tab - only show personal expenses
//     if (status === "approved") {
//       expensesToDisplay = expensesToDisplay.filter((e) => e.source === "personal");
//     }
    
//     // Check if this is the company spent view
//     const isCompanySpentView = source === "company";

//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Expense ID</TableHead>
//             <TableHead>User</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead>Source</TableHead>
//             <TableHead className="text-right">Amount</TableHead>
//             <TableHead>Proof</TableHead>
//             <TableHead>Submitted</TableHead>
//             <TableHead>Status</TableHead>
//             {!isCompanySpentView && <TableHead>Action</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {expensesToDisplay.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={isCompanySpentView ? 8 : 9} className="text-center text-muted-foreground py-8">
//                 {dateRange.from && dateRange.to ? 'No expenses found for selected date range' : 'No expenses found'}
//               </TableCell>
//             </TableRow>
//           ) : (
//             expensesToDisplay.map((expense) => (
//               <TableRow key={expense.id}>
//                 <TableCell className="font-mono">{expense.id.substring(0, 8)}</TableCell>
//                 <TableCell className="font-medium">{expense.users?.name || 'Unknown User'}</TableCell>
//                 <TableCell>{expense.category}</TableCell>
//                 <TableCell>
//                   <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                     {expense.source === "company" ? "Company" : "Personal"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
//                 <TableCell>
//                   {expense.proof_url ? (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setSelectedExpense(expense)}
//                       className="gap-1"
//                     >
//                       <FileText className="w-4 h-4" />
//                       View
//                     </Button>
//                   ) : (
//                     <span className="text-muted-foreground text-sm">No proof</span>
//                   )}
//                 </TableCell>
//                 <TableCell>{new Date(expense.submitted_on).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   {isCompanySpentView ? (
//                     <Badge variant="default">Auto-approved</Badge>
//                   ) : (
//                     getStatusBadge(expense.status)
//                   )}
//                 </TableCell>
//                 {!isCompanySpentView && (
//                   <TableCell>
//                     {expense.status === "pending" && (
//                       <div className="flex gap-1">
//                         <Button size="sm" variant="default" onClick={() => handleApprove(expense)}>
//                           <CheckCircle className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => {
//                             setSelectedExpense(expense);
//                             setRejectionReason("");
//                           }}
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => handleAskInfo(expense)}>
//                           <MessageCircle className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     );
//   };

//   const getSelectedCxoName = () => {
//     if (selectedCxo === "all") return "All CXOs";
//     const cxo = cxoUsers.find(c => c.id === selectedCxo);
//     return cxo ? cxo.name : "Select CXO";
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
//             <p className="text-muted-foreground">Review and approve expense submissions</p>
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
//             <div className="relative w-64">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search expenses..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//           </div>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-4">
//             <div>
//               <CardTitle>
//                 Expense Submissions {dateRange.from && dateRange.to 
//                   ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
//                   : ''}
//               </CardTitle>
//               <CardDescription>
//                 {dateRange.from && dateRange.to 
//                   ? `Expense approvals for selected date range` 
//                   : selectedCxo === "all" 
//                     ? "Managing all expense approvals" 
//                     : `Viewing expenses for ${getSelectedCxoName()}`}
//               </CardDescription>
//             </div>
//             <div className="relative">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsCxoDropdownOpen(!isCxoDropdownOpen)}
//                 className="flex items-center gap-2 w-48 justify-between"
//               >
//                 <span className="truncate">{getSelectedCxoName()}</span>
//                 <ChevronDown className="h-4 w-4 flex-shrink-0" />
//               </Button>
              
//               {isCxoDropdownOpen && (
//                 <div className="absolute right-0 top-12 z-50 w-64 rounded-md border bg-popover shadow-md">
//                   <div className="p-2 border-b">
//                     <div className="relative">
//                       <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         placeholder="Search CXO..."
//                         value={cxoSearchQuery}
//                         onChange={(e) => setCxoSearchQuery(e.target.value)}
//                         className="pl-8 h-9"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto py-1">
//                     <div
//                       className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
//                         selectedCxo === "all" ? "bg-accent font-medium" : ""
//                       }`}
//                       onClick={() => {
//                         setSelectedCxo("all");
//                         setIsCxoDropdownOpen(false);
//                         setCxoSearchQuery("");
//                       }}
//                     >
//                       All CXOs
//                     </div>
//                     {filteredCxoUsers.map((cxo) => (
//                       <div
//                         key={cxo.id}
//                         className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
//                           selectedCxo === cxo.id ? "bg-accent font-medium" : ""
//                         }`}
//                         onClick={() => {
//                           setSelectedCxo(cxo.id);
//                           setIsCxoDropdownOpen(false);
//                           setCxoSearchQuery("");
//                         }}
//                       >
//                         {cxo.name}
//                       </div>
//                     ))}
//                     {filteredCxoUsers.length === 0 && (
//                       <div className="px-3 py-2 text-sm text-muted-foreground text-center">
//                         No CXOs found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="pending" className="space-y-4">
//               <TabsList>
//                 <TabsTrigger value="pending">Pending</TabsTrigger>
//                 <TabsTrigger value="approved">Approved</TabsTrigger>
//                 <TabsTrigger value="rejected">Rejected</TabsTrigger>
//                 <TabsTrigger value="proof_pending">Proof Pending</TabsTrigger>
//                 <TabsTrigger value="company_spent">Company Spent</TabsTrigger>
//               </TabsList>
//               <TabsContent value="pending">
//                 <ExpenseTable status="pending" />
//               </TabsContent>
//               <TabsContent value="approved">
//                 <ExpenseTable status="approved" />
//               </TabsContent>
//               <TabsContent value="rejected">
//                 <ExpenseTable status="rejected" />
//               </TabsContent>
//               <TabsContent value="proof_pending">
//                 <ExpenseTable status="proof_pending" />
//               </TabsContent>
//               <TabsContent value="company_spent">
//                 <ExpenseTable source="company" />
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         {/* Rejection Dialog */}
//         <Dialog open={!!selectedExpense && !selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Reject Expense</DialogTitle>
//               <DialogDescription>Provide a reason for rejection</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <Textarea
//                 placeholder="Enter rejection reason..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 rows={4}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={handleReject}>
//                 Reject Expense
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Proof Preview Dialog */}
//         <Dialog open={!!selectedExpense && !!selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Expense Proof - {selectedExpense?.id.substring(0, 8)}</DialogTitle>
//               <DialogDescription>
//                 {selectedExpense?.users?.name || 'Unknown User'} • {selectedExpense?.category} • ₹
//                 {selectedExpense?.amount?.toLocaleString()}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="bg-muted rounded-lg p-8 text-center">
//                 <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
//                 <p className="text-sm text-muted-foreground">Proof: {selectedExpense?.proof_url}</p>
//                 <p className="text-xs text-muted-foreground mt-2">Mock proof preview</p>
//               </div>
//               {selectedExpense?.notes && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Notes:</p>
//                   <p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
//                 </div>
//               )}
//             </div>
//             {selectedExpense?.status === "pending" && (
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setSelectedExpense(null)}>
//                   Close
//                 </Button>
//                 <Button variant="destructive" onClick={() => setRejectionReason("")}>
//                   Reject
//                 </Button>
//                 <Button onClick={() => selectedExpense && handleApprove(selectedExpense)}>Approve</Button>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// }


















































import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle, XCircle, MessageCircle, FileText, Search, ChevronDown, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function Approvals() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cxoUsers, setCxoUsers] = useState<any[]>([]);
  const [selectedCxo, setSelectedCxo] = useState<string>("all");
  const [isCxoDropdownOpen, setIsCxoDropdownOpen] = useState(false);
  const [cxoSearchQuery, setCxoSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  // Fetch all expenses for CFO approval dashboard
  useEffect(() => {
    fetchAllExpenses();
    fetchCxoUsers();
  }, []);

  const fetchAllExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          users (name, role)
        `)
        .order('submitted_on', { ascending: false });

      if (error) throw error;
      
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on date range
  const filteredExpensesByDate = (expensesToFilter: any[]) => {
    // If no date range is selected, return all expenses
    if (!dateRange.from || !dateRange.to) return expensesToFilter;
    
    return expensesToFilter.filter(expense => {
      const expenseDateField = expense.submitted_on;
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

  const fetchCxoUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'cxo')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setCxoUsers(data || []);
    } catch (err) {
      console.error('Error fetching CXO users:', err);
    }
  };

  const handleApprove = async (expense: any) => {
    try {
      // Update expense status to approved
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ status: 'approved', updated_at: new Date() })
        .eq('id', expense.id);

      if (updateError) throw updateError;

      // Check if the user is a CXO
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', expense.user_id)
        .single();

      const isCXO = !userError && userData?.role === 'cxo';

      // If this is a personal expense, process reimbursement
      if (expense.source === "personal") {
        try {
          // Get user's current wallet
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', expense.user_id)
            .single();

          if (walletError) {
            console.error('Error fetching wallet:', walletError);
            // Try to create a new wallet if it doesn't exist
            const { error: createWalletError } = await supabase
              .from('wallets')
              .insert([
                {
                  user_id: expense.user_id,
                  allocated: 0,
                  company_spent: 0,
                  reimbursed: isCXO ? -expense.amount : expense.amount,
                  balance: isCXO ? -expense.amount : 0,
                  proof_pending: 0,
                }
              ]);

            if (createWalletError) {
              console.error('Error creating wallet:', createWalletError);
              toast.error("Failed to process reimbursement - could not create wallet");
              return;
            }
            
            toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
          } else if (walletData) {
            // Process reimbursement for existing wallet
            const updatedProofPending = Math.max(0, walletData.proof_pending - expense.amount);
            
            // For CXO, deduct from reimbursed and balance; for others, add to reimbursed
            const updatedReimbursed = isCXO 
              ? walletData.reimbursed - expense.amount 
              : walletData.reimbursed + expense.amount;
            const updatedBalance = isCXO 
              ? walletData.balance - expense.amount 
              : walletData.balance;
            
            const updateData: any = {
              proof_pending: updatedProofPending,
              reimbursed: updatedReimbursed,
              updated_at: new Date()
            };
            
            // Only update balance for CXO
            if (isCXO) {
              updateData.balance = updatedBalance;
            }
            
            const { error: walletUpdateError } = await supabase
              .from('wallets')
              .update(updateData)
              .eq('user_id', expense.user_id);

            if (walletUpdateError) {
              console.error('Error updating wallet:', walletUpdateError);
              toast.error("Failed to process reimbursement - could not update wallet");
              return;
            }
            
            toast.success(`Expense ${expense.id.substring(0, 8)} approved! Reimbursement processed.`);
          }
        } catch (walletProcessingError) {
          console.error('Error processing reimbursement:', walletProcessingError);
          toast.error("Failed to process reimbursement - unexpected error");
          return;
        }
      } else {
        // For company expenses, update company_spent in wallet
        try {
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', expense.user_id)
            .single();

          if (!walletError && walletData) {
            // For CXO, also deduct from reimbursed and balance
            const updateData: any = {
              company_spent: walletData.company_spent + expense.amount,
              updated_at: new Date()
            };
            
            if (isCXO) {
              updateData.reimbursed = walletData.reimbursed - expense.amount;
              updateData.balance = walletData.balance - expense.amount;
            } else {
              updateData.balance = walletData.balance - expense.amount;
            }
            
            const { error: walletUpdateError } = await supabase
              .from('wallets')
              .update(updateData)
              .eq('user_id', expense.user_id);

            if (walletUpdateError) {
              console.error('Error updating wallet for company expense:', walletUpdateError);
            }
          } else if (walletError) {
            // Create new wallet for company expense if it doesn't exist
            const { error: createWalletError } = await supabase
              .from('wallets')
              .insert([
                {
                  user_id: expense.user_id,
                  allocated: 0,
                  company_spent: expense.amount,
                  reimbursed: isCXO ? -expense.amount : 0,
                  balance: isCXO ? -expense.amount * 2 : -expense.amount,
                  proof_pending: 0,
                }
              ]);

            if (createWalletError) {
              console.error('Error creating wallet for company expense:', createWalletError);
            }
          }
          
          toast.success(`Expense ${expense.id.substring(0, 8)} approved! Wallet updated.`);
        } catch (walletProcessingError) {
          console.error('Error processing company expense:', walletProcessingError);
          toast.success(`Expense ${expense.id.substring(0, 8)} approved! (Wallet update had issues)`);
        }
      }

      setSelectedExpense(null);
      fetchAllExpenses(); // Refresh the list
    } catch (error) {
      toast.error("Failed to approve expense");
      console.error("Error approving expense:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .update({ 
          status: 'rejected', 
          rejection_reason: rejectionReason,
          updated_at: new Date() 
        })
        .eq('id', selectedExpense.id);

      if (error) throw error;

      // Check if the user is a CXO
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', selectedExpense.user_id)
        .single();

      const isCXO = !userError && userData?.role === 'cxo';

      // If this was a personal expense, we should also reduce the proof_pending amount
      // For CXO, we might also need to adjust balance and reimbursed amounts
      if (selectedExpense.source === "personal") {
        try {
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', selectedExpense.user_id)
            .single();

          if (!walletError && walletData) {
            const updatedProofPending = Math.max(0, walletData.proof_pending - selectedExpense.amount);
            
            const updateData: any = {
              proof_pending: updatedProofPending,
              updated_at: new Date()
            };
            
            // For CXO personal expenses, we might need to adjust balance and reimbursed
            // This would depend on the specific business logic for rejected CXO expenses
            
            await supabase
              .from('wallets')
              .update(updateData)
              .eq('user_id', selectedExpense.user_id);
          }
        } catch (walletError) {
          console.error('Error updating wallet for rejection:', walletError);
        }
      } else if (isCXO) {
        // For rejected company expenses from CXO, we might need to adjust balance and reimbursed
        try {
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', selectedExpense.user_id)
            .single();

          if (!walletError && walletData) {
            const updateData: any = {
              updated_at: new Date()
            };
            
            // For rejected CXO company expenses, reverse the adjustments
            // This would depend on the specific business logic
            
            await supabase
              .from('wallets')
              .update(updateData)
              .eq('user_id', selectedExpense.user_id);
          }
        } catch (walletError) {
          console.error('Error updating wallet for CXO company expense rejection:', walletError);
        }
      }

      toast.error(`Expense ${selectedExpense.id.substring(0, 8)} rejected.`);
      setSelectedExpense(null);
      setRejectionReason("");
      fetchAllExpenses(); // Refresh the list
    } catch (error) {
      toast.error("Failed to reject expense");
      console.error("Error rejecting expense:", error);
    }
  };

  const handleAskInfo = (expense: any) => {
    toast.info(`Information request sent to ${expense.users?.name || 'user'}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      approved: { variant: "default", label: "Approved" },
      pending: { variant: "secondary", label: "Pending" },
      rejected: { variant: "destructive", label: "Rejected" },
      proof_pending: { variant: "outline", label: "Proof Pending" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Filter expenses based on search query, selected CXO, and date range
  const getFilteredExpenses = () => {
    let filtered = expenses;

    // Apply CXO filter
    if (selectedCxo !== "all") {
      filtered = filtered.filter(expense => expense.user_id === selectedCxo);
    }

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date range filter
    filtered = filteredExpensesByDate(filtered);

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();

  // Filter CXO users for dropdown search
  const filteredCxoUsers = cxoUsers.filter(cxo =>
    cxo.name.toLowerCase().includes(cxoSearchQuery.toLowerCase())
  );

  const ExpenseTable = ({ status, source }: { status?: string; source?: string }) => {
    let expensesToDisplay = filteredExpenses;
    
    // Filter by status if provided
    if (status) {
      expensesToDisplay = expensesToDisplay.filter((e) => e.status === status);
    }
    
    // Filter by source if provided
    if (source) {
      expensesToDisplay = expensesToDisplay.filter((e) => e.source === source);
    }
    
    // Special filter for approved tab - only show personal expenses
    if (status === "approved") {
      expensesToDisplay = expensesToDisplay.filter((e) => e.source === "personal");
    }
    
    // Check if this is the company spent view
    const isCompanySpentView = source === "company";

    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Expense ID</TableHead>
              <TableHead className="whitespace-nowrap">User</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Source</TableHead>
              <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Proof</TableHead>
              <TableHead className="whitespace-nowrap">Submitted</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              {!isCompanySpentView && <TableHead className="whitespace-nowrap">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expensesToDisplay.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isCompanySpentView ? 8 : 9} className="text-center text-muted-foreground py-8">
                  {dateRange.from && dateRange.to ? 'No expenses found for selected date range' : 'No expenses found'}
                </TableCell>
              </TableRow>
            ) : (
              expensesToDisplay.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-mono whitespace-nowrap">{expense.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{expense.users?.name || 'Unknown User'}</TableCell>
                  <TableCell className="whitespace-nowrap">{expense.category}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={expense.source === "company" ? "default" : "secondary"}>
                      {expense.source === "company" ? "Company" : "Personal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">₹{expense.amount.toLocaleString()}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {expense.proof_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExpense(expense)}
                        className="gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No proof</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(expense.submitted_on).toLocaleDateString()}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {isCompanySpentView ? (
                      <Badge variant="default">Auto-approved</Badge>
                    ) : (
                      getStatusBadge(expense.status)
                    )}
                  </TableCell>
                  {!isCompanySpentView && (
                    <TableCell className="whitespace-nowrap">
                      {expense.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" onClick={() => handleApprove(expense)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setRejectionReason("");
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAskInfo(expense)}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const getSelectedCxoName = () => {
    if (selectedCxo === "all") return "All CXOs";
    const cxo = cxoUsers.find(c => c.id === selectedCxo);
    return cxo ? cxo.name : "Select CXO";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Expense Approvals</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Review and approve expense submissions</p>
          </div>
          
          {/* Filters Section - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Date Range and Search - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 sm:h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">
                Expense Submissions {dateRange.from && dateRange.to 
                  ? `- ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
                  : ''}
              </CardTitle>
              <CardDescription className="text-sm">
                {dateRange.from && dateRange.to 
                  ? `Expense approvals for selected date range` 
                  : selectedCxo === "all" 
                    ? "Managing all expense approvals" 
                    : `Viewing expenses for ${getSelectedCxoName()}`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-48">
              <Button
                variant="outline"
                onClick={() => setIsCxoDropdownOpen(!isCxoDropdownOpen)}
                className="flex items-center gap-2 w-full justify-between h-9 sm:h-10"
              >
                <span className="truncate text-sm">{getSelectedCxoName()}</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </Button>
              
              {isCxoDropdownOpen && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-12 z-50 w-full sm:w-64 rounded-md border bg-popover shadow-md">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search CXO..."
                        value={cxoSearchQuery}
                        onChange={(e) => setCxoSearchQuery(e.target.value)}
                        className="pl-8 h-9 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    <div
                      className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                        selectedCxo === "all" ? "bg-accent font-medium" : ""
                      }`}
                      onClick={() => {
                        setSelectedCxo("all");
                        setIsCxoDropdownOpen(false);
                        setCxoSearchQuery("");
                      }}
                    >
                      All CXOs
                    </div>
                    {filteredCxoUsers.map((cxo) => (
                      <div
                        key={cxo.id}
                        className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                          selectedCxo === cxo.id ? "bg-accent font-medium" : ""
                        }`}
                        onClick={() => {
                          setSelectedCxo(cxo.id);
                          setIsCxoDropdownOpen(false);
                          setCxoSearchQuery("");
                        }}
                      >
                        {cxo.name}
                      </div>
                    ))}
                    {filteredCxoUsers.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        No CXOs found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="w-full sm:w-auto inline-flex">
                  <TabsTrigger value="pending" className="text-xs sm:text-sm whitespace-nowrap">Pending</TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs sm:text-sm whitespace-nowrap">Approved</TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs sm:text-sm whitespace-nowrap">Rejected</TabsTrigger>
                  <TabsTrigger value="proof_pending" className="text-xs sm:text-sm whitespace-nowrap">Proof Pending</TabsTrigger>
                  <TabsTrigger value="company_spent" className="text-xs sm:text-sm whitespace-nowrap">Company Spent</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="pending">
                <ExpenseTable status="pending" />
              </TabsContent>
              <TabsContent value="approved">
                <ExpenseTable status="approved" />
              </TabsContent>
              <TabsContent value="rejected">
                <ExpenseTable status="rejected" />
              </TabsContent>
              <TabsContent value="proof_pending">
                <ExpenseTable status="proof_pending" />
              </TabsContent>
              <TabsContent value="company_spent">
                <ExpenseTable source="company" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={!!selectedExpense && !selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Reject Expense</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">Provide a reason for rejection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedExpense(null)} className="h-9 sm:h-10">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} className="h-9 sm:h-10">
                Reject Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Proof Preview Dialog */}
        <Dialog open={!!selectedExpense && !!selectedExpense.proof_url} onOpenChange={() => setSelectedExpense(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Expense Proof - {selectedExpense?.id.substring(0, 8)}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {selectedExpense?.users?.name || 'Unknown User'} • {selectedExpense?.category} • ₹
                {selectedExpense?.amount?.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-lg p-4 sm:p-8 text-center">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Proof: {selectedExpense?.proof_url}</p>
                <p className="text-xs text-muted-foreground mt-2">Mock proof preview</p>
              </div>
              {selectedExpense?.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notes:</p>
                  <p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
            {selectedExpense?.status === "pending" && (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedExpense(null)} className="h-9 sm:h-10">
                  Close
                </Button>
                <Button variant="destructive" onClick={() => setRejectionReason("")} className="h-9 sm:h-10">
                  Reject
                </Button>
                <Button onClick={() => selectedExpense && handleApprove(selectedExpense)} className="h-9 sm:h-10">
                  Approve
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}