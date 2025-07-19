"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { jsonRpcRequest } from '@/lib/rpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileCode, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address."),
});

type ContractInfo = {
  type: 'contract' | 'eoa';
  size?: number;
  codeSnippet?: string;
};

export function ContractInspector() {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectedAddress, setInspectedAddress] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { address: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setContractInfo(null);
    setInspectedAddress(values.address);

    try {
      const code = await jsonRpcRequest('eth_getCode', [values.address, 'latest']);
      if (code === '0x') {
        setContractInfo({ type: 'eoa' });
      } else {
        const size = (code.length - 2) / 2;
        setContractInfo({
          type: 'contract',
          size: size,
          codeSnippet: `${code.substring(0, 30)}...`,
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="card-header-3d">
        <CardTitle className="flex items-center gap-2">
          <FileCode className="w-6 h-6 text-primary" /> Contract Inspector
        </CardTitle>
        <CardDescription>Enter a contract address to check its bytecode.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Inspect
            </Button>
          </form>
        </Form>
        {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {contractInfo && (
          <div className="mt-6 p-4 rounded-lg bg-black/20">
            <h4 className="font-semibold mb-2">Inspection Result for:</h4>
            <div className="flex items-center justify-between">
                <code className="text-sm truncate">{inspectedAddress}</code>
                 <Link href={`https://megaexplorer.xyz/address/${inspectedAddress}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Explorer
                    </Button>
                </Link>
            </div>
            <div className="mt-4">
                {contractInfo.type === 'eoa' ? (
                    <Badge variant="secondary">✅ EOA (Externally Owned Account), not a contract.</Badge>
                ) : (
                    <div className="space-y-2">
                        <Badge>Smart Contract</Badge>
                        <p className="text-sm"><strong>Bytecode Size:</strong> {contractInfo.size?.toLocaleString()} bytes</p>
                        <p className="text-sm"><strong>Code Snippet:</strong> <code className="break-all">{contractInfo.codeSnippet}</code></p>
                    </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
