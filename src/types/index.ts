export interface Block {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  transactions: string[];
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface Transfer {
  from: string;
  to: string;
  value: string;
  txHash: string;
  tokenAddress: string;
}
