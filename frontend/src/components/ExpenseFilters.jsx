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
        <span style={styles.labelText}>Category</span>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="et-input" style={{ minWidth: 150 }}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        <span style={styles.labelText}>Sort</span>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="et-input" style={{ minWidth: 150 }}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </label>
    </div>
  );
}

const styles = {
  bar: { display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "flex-end" },
  label: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  labelText: { fontSize: "0.72rem", fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.05em" },
};
