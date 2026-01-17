import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface LoginViewProps {
  onSuccess?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;
      if (isSignup) {
        result = await signup(email, password, name);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-black flex items-center justify-center p-8">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-20 size-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 size-[400px] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="editorial-title text-6xl text-primary mb-4">
            EPSILON
          </h1>
          <p className="text-white/40 text-sm uppercase tracking-widest">
            Brand Intelligence Platform
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10">
          <h2 className="font-display text-2xl text-white uppercase tracking-widest mb-8 text-center">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="Your name"
                  required={isSignup}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-display text-lg uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? "Please wait..."
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-white/40 hover:text-primary text-sm transition-colors"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/20 text-xs uppercase tracking-wider mb-2">
              Demo Credentials
            </p>
            <p className="text-white/40 text-sm font-mono">
              demo@epsilon.ai / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
