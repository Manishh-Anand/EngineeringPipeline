interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function FilterBar({ search, onSearchChange }: FilterBarProps) {
  return (
    <div role="search">
      <label htmlFor="app-search">Search applications</label>
      <input
        id="app-search"
        name="search"
        type="search"
        autoComplete="off"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="e.g. Payments…"
      />
    </div>
  );
}
