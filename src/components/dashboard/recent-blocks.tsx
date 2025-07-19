"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Block } from '@/types';
import { hexToNumber, formatTimestamp, formatGas, formatAddress } from '@/lib/utils';
import Link from 'next/link';
import { Blocks, Clock, CircleDotDashed, Activity, AlertCircle } from 'lucide-react';

const MAX_BLOCKS = 5;

function ClientFormattedTime({ timestamp }: { timestamp: string }) {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    setFormattedTime(formatTimestamp(timestamp));
  }, [timestamp]);

  return <>{formattedTime || '...'}</>;
}


export function RecentBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [latestBlockNumber, setLatestBlockNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      const response = await fetch('/api/recent-blocks');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blocks');
      }
      const data: { blocks: Block[], latestBlockNumber: number } = await response.json();
      setBlocks(data.blocks);
      setLatestBlockNumber(data.latestBlockNumber);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch recent blocks:", err);
      if (err instanceof Error) {
         if (err.message.includes('RATE_LIMIT_EXCEEDED')) {
          setError("The network is busy. Please try again in a few seconds.");
        } else {
          setError("Could not load recent blocks.");
        }
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks(); // Initial fetch
    const interval = setInterval(fetchBlocks, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchBlocks]);
  
  return (
    <Card>
      <CardHeader className="card-header-3d">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                  <Blocks className="w-6 h-6 text-primary" /> Recent Blocks
                </CardTitle>
                <CardDescription>The last {MAX_BLOCKS} blocks from the MegaETH chain, updated every 15 seconds.</CardDescription>
            </div>
            {latestBlockNumber !== null && !error && (
                <div className="flex items-center gap-2 text-sm font-medium p-2 rounded-md bg-black/20">
                    <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                    <span>Latest Block:</span>
                    <span className="font-bold text-primary">{latestBlockNumber.toLocaleString()}</span>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
           <div className="flex items-center justify-center gap-2 text-destructive py-4">
             <AlertCircle className="w-4 h-4" />
             <p className="text-sm">{error}</p>
           </div>
        )}
        <div className="h-[350px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-black/20 backdrop-blur-sm">
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead>Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !error ? (
                Array.from({ length: MAX_BLOCKS }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    <TableCell><Skeleton className="h-5 w-20 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 bg-white/10" /></TableCell>
                  </TableRow>
                ))
              ) : !error ? (
                blocks.map((block) => (
                  <TableRow key={block.hash} className="border-white/10">
                    <TableCell>
                      <Link href={`https://megaexplorer.xyz/block/${hexToNumber(block.number)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {hexToNumber(block.number)}
                      </Link>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <ClientFormattedTime timestamp={block.timestamp} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <CircleDotDashed className="w-4 h-4 text-muted-foreground" />
                         <span>{formatGas(block.gasUsed)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`https://megaexplorer.xyz/block/${block.hash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline">
                        {formatAddress(block.hash, 12)}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
