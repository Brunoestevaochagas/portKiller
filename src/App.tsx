import { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePortData } from './hooks/usePortData';
import { PortTable } from './components/PortTable';
import { SearchBar } from './components/SearchBar';
import { StatusBar } from './components/StatusBar';
import { FilterBar, type Filters } from './components/FilterBar';

const SYSTEM_PROCESSES = ['system', 'svchost.exe', 'lsass.exe', 'services.exe', 'wininit.exe', 'csrss.exe', 'smss.exe'];

function App() {
  const { ports, loading, error, lastUpdate, refresh, killProcess } = usePortData(5000);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    protocol: 'all',
    state: 'all',
    showSystem: true,
  });

  const filteredPorts = useMemo(() => {
    return ports.filter((port) => {
      // Protocol filter
      if (filters.protocol !== 'all' && port.protocol !== filters.protocol) {
        return false;
      }

      // State filter
      if (filters.state !== 'all' && port.state !== filters.state) {
        return false;
      }

      // System processes filter
      if (!filters.showSystem) {
        const processLower = port.processName.toLowerCase();
        if (SYSTEM_PROCESSES.includes(processLower) || port.pid < 100) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          port.localPort.toString().includes(term) ||
          port.processName.toLowerCase().includes(term) ||
          port.localAddress.toLowerCase().includes(term) ||
          port.protocol.toLowerCase().includes(term) ||
          port.state.toLowerCase().includes(term) ||
          port.pid.toString().includes(term)
        );
      }

      return true;
    });
  }, [ports, searchTerm, filters]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh]);

  return (
    <div className="flex flex-col h-screen bg-surface text-text no-select">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-lighter">
        <h1 className="text-lg font-semibold text-text">PortKiller</h1>

        <div className="flex items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            resultCount={filteredPorts.length}
            totalCount={ports.length}
          />

          <FilterBar
            filters={filters}
            onChange={setFilters}
            portCount={filteredPorts.length}
          />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-text-muted hover:text-text hover:bg-surface-light rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar (F5)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <PortTable
          ports={filteredPorts}
          loading={loading}
          onKill={killProcess}
        />
      </main>

      {/* Status bar */}
      <StatusBar
        portCount={filteredPorts.length}
        lastUpdate={lastUpdate}
        error={error}
      />
    </div>
  );
}

export default App;
