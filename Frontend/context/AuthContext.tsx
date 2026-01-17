import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "http://localhost:3001/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("epsilon_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("epsilon_token");
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const data = await response.json();

        if (data.success && data.data?.user) {
          setUser(data.data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem("epsilon_token");
          setToken(null);
        }
      } catch (error) {
        localStorage.removeItem("epsilon_token");
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem("epsilon_token", data.data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          setUser(data.data.user);
          setToken(data.data.token);
          localStorage.setItem("epsilon_token", data.data.token);
          return { success: true };
        } else {
          return {
            success: false,
            error: data.error?.message || "Signup failed",
          };
        }
      } catch (error) {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("epsilon_token");
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
