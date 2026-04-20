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
      <div style={styles.card}>
        <h1 style={styles.title}>Expense Tracker</h1>
        <p style={styles.subtitle}>Sign in to manage your expenses</p>
        <button onClick={handleLogin} disabled={loading} style={styles.btn}>
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,.1)", padding: "2.5rem 2rem", textAlign: "center", minWidth: 320 },
  title: { fontSize: "1.6rem", fontWeight: 700, color: "#1e40af", marginBottom: "0.5rem" },
  subtitle: { color: "#6b7280", marginBottom: "1.75rem", fontSize: "0.95rem" },
  btn: { background: "#1e40af", color: "#fff", border: "none", borderRadius: 8, padding: "0.75rem 1.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", width: "100%" },
  error: { color: "#dc2626", marginTop: "1rem", fontSize: "0.875rem" },
};
