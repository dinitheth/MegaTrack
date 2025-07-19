import { NextResponse } from 'next/server';
import { jsonRpcRequest } from '@/lib/rpc';
import { hexToNumber } from '@/lib/utils';
import type { Block } from '@/types';

// Simple in-memory cache
let cachedData: { 
  blockTime: number;
  tps: number;
  avgGasUsed: number;
  timestamp: number; 
} | null = null;
const CACHE_DURATION_MS = 12000; // 12 seconds, less than frontend poll

const BLOCKS_TO_SCAN = 10;

export async function GET() {
  const now = Date.now();
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION_MS)) {
    return NextResponse.json(cachedData);
  }

  try {
    const latestBlockHex = await jsonRpcRequest('eth_blockNumber', []);
    const latestBlockNumber = hexToNumber(latestBlockHex);
    
    // Fetch last `BLOCKS_TO_SCAN` blocks
    const blockPromises: Promise<Block>[] = [];
    // Fetch blocks slightly older than the absolute latest to avoid race conditions on the RPC node
    for (let i = 0; i < BLOCKS_TO_SCAN; i++) {
        const blockNumHex = `0x${(latestBlockNumber - i - 1).toString(16)}`;
        blockPromises.push(jsonRpcRequest('eth_getBlockByNumber', [blockNumHex, false]));
    }
    const blocks: Block[] = (await Promise.all(blockPromises)).filter(b => b);

    if (blocks.length < 2) {
      throw new Error('Not enough blocks to calculate stats');
    }
    
    // 1. Block Time (between the two most recent blocks in our fetched list)
    const latestBlock = blocks[0];
    const previousBlock = blocks[1];
    const blockTime = hexToNumber(latestBlock.timestamp) - hexToNumber(previousBlock.timestamp);

    // 2. Transactions Per Second (TPS) over the scanned blocks
    const firstBlock = blocks[blocks.length - 1];
    const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);
    const timeDifference = hexToNumber(latestBlock.timestamp) - hexToNumber(firstBlock.timestamp);
    const tps = timeDifference > 0 ? totalTransactions / timeDifference : 0;
    
    // 3. Average Gas Used per Block
    const totalGasUsed = blocks.reduce((sum, block) => sum + hexToNumber(block.gasUsed), 0);
    const avgGasUsed = totalGasUsed / blocks.length;

    const dataToCache = {
      blockTime: blockTime > 0 ? blockTime : 1, // Avoid 0 block time
      tps,
      avgGasUsed: Math.round(avgGasUsed),
      timestamp: now,
    };
    
    cachedData = dataToCache;

    return NextResponse.json(dataToCache);
  } catch (error) {
    if (error instanceof Error) {
        console.error("Error in /api/network-stats:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Optional: Add a revalidation constant to have Next.js handle caching
export const revalidate = 15;
