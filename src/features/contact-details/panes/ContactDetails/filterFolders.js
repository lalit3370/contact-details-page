// Filters the resolver's folder/row list by the search input.
//
// Keeps a folder when:
//   • its label matches the query, OR
//   • at least one row's field label or string value matches.
// Inside a kept folder, only matching rows survive (unless the folder's own
// label matched — then all rows stay so the folder isn't shown empty-bodied).
//
// Returns `folders` unchanged when the query is empty, and `null` when
// `folders` is `null` (preserves the resolver's loading sentinel).
export function filterFolders(folders, query) {
  if (!folders) return null;
  const q = query.trim().toLowerCase();
  if (!q) return folders;
  return folders
    .map((f) => ({
      ...f,
      rows: f.rows.filter(
        (r) =>
          r.field.label.toLowerCase().includes(q) ||
          (typeof r.value === 'string' && r.value.toLowerCase().includes(q)),
      ),
    }))
    .filter((f) => f.rows.length > 0 || f.label.toLowerCase().includes(q));
}
