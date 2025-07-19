
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length = 8): string {
  if (!address || typeof address !== 'string' || address.length < 10) return "";
  const start = address.substring(0, 2 + Math.ceil(length / 2));
  const end = address.substring(address.length - Math.floor(length / 2));
  return `${start}...${end}`;
}

export function hexToNumber(hex: string): number {
  if (!hex) return 0;
  return parseInt(hex, 16);
}

export function formatTimestamp(hexTimestamp: string): string {
  if (!hexTimestamp) return 'N/A';
  const unixTimestamp = hexToNumber(hexTimestamp);
  if(isNaN(unixTimestamp) || unixTimestamp === 0) return 'Invalid Date';
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  
  return date.toLocaleString();
}

export function formatGas(hexGas: string): string {
    if (!hexGas) return '0';
    const gas = hexToNumber(hexGas);
    return gas.toLocaleString();
}

export function weiToEth(wei: string): string {
  if (!wei || wei === '0x0') return '0.0000';
  try {
    const weiBigInt = BigInt(wei);
    const ethValue = Number(weiBigInt * 10000n / (10n ** 18n)) / 10000;
    return ethValue.toFixed(4);
  } catch (e) {
    console.error("Error converting wei to eth:", e);
    return '0.0000';
  }
}

export function decodeERC20Transfer(log: {topics: string[], data: string}): { from: string, to: string, value: bigint } {
    const from = `0x${log.topics[1].slice(26)}`;
    const to = `0x${log.topics[2].slice(26)}`;
    // Handle cases where a value of 0 is returned as '0x' instead of '0x0'
    const value = log.data === '0x' ? 0n : BigInt(log.data);
    return { from, to, value };
}

export function formatTokenAmount(amount: bigint, decimals = 18): string {
    if (typeof amount !== 'bigint') return '0.0';
    try {
        const divisor = 10n ** BigInt(decimals);
        const integerPart = amount / divisor;
        const fractionalPart = amount % divisor;
        
        if (fractionalPart === 0n) {
            return integerPart.toString();
        }
        
        const fractionalString = fractionalPart.toString().padStart(decimals, '0');
        // Get up to 4 decimal places, removing trailing zeros
        const displayFractional = fractionalString.slice(0, 4).replace(/0+$/, '') || '0';

        return `${integerPart}.${displayFractional}`;
    } catch (e) {
        return '---';
    }
}
