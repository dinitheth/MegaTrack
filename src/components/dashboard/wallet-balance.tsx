"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { jsonRpcRequest } from '@/lib/rpc';
import { weiToEth } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address."),
});

export function WalletBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedAddress, setCheckedAddress] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { address: '' },
  });
  
  const addressFromForm = form.watch('address');

  async function checkBalance(address: string) {
    setIsLoading(true);
    setError(null);
    setCheckedAddress(address);

    try {
      const hexBalance = await jsonRpcRequest('eth_getBalance', [address, 'latest']);
      setBalance(weiToEth(hexBalance));
    } catch (e: any) {
      setError(e.message);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (checkedAddress) {
      const fetchBalance = () => checkBalance(checkedAddress);
      
      fetchBalance(); // Initial fetch
      intervalId = setInterval(fetchBalance, 15000); // Poll every 15 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkedAddress]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setCheckedAddress(values.address);
  }

  const handleCopy = () => {
    if (!checkedAddress) return;
    navigator.clipboard.writeText(checkedAddress).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader className="card-header-3d">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" /> Wallet Checker
        </CardTitle>
        <CardDescription>Enter a MegaETH address to check its MEGA balance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading && addressFromForm === checkedAddress} className="w-full">
              {isLoading && addressFromForm === checkedAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Check Balance'}
            </Button>
          </form>
        </Form>
        {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {balance !== null && checkedAddress && (
          <div className="mt-6 p-4 rounded-lg bg-black/20">
            <h4 className="font-semibold mb-2">Result:</h4>
            <div className="flex items-center justify-between gap-2">
                <code className="text-sm truncate" title={checkedAddress}>{checkedAddress}</code>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                     </Button>
                     <Link href={`https://megaexplorer.xyz/address/${checkedAddress}`} target="_blank" rel="noopener noreferrer">
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-4 h-4" />
                         </Button>
                     </Link>
                </div>
            </div>
            <div className="mt-4">
                <Badge variant="default" className="text-lg font-bold py-2 px-4 shadow-lg shadow-primary/30">
                    Balance: {balance} MEGA
                </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
