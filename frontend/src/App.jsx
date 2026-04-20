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
      <header className="et-header">
        <div style={styles.headerInner}>
          <span style={styles.title}>Expense Tracker</span>
          <div style={styles.userBar}>
            <span style={styles.userName}>{user.displayName || user.email}</span>
            <button onClick={logout} className="et-btn-ghost">Sign out</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <ExpenseForm onCreated={handleCreated} />
        <CategorySummary summary={summary} loading={summaryLoading} />

        <div className="et-card" style={styles.listSection}>
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
  page: { minHeight: "100vh" },
  headerInner: { maxWidth: 900, margin: "0 auto", padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#0d0d0d" },
  userBar: { display: "flex", alignItems: "center", gap: "0.875rem" },
  userName: { fontSize: "0.8rem", color: "#9a9a9a" },
  main: { maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" },
  listSection: { padding: "1.25rem" },
};
