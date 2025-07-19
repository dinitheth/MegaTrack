import { NextResponse, type NextRequest } from 'next/server';
import { jsonRpcRequest } from '@/lib/rpc';
import { decodeERC20Transfer, formatTokenAmount, hexToNumber } from '@/lib/utils';
import type { Log, Transfer } from '@/types';

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Simple in-memory cache
let cachedData: { [key: string]: { transfers: Transfer[], timestamp: number } } = {};
const CACHE_DURATION_MS = 8000; // 8 seconds, slightly less than frontend poll

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get('contractAddress');
  const cacheKey = contractAddress || 'all';

  const now = Date.now();
  if (cachedData[cacheKey] && (now - cachedData[cacheKey].timestamp < CACHE_DURATION_MS)) {
    return NextResponse.json({ transfers: cachedData[cacheKey].transfers });
  }

  try {
    const latestBlockHex = await jsonRpcRequest('eth_blockNumber', []);
    const latestBlockNumber = hexToNumber(latestBlockHex);
    
    // Poll the last ~50 blocks for events.
    // Add a buffer of 2 blocks from the latest to prevent "block meta not found" errors.
    const fromBlock = `0x${(latestBlockNumber - 50).toString(16)}`;
    const toBlock = `0x${(latestBlockNumber - 2).toString(16)}`;

    const params: any = [{
      fromBlock: fromBlock,
      toBlock: toBlock,
      topics: [TRANSFER_TOPIC],
    }];

    if (contractAddress && contractAddress.startsWith('0x')) {
      params[0].address = contractAddress;
    }

    const logs: Log[] = await jsonRpcRequest('eth_getLogs', params);

    const transfers: Transfer[] = logs.map(log => {
      const { from, to, value } = decodeERC20Transfer(log);
      return {
        from,
        to,
        value: formatTokenAmount(value),
        txHash: log.transactionHash,
        tokenAddress: log.address
      };
    }).reverse(); // Show newest first
    
    // Update cache
    cachedData[cacheKey] = { transfers, timestamp: now };

    return NextResponse.json({ transfers });
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Optional: Add a revalidation constant to have Next.js handle caching
export const revalidate = 10;
