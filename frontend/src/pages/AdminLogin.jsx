import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import GlowOrbs from "../components/GlowOrbs";
import PageTransition from "../components/PageTransition";

const AdminLogin = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Admin Login | Mohan Kumar Dalei</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <GlowOrbs />
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors duration-200"
          data-testid="admin-back-home"
        >
          <ArrowLeft size={16} /> Back to site
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md glass rounded-2xl p-8 md:p-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 text-primary glow-primary">
            <Lock size={24} />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">Admin Access</h1>
          <p className="mt-2 text-ink-muted text-sm">Sign in to manage projects, testimonials and messages.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-6" data-testid="admin-login-form">
            <div>
              <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-muted mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-email"
                className="w-full bg-transparent border-b border-border py-3 focus:border-primary outline-none transition-colors duration-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-muted mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-password"
                className="w-full bg-transparent border-b border-border py-3 focus:border-primary outline-none transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-400" data-testid="admin-login-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground disabled:opacity-70 hover:bg-highlight transition-colors duration-200"
              data-testid="admin-login-submit"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;
