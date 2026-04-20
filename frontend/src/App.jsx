import { useState, useMemo } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseFilters from "./components/ExpenseFilters";
import ExpenseList from "./components/ExpenseList";
import CategorySummary from "./components/CategorySummary";
import Login from "./components/Login";
import { useExpenses, useSummary } from "./hooks/useExpenses";
import { useAuth } from "./context/AuthContext";

function Dashboard({ user }) {
  const { logout } = useAuth();
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [refreshToken, setRefreshToken] = useState(0);

  const { expenses, total, loading, error, reload } = useExpenses({ category, sort });
  const { summary, summaryLoading } = useSummary(refreshToken);

  function handleCreated() {
    reload();
    setRefreshToken((t) => t + 1);
  }

  const uniqueCategories = useMemo(() => {
    return summary.map((s) => s.category).sort();
  }, [summary]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Expense Tracker</h1>
        <div style={styles.userBar}>
          <span style={styles.userName}>{user.displayName || user.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </header>

      <main style={styles.main}>
        <ExpenseForm onCreated={handleCreated} />
        <CategorySummary summary={summary} loading={summaryLoading} />

        <div style={styles.listSection}>
          <ExpenseFilters
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
            categories={uniqueCategories}
          />
          <ExpenseList expenses={expenses} total={total} loading={loading} error={error} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  if (user === undefined) return null;
  if (!user) return <Login />;
  return <Dashboard user={user} />;
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5" },
  header: { background: "#1e40af", padding: "1rem 2rem", boxShadow: "0 2px 4px rgba(0,0,0,.15)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { color: "#fff", fontSize: "1.4rem", fontWeight: 700 },
  userBar: { display: "flex", alignItems: "center", gap: "1rem" },
  userName: { color: "#bfdbfe", fontSize: "0.875rem" },
  logoutBtn: { background: "transparent", border: "1px solid #bfdbfe", color: "#bfdbfe", borderRadius: 6, padding: "0.3rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" },
  main: { maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" },
  listSection: { background: "#fff", padding: "1.25rem", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
};
