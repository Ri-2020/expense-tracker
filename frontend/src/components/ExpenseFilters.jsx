/**
 * CONTENTS:
 * - ExpenseFilters({ category, onCategoryChange, sort, onSortChange, categories })
 *   Renders category dropdown filter and sort-by-date toggle
 *
 * Props:
 *   category          string   current category filter value ("" = all)
 *   onCategoryChange  fn       called with new category string
 *   sort              string   "date_desc" | ""
 *   onSortChange      fn       called with new sort string
 *   categories        string[] unique categories from loaded expenses
 */

export default function ExpenseFilters({ category, onCategoryChange, sort, onSortChange, categories }) {
  return (
    <div style={styles.bar}>
      <label style={styles.label}>
        Filter by category
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} style={styles.select}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        Sort
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} style={styles.select}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </label>
    </div>
  );
}

const styles = {
  bar: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "flex-end" },
  label: { display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.875rem", fontWeight: 500 },
  select: { padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
};
