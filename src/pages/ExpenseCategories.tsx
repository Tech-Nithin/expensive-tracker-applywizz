// import { useState, useEffect, useMemo } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { supabase } from "@/lib/supabaseClient";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "sonner";
// import { ChevronDown, ChevronRight, Search, ArrowLeft, Filter } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";

// // Define all available categories
// const ALL_CATEGORIES = [
//   "Food", "Software", "Internet", "Marketing", "Travel", 
//   "Office Supplies", "Office Equipment", "Commission",
//   "Company Incorporation", "Course", "Influencers Fees",
//   "Management Expenses", "Miscellaneous", "Tech Infrastructure", "Other"
// ];

// export default function ExpenseCategories() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//   // Get category from URL query parameter
//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search);
//     const categoryParam = urlParams.get('category');
//     const typeParam = urlParams.get('type'); // 'company' or 'user'
    
//     if (categoryParam) {
//       setSelectedCategory(decodeURIComponent(categoryParam));
//     }
//   }, [location.search]);

//   // Fetch all expenses for the user
//   useEffect(() => {
//     const fetchExpenses = async () => {
//       if (!user?.id) return;

//       try {
//         setLoading(true);
        
//         // Check if we're viewing company expenses
//         const urlParams = new URLSearchParams(location.search);
//         const typeParam = urlParams.get('type');
//         const isCompanyExpenses = typeParam === 'company';
        
//         let data: any[] | null = null;
//         let error: any = null;
        
//         if (isCompanyExpenses) {
//           // Fetch company expenses
//           const result = await supabase
//             .from('company_expenses')
//             .select('*')
//             .order('date', { ascending: false });
//           data = result.data || [];
//           error = result.error;
//         } else {
//           // Fetch user expenses
//           const result = await supabase
//             .from('expenses')
//             .select('*')
//             .eq('user_id', user.id)
//             .order('submitted_on', { ascending: false });
//           data = result.data || [];
//           error = result.error;
//         }

//         if (error) throw error;
//         setExpenses(data);
        
//         // Auto-expand first few categories initially
//         const initialExpanded: Record<string, boolean> = {};
//         const categories = [...new Set(data.map(expense => expense.category || expense.type).filter(Boolean))] as string[];
//         categories.slice(0, 3).forEach(category => {
//           initialExpanded[category] = true;
//         });
//         setExpandedCategories(initialExpanded);
        
//         // If no category is selected but we have data, select first category by default
//         if (!selectedCategory && categories.length > 0) {
//           const urlParams = new URLSearchParams(location.search);
//           const categoryParam = urlParams.get('category');
//           if (!categoryParam) {
//             setSelectedCategory(categories[0]);
//           }
//         }
//       } catch (error: any) {
//         console.error('Error fetching expenses:', error);
//         toast.error("Failed to fetch expenses");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpenses();
//   }, [user?.id]);

//   // Get unique categories from expenses
//   const availableCategories = useMemo(() => {
//     // Check if we're viewing company expenses
//     const urlParams = new URLSearchParams(location.search);
//     const typeParam = urlParams.get('type');
//     const isCompanyExpenses = typeParam === 'company';
    
//     const categories = [...new Set(expenses.map(expense => 
//       isCompanyExpenses ? expense.type : expense.category
//     ).filter(Boolean))] as string[];
//     return categories.sort();
//   }, [expenses]);

//   // Filter expenses based on selected category and search
//   const filteredExpenses = useMemo(() => {
//     let filtered = expenses;

//     // Filter by selected category
//     if (selectedCategory) {
//       // Check if we're viewing company expenses
//       const urlParams = new URLSearchParams(location.search);
//       const typeParam = urlParams.get('type');
//       const isCompanyExpenses = typeParam === 'company';
      
//       if (isCompanyExpenses) {
//         // For company expenses, filter by 'type' field
//         filtered = filtered.filter(expense => expense.type === selectedCategory);
//       } else {
//         // For user expenses, filter by 'category' field
//         filtered = filtered.filter(expense => expense.category === selectedCategory);
//       }
//     }

//     // Filter by search term
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(expense => 
//         (expense.category && expense.category.toLowerCase().includes(term)) ||
//         (expense.type && expense.type.toLowerCase().includes(term)) ||
//         (expense.subcategory && expense.subcategory.toLowerCase().includes(term)) ||
//         (expense.notes && expense.notes.toLowerCase().includes(term)) ||
//         (expense.amount && expense.amount.toString().includes(term)) ||
//         (expense.id && expense.id.toLowerCase().includes(term))
//       );
//     }

//     return filtered;
//   }, [expenses, selectedCategory, searchTerm]);

//   // Group filtered expenses by category
//   const groupedExpenses = useMemo(() => {
//     const groups: Record<string, any[]> = {};
    
//     // Check if we're viewing company expenses
//     const urlParams = new URLSearchParams(location.search);
//     const typeParam = urlParams.get('type');
//     const isCompanyExpenses = typeParam === 'company';
    
//     filteredExpenses.forEach(expense => {
//       const category = isCompanyExpenses 
//         ? (expense.type || 'Uncategorized')
//         : (expense.category || 'Uncategorized');
//       if (!groups[category]) {
//         groups[category] = [];
//       }
//       groups[category].push(expense);
//     });

//     return groups;
//   }, [filteredExpenses]);

//   // Select a single category
//   const selectCategory = (category: string) => {
//     setSelectedCategory(category);
//   };

//   // Clear category selection
//   const clearCategory = () => {
//     setSelectedCategory(null);
//   };

//   // Toggle category expansion
//   const toggleCategoryExpansion = (category: string) => {
//     setExpandedCategories(prev => ({
//       ...prev,
//       [category]: !prev[category]
//     }));
//   };

//   // Toggle all categories expansion
//   const toggleAllExpansion = () => {
//     const allExpanded = Object.values(expandedCategories).every(Boolean);
//     const newState: Record<string, boolean> = {};
//     availableCategories.forEach(category => {
//       newState[category] = !allExpanded;
//     });
//     setExpandedCategories(newState);
//   };

//   // Calculate total amount for a category
//   const getCategoryTotal = (expenses: any[]) => {
//     return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
//   };

//   // Calculate overall total
//   const getOverallTotal = () => {
//     return filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString();
//   };

//   // Get status badge
//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
//       approved: "default",
//       pending: "secondary",
//       rejected: "destructive",
//       proof_pending: "outline",
//     };
//     return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <Button 
//               variant="outline" 
//               size="icon"
//               onClick={() => navigate(-1)}
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight">Expense Categories</h1>
//               <p className="text-muted-foreground">
//                 {filteredExpenses.length} expenses • ₹{getOverallTotal().toLocaleString()} total
//                 {selectedCategory && ` • Viewing: ${selectedCategory}`}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex gap-2">
//             <Button onClick={toggleAllExpansion} variant="outline">
//               {Object.values(expandedCategories).every(Boolean) ? 'Collapse All' : 'Expand All'}
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Category Filter Sidebar */}
//           <Card className="lg:col-span-1">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Filter className="h-4 w-4" />
//                 Categories
//               </CardTitle>
//               <CardDescription>
//                 {selectedCategory ? `Selected: ${selectedCategory}` : "Select a category to view expenses"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex gap-2">
//                   <Button 
//                     size="sm" 
//                     variant="outline" 
//                     onClick={clearCategory}
//                     className="flex-1"
//                   >
//                     View All
//                   </Button>
//                 </div>
                
//                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                   {availableCategories.map((category) => (
//                     <div
//                       key={category}
//                       className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
//                         selectedCategory === category
//                           ? 'bg-blue-50 border-blue-200 shadow-sm'
//                           : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                       }`}
//                       onClick={() => selectCategory(category)}
//                     >
//                       <div
//                         className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                           selectedCategory === category
//                             ? 'bg-blue-600 border-blue-600'
//                             : 'bg-white border-gray-300'
//                         }`}
//                       >
//                         {selectedCategory === category && (
//                           <div className="w-1.5 h-1.5 bg-white rounded-full" />
//                         )}
//                       </div>
//                       <span className={`font-medium flex-1 ${
//                         selectedCategory === category ? 'text-blue-700' : 'text-gray-700'
//                       }`}>
//                         {category}
//                       </span>
//                       <Badge 
//                         variant={selectedCategory === category ? "default" : "secondary"} 
//                         className="text-xs"
//                       >
//                         {expenses.filter(e => {
//                           // Check if we're viewing company expenses
//                           const urlParams = new URLSearchParams(location.search);
//                           const typeParam = urlParams.get('type');
//                           const isCompanyExpenses = typeParam === 'company';
                          
//                           if (isCompanyExpenses) {
//                             return e.type === category;
//                           } else {
//                             return e.category === category;
//                           }
//                         }).length}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>

//                 {availableCategories.length === 0 && (
//                   <div className="text-center text-sm text-muted-foreground py-4">
//                     No categories available
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Main Content */}
//           <div className="lg:col-span-3 space-y-6">
//             {/* Search */}
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="relative max-w-md">
//                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search expenses by category, subcategory, notes, amount..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-8"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Category Segments */}
//             {availableCategories.length === 0 ? (
//               <Card>
//                 <CardContent className="py-8">
//                   <div className="text-center text-muted-foreground">
//                     No expenses found
//                   </div>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-4">
//                 {availableCategories
//                   .filter(category => !selectedCategory || category === selectedCategory)
//                   .map((category) => {
//                     const categoryExpenses = groupedExpenses[category] || [];
//                     const categoryTotal = getCategoryTotal(categoryExpenses);
                    
//                     return (
//                       <Card key={category} className="overflow-hidden">
//                         {/* Category Header */}
//                         <div 
//                           className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors border-b"
//                           onClick={() => toggleCategoryExpansion(category)}
//                         >
//                           <div className="flex items-center space-x-4">
//                             {expandedCategories[category] ? 
//                               <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
//                               <ChevronRight className="h-5 w-5 text-muted-foreground" />
//                             }
//                             <div className="text-left">
//                               <h3 className="font-semibold text-xl">{category}</h3>
//                               <p className="text-sm text-muted-foreground">
//                                 {categoryExpenses.length} expenses • {categoryExpenses.filter(e => e.subcategory).length} sub-categories
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <div className="font-bold text-2xl text-green-600">
//                               ₹{categoryTotal.toLocaleString()}
//                             </div>
//                             <div className="text-sm text-muted-foreground">
//                               Total spent
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Category Content */}
//                         {expandedCategories[category] && categoryExpenses.length > 0 && (
//                           <div className="p-0">
//                             <Table>
//                               <TableHeader>
//                                 <TableRow>
//                                   <TableHead>Expense ID</TableHead>
//                                   <TableHead>Sub Category</TableHead>
//                                   <TableHead>Source</TableHead>
//                                   <TableHead className="text-right">Amount</TableHead>
//                                   <TableHead>Status</TableHead>
//                                   <TableHead>Date</TableHead>
//                                   <TableHead>Notes</TableHead>
//                                 </TableRow>
//                               </TableHeader>
//                               <TableBody>
//                                 {categoryExpenses.map((expense) => (
//                                   <TableRow key={expense.id} className="hover:bg-muted/50">
//                                     <TableCell className="font-mono text-sm">
//                                       {expense.id?.substring(0, 8) || expense.id}
//                                     </TableCell>
//                                     <TableCell>
//                                       <Badge variant="outline" className="capitalize">
//                                         {expense.subcategory || 'General'}
//                                       </Badge>
//                                     </TableCell>
//                                     <TableCell>
//                                       {/* Check if this is a company expense */}
//                                       {expense.vendor ? (
//                                         // Company expense
//                                         <Badge variant="default">
//                                           Company
//                                         </Badge>
//                                       ) : (
//                                         // User expense
//                                         <Badge variant={expense.source === "company" ? "default" : "secondary"}>
//                                           {expense.source === "company" ? "Company" : "Personal"}
//                                         </Badge>
//                                       )}
//                                     </TableCell>
//                                     <TableCell className="text-right font-semibold">
//                                       ₹{expense.amount?.toLocaleString() || expense.amount}
//                                     </TableCell>
//                                     <TableCell>
//                                       {expense.status ? getStatusBadge(expense.status) : (
//                                         <Badge variant="default">Completed</Badge>
//                                       )}
//                                     </TableCell>
//                                     <TableCell className="text-sm">
//                                       {formatDate(expense.submitted_on || expense.date)}
//                                     </TableCell>
//                                     <TableCell className="max-w-[200px] truncate text-sm">
//                                       {expense.notes || 'No notes'}
//                                     </TableCell>
//                                   </TableRow>
//                                 ))}
//                               </TableBody>
//                             </Table>
//                           </div>
//                         )}

//                         {expandedCategories[category] && categoryExpenses.length === 0 && (
//                           <div className="p-8 text-center text-muted-foreground">
//                             No expenses found for this category
//                           </div>
//                         )}
//                       </Card>
//                     );
//                   })}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );

// }







































import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Search, ArrowLeft, Filter } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Define all available categories
const ALL_CATEGORIES = [
  "Food", "Software", "Internet", "Marketing", "Travel", 
  "Office Supplies", "Office Equipment", "Commission",
  "Company Incorporation", "Course", "Influencers Fees",
  "Management Expenses", "Miscellaneous", "Tech Infrastructure", "Other"
];

export default function ExpenseCategories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get category from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const typeParam = urlParams.get('type'); // 'company' or 'user'
    
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
  }, [location.search]);

  // Fetch all expenses for the user
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Check if we're viewing company expenses
        const urlParams = new URLSearchParams(location.search);
        const typeParam = urlParams.get('type');
        const isCompanyExpenses = typeParam === 'company';
        
        let data: any[] | null = null;
        let error: any = null;
        
        if (isCompanyExpenses) {
          // Fetch company expenses
          const result = await supabase
            .from('company_expenses')
            .select('*')
            .order('date', { ascending: false });
          data = result.data || [];
          error = result.error;
        } else {
          // Fetch user expenses
          const result = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('submitted_on', { ascending: false });
          data = result.data || [];
          error = result.error;
        }

        if (error) throw error;
        setExpenses(data);
        
        // Auto-expand first few categories initially
        const initialExpanded: Record<string, boolean> = {};
        const categories = [...new Set(data.map(expense => expense.category || expense.type).filter(Boolean))] as string[];
        categories.slice(0, 3).forEach(category => {
          initialExpanded[category] = true;
        });
        setExpandedCategories(initialExpanded);
        
        // If no category is selected but we have data, select first category by default
        if (!selectedCategory && categories.length > 0) {
          const urlParams = new URLSearchParams(location.search);
          const categoryParam = urlParams.get('category');
          if (!categoryParam) {
            setSelectedCategory(categories[0]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching expenses:', error);
        toast.error("Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user?.id]);

  // Get unique categories from expenses
  const availableCategories = useMemo(() => {
    // Check if we're viewing company expenses
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get('type');
    const isCompanyExpenses = typeParam === 'company';
    
    const categories = [...new Set(expenses.map(expense => 
      isCompanyExpenses ? expense.type : expense.category
    ).filter(Boolean))] as string[];
    return categories.sort();
  }, [expenses]);

  // Filter expenses based on selected category and search
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by selected category
    if (selectedCategory) {
      // Check if we're viewing company expenses
      const urlParams = new URLSearchParams(location.search);
      const typeParam = urlParams.get('type');
      const isCompanyExpenses = typeParam === 'company';
      
      if (isCompanyExpenses) {
        // For company expenses, filter by 'type' field
        filtered = filtered.filter(expense => expense.type === selectedCategory);
      } else {
        // For user expenses, filter by 'category' field
        filtered = filtered.filter(expense => expense.category === selectedCategory);
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        (expense.category && expense.category.toLowerCase().includes(term)) ||
        (expense.type && expense.type.toLowerCase().includes(term)) ||
        (expense.subcategory && expense.subcategory.toLowerCase().includes(term)) ||
        (expense.notes && expense.notes.toLowerCase().includes(term)) ||
        (expense.amount && expense.amount.toString().includes(term)) ||
        (expense.id && expense.id.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [expenses, selectedCategory, searchTerm]);

  // Group filtered expenses by category
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    // Check if we're viewing company expenses
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get('type');
    const isCompanyExpenses = typeParam === 'company';
    
    filteredExpenses.forEach(expense => {
      const category = isCompanyExpenses 
        ? (expense.type || 'Uncategorized')
        : (expense.category || 'Uncategorized');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(expense);
    });

    return groups;
  }, [filteredExpenses]);

  // Select a single category
  const selectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Clear category selection
  const clearCategory = () => {
    setSelectedCategory(null);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Toggle all categories expansion
  const toggleAllExpansion = () => {
    const allExpanded = Object.values(expandedCategories).every(Boolean);
    const newState: Record<string, boolean> = {};
    availableCategories.forEach(category => {
      newState[category] = !allExpanded;
    });
    setExpandedCategories(newState);
  };

  // Calculate total amount for a category
  // const getCategoryTotal = (expenses: any[]) => {
  //   return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  // };


  const getCategoryTotal = (expenses: any[]) => {
  return expenses
    .filter(expense => expense.status !== "rejected")
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
};


  // Calculate overall total
  // const getOverallTotal = () => {
  //   return filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  // };




  const getOverallTotal = () => {
  return filteredExpenses
    .filter(expense => expense.status !== "rejected")
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
};


  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      proof_pending: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expense Categories</h1>
              <p className="text-muted-foreground">
                {filteredExpenses.length} expenses • ₹{getOverallTotal().toLocaleString()} total
                {selectedCategory && ` • Viewing: ${selectedCategory}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={toggleAllExpansion} variant="outline">
              {Object.values(expandedCategories).every(Boolean) ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Filter Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </CardTitle>
              <CardDescription>
                {selectedCategory ? `Selected: ${selectedCategory}` : "Select a category to view expenses"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={clearCategory}
                    className="flex-1"
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => selectCategory(category)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedCategory === category
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {selectedCategory === category && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className={`font-medium flex-1 ${
                        selectedCategory === category ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {category}
                      </span>
                      <Badge 
                        variant={selectedCategory === category ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {expenses.filter(e => {
                          // Check if we're viewing company expenses
                          const urlParams = new URLSearchParams(location.search);
                          const typeParam = urlParams.get('type');
                          const isCompanyExpenses = typeParam === 'company';
                          
                          if (isCompanyExpenses) {
                            return e.type === category;
                          } else {
                            return e.category === category;
                          }
                        }).length}
                      </Badge>
                    </div>
                  ))}
                </div>

                {availableCategories.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No categories available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative max-w-md lg:w-[900px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses by category, subcategory, notes, amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Segments */}
            {availableCategories.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    No expenses found
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableCategories
                  .filter(category => !selectedCategory || category === selectedCategory)
                  .map((category) => {
                    const categoryExpenses = groupedExpenses[category] || [];
                    const categoryTotal = getCategoryTotal(categoryExpenses);
                    
                    return (
                      <Card key={category} className="overflow-hidden">
                        {/* Category Header */}
                        <div 
                          className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors border-b"
                          onClick={() => toggleCategoryExpansion(category)}
                        >
                          <div className="flex items-center space-x-4">
                            {expandedCategories[category] ? 
                              <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            }
                            <div className="text-left">
                              <h3 className="font-semibold text-xl">{category}</h3>
                              <p className="text-sm text-muted-foreground">
                                {categoryExpenses.length} expenses • {categoryExpenses.filter(e => e.subcategory).length} sub-categories
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-green-600">
                              ₹{categoryTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total spent
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Content */}
                        {expandedCategories[category] && categoryExpenses.length > 0 && (
                          <div className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Expense ID</TableHead>
                                  <TableHead>Sub Category</TableHead>
                                  <TableHead>Source</TableHead>
                                  <TableHead className="text-right">Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {/* {categoryExpenses.map((expense) => ( */}

                                {categoryExpenses
  .filter(expense => expense.status !== "rejected")
  .map((expense) => (

                                  <TableRow key={expense.id} className="hover:bg-muted/50">
                                    <TableCell className="font-mono text-sm">
                                      {expense.id?.substring(0, 8) || expense.id}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize">
                                        {expense.subcategory || 'General'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {/* Check if this is a company expense */}
                                      {expense.vendor ? (
                                        // Company expense
                                        <Badge variant="default">
                                          Company
                                        </Badge>
                                      ) : (
                                        // User expense
                                        <Badge variant={expense.source === "company" ? "default" : "secondary"}>
                                          {expense.source === "company" ? "Company" : "Personal"}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      ₹{expense.amount?.toLocaleString() || expense.amount}
                                    </TableCell>
                                    <TableCell>
                                      {expense.status ? getStatusBadge(expense.status) : (
                                        <Badge variant="default">Completed</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {formatDate(expense.submitted_on || expense.date)}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm">
                                      {expense.notes || 'No notes'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {expandedCategories[category] && categoryExpenses.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            No expenses found for this category
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
