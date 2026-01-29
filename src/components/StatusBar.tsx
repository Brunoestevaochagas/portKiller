import { AlertCircle } from 'lucide-react';

interface StatusBarProps {
  portCount: number;
  lastUpdate: Date | null;
  error: string | null;
}

export function StatusBar({ portCount, lastUpdate, error }: StatusBarProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-surface border-t border-surface-lighter text-xs">
      <div className="flex items-center gap-4">
        <span className="text-text-muted">
          {portCount} porta{portCount !== 1 ? 's' : ''}
        </span>
        {lastUpdate && (
          <span className="text-text-dim">
            Atualizado: {formatTime(lastUpdate)}
          </span>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-danger">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
