import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login();
    } catch (err) {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="et-card" style={styles.card}>
        <p style={styles.eyebrow}>Expense Tracker</p>
        <h1 style={styles.title}>Track your spending,<br />effortlessly.</h1>
        <p style={styles.subtitle}>Sign in to manage your expenses</p>
        <button onClick={handleLogin} disabled={loading} className="et-btn" style={styles.btn}>
          {loading ? "Signing in…" : "Continue with Google"}
        </button>
        {error && <p className="et-error" style={{ marginBottom: 0, marginTop: "0.75rem" }}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  card: { padding: "2.5rem 2rem", minWidth: 340, maxWidth: 400, width: "100%" },
  eyebrow: { fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9a9a9a", marginBottom: "1rem" },
  title: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.025em", color: "#0d0d0d", marginBottom: "0.4rem" },
  subtitle: { fontSize: "0.875rem", color: "#9a9a9a" },
  btn: { width: "100%", marginTop: "1.75rem", padding: "0.65rem 1.5rem" },
};
