import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

export interface Filters {
  protocol: 'all' | 'TCP' | 'UDP';
  state: 'all' | 'LISTENING' | 'ESTABLISHED' | 'TIME_WAIT' | 'CLOSE_WAIT';
  showSystem: boolean;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  portCount: number;
}

export function FilterBar({ filters, onChange, portCount }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.protocol !== 'all',
    filters.state !== 'all',
    !filters.showSystem,
  ].filter(Boolean).length;

  const FilterButton = ({
    label,
    value,
    current,
    onClick,
  }: {
    label: string;
    value: string;
    current: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        current === value
          ? 'bg-accent text-surface'
          : 'bg-surface-light text-text-muted hover:bg-surface-lighter hover:text-text'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isOpen || activeFiltersCount > 0
            ? 'bg-accent/20 text-accent'
            : 'bg-surface-light text-text-muted hover:bg-surface-lighter hover:text-text'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent text-surface rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 z-20 w-72 p-4 bg-surface-light border border-surface-lighter rounded-xl shadow-xl">
            {/* Protocol Filter */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                Protocolo
              </label>
              <div className="flex gap-2">
                {(['all', 'TCP', 'UDP'] as const).map((proto) => (
                  <FilterButton
                    key={proto}
                    label={proto === 'all' ? 'Todos' : proto}
                    value={proto}
                    current={filters.protocol}
                    onClick={() => onChange({ ...filters, protocol: proto })}
                  />
                ))}
              </div>
            </div>

            {/* State Filter */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                Estado
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: 'all', label: 'Todos' },
                    { value: 'LISTENING', label: 'Listening' },
                    { value: 'ESTABLISHED', label: 'Established' },
                    { value: 'TIME_WAIT', label: 'Time Wait' },
                    { value: 'CLOSE_WAIT', label: 'Close Wait' },
                  ] as const
                ).map((state) => (
                  <FilterButton
                    key={state.value}
                    label={state.label}
                    value={state.value}
                    current={filters.state}
                    onClick={() =>
                      onChange({ ...filters, state: state.value })
                    }
                  />
                ))}
              </div>
            </div>

            {/* System Processes Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    filters.showSystem ? 'bg-accent' : 'bg-surface-lighter'
                  }`}
                  onClick={() =>
                    onChange({ ...filters, showSystem: !filters.showSystem })
                  }
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.showSystem ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-sm text-text group-hover:text-accent transition-colors">
                  Mostrar processos do sistema
                </span>
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-surface-lighter my-3" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">
                {portCount} resultado{portCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() =>
                  onChange({
                    protocol: 'all',
                    state: 'all',
                    showSystem: true,
                  })
                }
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
