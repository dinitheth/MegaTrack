"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Gauge, Timer, AlertCircle, Fuel } from 'lucide-react';

type Stats = {
  blockTime: number;
  tps: number;
  avgGasUsed: number;
};

export function NetworkStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    // Don't reset loading state on polls, only on mount
    try {
      const response = await fetch('/api/network-stats');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }
      const data: Stats = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      if (err.message.includes('RATE_LIMIT_EXCEEDED')) {
        setError("The network is busy. Please try again in a few seconds.");
      } else {
        setError('Could not load stats.');
      }
      setStats(null); // Clear old stats on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);

  const StatItem = ({ icon: Icon, label, value, unit, isLoading }: { icon: React.ElementType, label: string, value: string | number | null, unit?: string, isLoading: boolean }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-muted-foreground">{label}</span>
      </div>
      {isLoading ? <Skeleton className="h-6 w-24 bg-white/10" /> : 
        <span className="font-bold text-lg">
          {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </span>
      }
    </div>
  );

  return (
    <Card>
      <CardHeader className="card-header-3d">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Network Stats
        </CardTitle>
        <CardDescription>Live network performance metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
           <div className="flex items-center gap-2 text-destructive pt-2">
             <AlertCircle className="w-4 h-4" />
             <p className="text-sm">{error}</p>
           </div>
        ) : (
          <div className="space-y-4 pt-2">
            <StatItem
              icon={Timer}
              label="Block Time"
              value={stats?.blockTime ?? '...'}
              unit="sec"
              isLoading={isLoading || !stats}
            />
            <StatItem
              icon={Gauge}
              label="Average TPS"
              value={stats?.tps.toFixed(2) ?? '...'}
              isLoading={isLoading || !stats}
            />
            <StatItem
              icon={Fuel}
              label="Avg. Gas Used"
              value={stats?.avgGasUsed.toLocaleString() ?? '...'}
              isLoading={isLoading || !stats}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
