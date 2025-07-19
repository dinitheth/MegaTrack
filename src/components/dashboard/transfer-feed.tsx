"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Transfer } from '@/types';
import { formatAddress } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ArrowRightLeft, ExternalLink, Loader2, Activity } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  contractAddress: z.string().optional(),
});

const MAX_TRANSFERS = 50;

export function TransferFeed() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAddress, setFilterAddress] = useState<string>('');
  const [totalTransfers, setTotalTransfers] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { contractAddress: '' },
  });

  const fetchTransfers = useCallback(async () => {
    setError(null);
    let url = '/api/erc20-transfers';
    if (filterAddress) {
        url += `?contractAddress=${filterAddress}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch transfers');
        }
        const data: { transfers: Transfer[] } = await response.json();
        
        // Naive merge to avoid duplicates and keep the list fresh
        setTransfers(prev => {
            const existingTxHashes = new Set(prev.map(t => t.txHash));
            const newUniqueTransfers = data.transfers.filter(t => !existingTxHashes.has(t.txHash));
            if (newUniqueTransfers.length > 0) {
              setTotalTransfers(currentTotal => currentTotal + newUniqueTransfers.length);
            }
            return [...newUniqueTransfers, ...prev].slice(0, MAX_TRANSFERS);
        });

    } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch transfers:", err);
    } finally {
        setIsLoading(false);
    }
  }, [filterAddress]);

  useEffect(() => {
    setIsLoading(true);
    setTransfers([]);
    setTotalTransfers(0);
    fetchTransfers(); // Initial fetch
    const interval = setInterval(fetchTransfers, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchTransfers]);
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const newAddress = values.contractAddress || '';
    if (newAddress === filterAddress) return;
    setFilterAddress(newAddress);
    // The useEffect will handle re-fetching
  }

  return (
    <Card>
      <CardHeader className="card-header-3d">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-6 h-6 text-primary" /> ERC-20 Transfer Feed
                </CardTitle>
                <CardDescription>
                  Live feed of recent ERC-20 token transfers. Updates every 15 seconds.
                </CardDescription>
            </div>
             <Badge variant="secondary" className="text-sm">
                <Activity className="w-4 h-4 mr-2 text-green-400 animate-pulse" />
                <span>Recent Transfers: {totalTransfers}</span>
            </Badge>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2 pt-2">
                <FormField
                control={form.control}
                name="contractAddress"
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Token Contract (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="0x... (filter by token address)" {...field} />
                        </FormControl>
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Filter'}
                </Button>
            </form>
        </Form>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 py-4">Error: {error}</p>}
        <div className="h-[400px] overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-black/20 backdrop-blur-sm">
                    <TableRow>
                        <TableHead>Transfer Details</TableHead>
                        <TableHead className="text-right">Transaction</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-white/10">
                                <TableCell><Skeleton className="h-5 w-full bg-white/10" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto bg-white/10" /></TableCell>
                            </TableRow>
                        ))
                    ) : transfers.length > 0 ? (
                        transfers.map((t, i) => (
                            <TableRow key={`${t.txHash}-${i}`} className="border-white/10">
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span>💸</span>
                                        <span><strong className="font-medium text-primary">{t.value}</strong> tokens</span>
                                        <span className="text-muted-foreground">from</span>
                                        <Link href={`https://megaexplorer.xyz/address/${t.from}`} target="_blank" rel="noopener noreferrer" className="font-mono text-accent hover:underline">{formatAddress(t.from, 8)}</Link>
                                        <span className="text-muted-foreground">to</span>
                                        <Link href={`https://megaexplorer.xyz/address/${t.to}`} target="_blank" rel="noopener noreferrer" className="font-mono text-accent hover:underline">{formatAddress(t.to, 8)}</Link>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Token: <Link href={`https://megaexplorer.xyz/address/${t.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:underline">{formatAddress(t.tokenAddress || '', 12)}</Link>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`https://megaexplorer.xyz/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">
                                            {formatAddress(t.txHash, 8)}
                                            <ExternalLink className="w-3 h-3 ml-2"/>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-10">
                                No recent transfers found for this filter. Listening for new ones...
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
