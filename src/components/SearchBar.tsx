import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-4 h-4 text-text-dim" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search port or process..."
        className="w-64 pl-9 pr-8 py-2 bg-surface-light border border-surface-lighter rounded-lg text-text text-sm placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 text-text-dim hover:text-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {value && (
        <span className="ml-3 text-xs text-text-muted">
          {resultCount} of {totalCount}
        </span>
      )}
    </div>
  );
}
