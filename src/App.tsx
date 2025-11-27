// import { useEffect } from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { initializeSupabaseData } from "@/lib/initializeSupabase";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Wallets from "./pages/Wallets";
// import Approvals from "./pages/Approvals";
// import CompanyExpenses from "./pages/CompanyExpenses";
// import Reports from "./pages/Reports";
// import MyWallet from "./pages/MyWallet";
// import Admin from "./pages/Admin";
// import ResetPassword from "./pages/ResetPassword";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// const AppInitializer = () => {
//   useEffect(() => {
//     // Initialize Supabase with mock data on first run
//     initializeSupabaseData();
//   }, []);

//   return null;
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <AppInitializer />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/wallets"
//               element={
//                 <ProtectedRoute>
//                   <Wallets />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/approvals"
//               element={
//                 <ProtectedRoute>
//                   <Approvals />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/company-expenses"
//               element={
//                 <ProtectedRoute>
//                   <CompanyExpenses />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/reports"
//               element={
//                 <ProtectedRoute>
//                   <Reports />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/my-wallet"
//               element={
//                 <ProtectedRoute>
//                   <MyWallet />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute>
//                   <Admin />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );

// export default App;























// import { useEffect } from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { initializeSupabaseData } from "@/lib/initializeSupabase";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Wallets from "./pages/Wallets";
// import Approvals from "./pages/Approvals";
// import CompanyExpenses from "./pages/CompanyExpenses";
// import Reports from "./pages/Reports";
// import MyWallet from "./pages/MyWallet";
// import Admin from "./pages/Admin";
// import ResetPassword from "./pages/ResetPassword";
// import RequestResetPassword from "./pages/RequestResetPassword"; // ADD THIS IMPORT
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// const AppInitializer = () => {
//   useEffect(() => {
//     // Initialize Supabase with mock data on first run
//     initializeSupabaseData();
//   }, []);

//   return null;
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <AppInitializer />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/wallets"
//               element={
//                 <ProtectedRoute>
//                   <Wallets />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/approvals"
//               element={
//                 <ProtectedRoute>
//                   <Approvals />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/company-expenses"
//               element={
//                 <ProtectedRoute>
//                   <CompanyExpenses />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/reports"
//               element={
//                 <ProtectedRoute>
//                   <Reports />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/my-wallet"
//               element={
//                 <ProtectedRoute>
//                   <MyWallet />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute>
//                   <Admin />
//                 </ProtectedRoute>
//               }
//             />
//             {/* ADD THIS NEW ROUTE */}
//             <Route path="/request-reset" element={<RequestResetPassword />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );

// export default App;



















































// import { useEffect } from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { initializeSupabaseData } from "@/lib/initializeSupabase";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Wallets from "./pages/Wallets";
// import Approvals from "./pages/Approvals";
// import CompanyExpenses from "./pages/CompanyExpenses";
// import Reports from "./pages/Reports";
// import MyWallet from "./pages/MyWallet";
// import Admin from "./pages/Admin";
// import ResetPassword from "./pages/ResetPassword";
// import RequestResetPassword from "./pages/RequestResetPassword"; // ADD THIS IMPORT
// import ExpenseCategories from "./pages/ExpenseCategories"; // ADD THIS IMPORT
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// const AppInitializer = () => {
//   useEffect(() => {
//     // Initialize Supabase with mock data on first run
//     initializeSupabaseData();
//   }, []);

//   return null;
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <AppInitializer />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/wallets"
//               element={
//                 <ProtectedRoute>
//                   <Wallets />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/approvals"
//               element={
//                 <ProtectedRoute>
//                   <Approvals />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/company-expenses"
//               element={
//                 <ProtectedRoute>
//                   <CompanyExpenses />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/reports"
//               element={
//                 <ProtectedRoute>
//                   <Reports />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/my-wallet"
//               element={
//                 <ProtectedRoute>
//                   <MyWallet />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute>
//                   <Admin />
//                 </ProtectedRoute>
//               }
//             />
//             {/* ADD THIS NEW ROUTE */}
//             <Route path="/request-reset" element={<RequestResetPassword />} />
//             <Route path="/expense-categories" element={
//               <ProtectedRoute>
//                 <ExpenseCategories />
//               </ProtectedRoute>
//             } />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );

// export default App;
















































// import { useEffect } from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { initializeSupabaseData } from "@/lib/initializeSupabase";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Wallets from "./pages/Wallets";
// import Approvals from "./pages/Approvals";
// import CompanyExpenses from "./pages/CompanyExpenses";
// import Reports from "./pages/Reports";
// import MyWallet from "./pages/MyWallet";
// import Admin from "./pages/Admin";
// import ResetPassword from "./pages/ResetPassword";
// import RequestResetPassword from "./pages/RequestResetPassword";
// import ExpenseCategories from "./pages/ExpenseCategories";
// import CxoProfile from "./pages/CxoProfile"; // ADD THIS IMPORT
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// const AppInitializer = () => {
//   useEffect(() => {
//     // Initialize Supabase with mock data on first run
//     initializeSupabaseData();
//   }, []);

//   return null;
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <AppInitializer />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/wallets"
//               element={
//                 <ProtectedRoute>
//                   <Wallets />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/approvals"
//               element={
//                 <ProtectedRoute>
//                   <Approvals />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/company-expenses"
//               element={
//                 <ProtectedRoute>
//                   <CompanyExpenses />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/reports"
//               element={
//                 <ProtectedRoute>
//                   <Reports />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/my-wallet"
//               element={
//                 <ProtectedRoute>
//                   <MyWallet />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute>
//                   <Admin />
//                 </ProtectedRoute>
//               }
//             />
//             {/* ADD THIS NEW ROUTE */}
//             <Route path="/request-reset" element={<RequestResetPassword />} />
//             <Route path="/expense-categories" element={
//               <ProtectedRoute>
//                 <ExpenseCategories />
//               </ProtectedRoute>
//             } />
//             <Route path="/cxo/:id" element={
//               <ProtectedRoute>
//                 <CxoProfile />
//               </ProtectedRoute>
//             } />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );

// export default App;























































import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { initializeSupabaseData } from "@/lib/initializeSupabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import Approvals from "./pages/Approvals";
import CompanyExpenses from "./pages/CompanyExpenses";
import Reports from "./pages/Reports";
import MyWallet from "./pages/MyWallet";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import RequestResetPassword from "./pages/RequestResetPassword";
import ExpenseCategories from "./pages/ExpenseCategories";
import CxoProfile from "./pages/CxoProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Add a loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Only redirect if not loading and no user
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const AppInitializer = () => {
  useEffect(() => {
    // Initialize Supabase with mock data on first run
    initializeSupabaseData();
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppInitializer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute>
                  <Wallets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute>
                  <Approvals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-expenses"
              element={
                <ProtectedRoute>
                  <CompanyExpenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-wallet"
              element={
                <ProtectedRoute>
                  <MyWallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/request-reset" element={<RequestResetPassword />} />
            <Route path="/expense-categories" element={
              <ProtectedRoute>
                <ExpenseCategories />
              </ProtectedRoute>
            } />
            <Route path="/cxo/:id" element={
              <ProtectedRoute>
                <CxoProfile />
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;