import { NextResponse } from 'next/server';
import type { Block } from '@/types';
import { jsonRpcRequest } from '@/lib/rpc';

const MAX_BLOCKS = 5;

// Simple in-memory cache
let cachedData: { blocks: Block[], latestBlockNumber: number } | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION_MS = 12000; // 12 seconds

export async function GET() {
  const now = Date.now();
  if (now - lastFetchTimestamp < CACHE_DURATION_MS && cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const blockNumberHex = await jsonRpcRequest('eth_blockNumber', []);
    const latestBlockNumber = parseInt(blockNumberHex, 16);

    const blockPromises = [];
    for (let i = 0; i < MAX_BLOCKS; i++) {
        const blockNumHex = `0x${(latestBlockNumber - i).toString(16)}`;
        blockPromises.push(jsonRpcRequest('eth_getBlockByNumber', [blockNumHex, false]));
    }

    const newBlocks = (await Promise.all(blockPromises)).filter(b => b) as Block[];
    
    const dataToCache = { blocks: newBlocks, latestBlockNumber };

    // Update cache
    cachedData = dataToCache;
    lastFetchTimestamp = now;

    return NextResponse.json(dataToCache);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Optional: Add a revalidation constant to have Next.js handle caching
export const revalidate = 15;
