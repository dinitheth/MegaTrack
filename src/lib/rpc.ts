// This is a placeholder. The user should provide their own RPC URL.
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://carrot.megaeth.com/rpc';

export async function jsonRpcRequest(method: string, params: any[]) {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
      cache: 'no-store', // Ensure fresh data on each request
    });

    if (!response.ok) {
      // Check for rate limit error specifically
      if (response.status === 429) {
        console.warn(`Rate limit exceeded for method: ${method}.`);
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.code} - ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed JSON-RPC request for ${method}:`, error.message);
      } else {
        console.error(`An unknown error occurred during JSON-RPC request for ${method}.`);
      }
      throw error;
  }
}
