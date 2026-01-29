import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface KillButtonProps {
  pid: number;
  processName: string;
  onKill: (pid: number) => Promise<boolean>;
}

export function KillButton({ pid, processName, onKill }: KillButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleKill = async () => {
    setLoading(true);
    await onKill(pid);
    setLoading(false);
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleKill}
          disabled={loading}
          className="px-2 py-1 bg-danger text-surface text-xs font-medium rounded hover:bg-danger-hover transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-2 py-1 bg-surface-lighter text-text text-xs font-medium rounded hover:bg-surface-light transition-colors disabled:opacity-50"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
      title={`Encerrar ${processName}`}
    >
      <X className="w-4 h-4" />
    </button>
  );
}
