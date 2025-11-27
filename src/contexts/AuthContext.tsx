// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { User } from "@/types";
// import { supabase } from "@/lib/supabaseClient";

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);

//   // Check for existing session on app load
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         // Check for an existing Supabase session
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session?.user) {
//           // Get user data from our users table
//           const { data, error } = await supabase
//             .from('users')
//             .select('*')
//             .eq('email', session.user.email)
//             .single();

//           if (!error && data) {
//             const userData: User = {
//               id: data.id,
//               name: data.name,
//               email: data.email,
//               role: data.role,
//               avatar: data.avatar
//             };
//             setUser(userData);
//             localStorage.setItem("user", JSON.stringify(userData));
//           }
//         } else {
//           // Check localStorage as fallback
//           const storedUser = localStorage.getItem("user");
//           if (storedUser) {
//             try {
//               const parsedUser = JSON.parse(storedUser);
//               setUser(parsedUser);
//             } catch (e) {
//               console.error("Failed to parse stored user", e);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error checking session:", error);
//       }
//     };

//     checkSession();
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Convert email to lowercase for consistent authentication
//     const normalizedEmail = email.toLowerCase();
    
//     // Only allow @applywizz.com emails
//     if (!normalizedEmail.endsWith("@applywizz.com")) {
//       return false;
//     }

//     try {
//       // Attempt to sign in with Supabase Auth
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: normalizedEmail,  // Use normalized email
//         password
//       });

//       if (error) {
//         console.error("Supabase login error:", error);
//         return false;
//       }

//       if (data.user) {
//         // Get user data from our users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('*')
//           .eq('email', normalizedEmail)  // Use normalized email
//           .single();

//         if (userError || !userData) {
//           console.error("User not found in Supabase:", userError);
//           return false;
//         }

//         const user: User = {
//           id: userData.id,
//           name: userData.name,
//           email: userData.email,
//           role: userData.role,
//           avatar: userData.avatar
//         };

//         setUser(user);
//         localStorage.setItem("user", JSON.stringify(user));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error("Login error:", error);
//       return false;
//     }
//   };

//   const logout = async () => {
//     try {
//       await supabase.auth.signOut();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


















// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { User } from "@/types";
// import { supabase } from "@/lib/supabaseClient";

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean; // Add loading state
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true); // Track loading state

//   // Check for existing session on app load
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check for an existing Supabase session
//         const { data: { session } } = await supabase.auth.getSession();
        
//         if (session?.user) {
//           // Get user data from our users table
//           const { data, error } = await supabase
//             .from('users')
//             .select('*')
//             .eq('email', session.user.email)
//             .single();

//           if (!error && data) {
//             const userData: User = {
//               id: data.id,
//               name: data.name,
//               email: data.email,
//               role: data.role,
//               avatar: data.avatar
//             };
//             setUser(userData);
//             localStorage.setItem("user", JSON.stringify(userData));
//           }
//         } else {
//           // Check localStorage as fallback
//           const storedUser = localStorage.getItem("user");
//           if (storedUser) {
//             try {
//               const parsedUser = JSON.parse(storedUser);
//               setUser(parsedUser);
//             } catch (e) {
//               console.error("Failed to parse stored user", e);
//               localStorage.removeItem("user"); // Clear invalid data
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error checking session:", error);
//       } finally {
//         setIsLoading(false); // Always set loading to false when done
//       }
//     };

//     checkSession();
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Convert email to lowercase for consistent authentication
//     const normalizedEmail = email.toLowerCase();
    
//     // Only allow @applywizz.com emails
//     if (!normalizedEmail.endsWith("@applywizz.com")) {
//       return false;
//     }

//     try {
//       // Attempt to sign in with Supabase Auth
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: normalizedEmail,
//         password
//       });

//       if (error) {
//         console.error("Supabase login error:", error);
//         return false;
//       }

//       if (data.user) {
//         // Get user data from our users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('*')
//           .eq('email', normalizedEmail)
//           .single();

//         if (userError || !userData) {
//           console.error("User not found in Supabase:", userError);
//           return false;
//         }

//         const user: User = {
//           id: userData.id,
//           name: userData.name,
//           email: userData.email,
//           role: userData.role,
//           avatar: userData.avatar
//         };

//         setUser(user);
//         localStorage.setItem("user", JSON.stringify(user));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error("Login error:", error);
//       return false;
//     }
//   };

//   const logout = async () => {
//     try {
//       await supabase.auth.signOut();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }





















































// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { User } from "@/types";
// import { supabase } from "@/lib/supabaseClient";
// import { Session } from "@supabase/supabase-js";

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Check for existing session on app load
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         setIsLoading(true);
        
//         // First, try to get the Supabase session
//         const { data: { session }, error } = await supabase.auth.getSession();
        
//         if (error) {
//           console.error("Session check error:", error);
//           // If session check fails, try localStorage as fallback
//           await tryLocalStorageAuth();
//           return;
//         }

//         if (session?.user) {
//           await handleSuccessfulAuth(session.user);
//         } else {
//           // No Supabase session, try localStorage
//           await tryLocalStorageAuth();
//         }
//       } catch (error) {
//         console.error("Error checking session:", error);
//         await tryLocalStorageAuth();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkSession();

//     // Listen for auth state changes (for token refresh, etc.)
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (event === 'SIGNED_IN' && session?.user) {
//           await handleSuccessfulAuth(session.user);
//         } else if (event === 'SIGNED_OUT') {
//           setUser(null);
//           localStorage.removeItem("user");
//           localStorage.removeItem("rememberMe");
//         }
//       }
//     );

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const tryLocalStorageAuth = async () => {
//     const rememberMe = localStorage.getItem("rememberMe");
//     const storedUser = localStorage.getItem("user");

//     if (rememberMe === "true" && storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
        
//         // Verify the user still exists in Supabase
//         const { data, error } = await supabase
//           .from('users')
//           .select('*')
//           .eq('email', parsedUser.email)
//           .single();

//         if (!error && data) {
//           const userData: User = {
//             id: data.id,
//             name: data.name,
//             email: data.email,
//             role: data.role,
//             avatar: data.avatar
//           };
//           setUser(userData);
          
//           // Try to refresh the session
//           const { data: { session } } = await supabase.auth.getSession();
//           if (!session) {
//             // If no session but remember me is true, we keep the user logged in
//             // but they might need to re-authenticate for sensitive operations
//             console.log("Using remembered login");
//           }
//         } else {
//           // User no longer exists in database
//           localStorage.removeItem("user");
//           localStorage.removeItem("rememberMe");
//         }
//       } catch (e) {
//         console.error("Failed to restore remembered login", e);
//         localStorage.removeItem("user");
//         localStorage.removeItem("rememberMe");
//       }
//     }
//   };

//   const handleSuccessfulAuth = async (supabaseUser: any) => {
//     try {
//       // Get user data from our users table
//       const { data, error } = await supabase
//         .from('users')
//         .select('*')
//         .eq('email', supabaseUser.email)
//         .single();

//       if (!error && data) {
//         const userData: User = {
//           id: data.id,
//           name: data.name,
//           email: data.email,
//           role: data.role,
//           avatar: data.avatar
//         };
//         setUser(userData);
//         localStorage.setItem("user", JSON.stringify(userData));
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

//   const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
//     // Convert email to lowercase for consistent authentication
//     const normalizedEmail = email.toLowerCase();
    
//     // Only allow @applywizz.com emails
//     if (!normalizedEmail.endsWith("@applywizz.com")) {
//       return false;
//     }

//     try {
//       // Attempt to sign in with Supabase Auth
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: normalizedEmail,
//         password
//       });

//       if (error) {
//         console.error("Supabase login error:", error);
//         return false;
//       }

//       if (data.user) {
//         // Store remember me preference
//         if (rememberMe) {
//           localStorage.setItem("rememberMe", "true");
//         } else {
//           localStorage.setItem("rememberMe", "false");
//         }

//         // Get user data from our users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('*')
//           .eq('email', normalizedEmail)
//           .single();

//         if (userError || !userData) {
//           console.error("User not found in Supabase:", userError);
//           return false;
//         }

//         const user: User = {
//           id: userData.id,
//           name: userData.name,
//           email: userData.email,
//           role: userData.role,
//           avatar: userData.avatar
//         };

//         setUser(user);
//         localStorage.setItem("user", JSON.stringify(user));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error("Login error:", error);
//       return false;
//     }
//   };

//   const logout = async () => {
//     try {
//       await supabase.auth.signOut();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//     setUser(null);
//     localStorage.removeItem("user");
//     localStorage.removeItem("rememberMe");
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


























import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        // Try localStorage as fallback
        await restoreFromLocalStorage();
        return;
      }

      if (session?.user) {
        await fetchUserData(session.user.email!);
      } else {
        // No Supabase session, try localStorage
        await restoreFromLocalStorage();
      }
    } catch (error) {
      console.error("Error in checkSession:", error);
      await restoreFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromLocalStorage = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const rememberMe = localStorage.getItem("rememberMe");
      
      if (rememberMe === "true" && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error restoring from localStorage:", error);
      // Clear invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
    }
  };

  const fetchUserData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      if (data) {
        const userData: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase();
    
    // Only allow @applywizz.com emails
    if (!normalizedEmail.endsWith("@applywizz.com")) {
      return false;
    }

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }

      if (data.user) {
        // Store remember me preference
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .single();

        if (userError) {
          console.error("User data error:", userError);
          return false;
        }

        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar
        };

        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Unexpected login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}