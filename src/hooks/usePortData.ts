import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PortInfo } from '../types/port';

export function usePortData(refreshInterval: number = 5000) {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPorts = useCallback(async () => {
    try {
      const data = await invoke<PortInfo[]>('get_ports');
      setPorts(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  }, []);

  const killProcess = useCallback(async (pid: number): Promise<boolean> => {
    try {
      await invoke('kill_process', { pid });
      await fetchPorts();
      return true;
    } catch (e) {
      setError(e as string);
      return false;
    }
  }, [fetchPorts]);

  useEffect(() => {
    fetchPorts();
    const interval = setInterval(fetchPorts, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPorts, refreshInterval]);

  return { ports, loading, error, lastUpdate, refresh: fetchPorts, killProcess };
}
