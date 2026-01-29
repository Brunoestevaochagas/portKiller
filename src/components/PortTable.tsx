import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { KillButton } from './KillButton';
import type { PortInfo } from '../types/port';

interface PortTableProps {
  ports: PortInfo[];
  loading: boolean;
  onKill: (pid: number) => Promise<boolean>;
}

type SortKey = 'protocol' | 'localPort' | 'localAddress' | 'state' | 'processName' | 'pid';
type SortDirection = 'asc' | 'desc';

export function PortTable({ ports, loading, onKill }: PortTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('localPort');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const sortedPorts = useMemo(() => {
    return [...ports].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ports, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const HeaderCell = ({ column, label, className = '' }: { column: SortKey; label: string; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors select-none ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon column={column} />
      </div>
    </th>
  );

  if (loading && ports.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="animate-pulse">Loading ports...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full">
        <thead className="bg-surface sticky top-0">
          <tr className="border-b border-surface-lighter">
            <HeaderCell column="protocol" label="Proto" className="w-20" />
            <HeaderCell column="localPort" label="Port" className="w-24" />
            <HeaderCell column="localAddress" label="Address" />
            <HeaderCell column="state" label="State" className="w-32" />
            <HeaderCell column="processName" label="Process" />
            <HeaderCell column="pid" label="PID" className="w-24" />
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-20">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPorts.map((port, index) => (
            <tr
              key={`${port.protocol}-${port.localAddress}-${port.localPort}-${index}`}
              className="border-b border-surface-light hover:bg-surface-light/50 transition-colors"
            >
              <td className="px-4 py-2 text-sm">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    port.protocol === 'TCP'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-warning/20 text-warning'
                  }`}
                >
                  {port.protocol}
                </span>
              </td>
              <td className="px-4 py-2 text-sm font-mono text-text">
                {port.localPort}
              </td>
              <td className="px-4 py-2 text-sm font-mono text-text-muted">
                {port.localAddress}
              </td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`text-xs ${
                    port.state === 'LISTENING'
                      ? 'text-success'
                      : port.state === 'ESTABLISHED'
                      ? 'text-accent'
                      : 'text-text-dim'
                  }`}
                >
                  {port.state || '-'}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-text truncate max-w-[200px]" title={port.processName}>
                {port.processName}
              </td>
              <td className="px-4 py-2 text-sm font-mono text-text-muted">
                {port.pid}
              </td>
              <td className="px-4 py-2">
                {port.pid > 0 && (
                  <KillButton
                    pid={port.pid}
                    processName={port.processName}
                    onKill={onKill}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedPorts.length === 0 && (
        <div className="flex items-center justify-center py-12 text-text-muted">
          No ports found
        </div>
      )}
    </div>
  );
}
