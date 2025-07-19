import { RecentBlocks } from '@/components/dashboard/recent-blocks';
import { WalletBalance } from '@/components/dashboard/wallet-balance';
import { TransferFeed } from '@/components/dashboard/transfer-feed';
import { ContractInspector } from '@/components/dashboard/contract-inspector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { NetworkStats } from '@/components/dashboard/network-stats';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-y-auto">
      <div className="absolute inset-0 w-full h-full bg-radial-gradient(circle at top left, #2d1fad, #6644e0) opacity-30"></div>
      
      <div className="w-full max-w-7xl glass-card p-6 md:p-8 z-10">
        <header className="pb-6 mb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-shadow-glow">
              MegaTrack
            </h1>
            <p className="text-muted-foreground mt-2">
              An on-chain dashboard for the MegaETH Testnet.
            </p>
          </div>
        </header>

        <main className="grid gap-8 grid-cols-1 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-8">
            <RecentBlocks />
            <TransferFeed />
          </div>
          <div className="xl:col-span-1 space-y-8">
            <WalletBalance />
            <NetworkStats />
            <Alert className="bg-white/5 border-white/10">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                ⚠️ Please note that all blockchain data is public. Your wallet’s
                private key is never exposed through this app.
              </AlertDescription>
            </Alert>
            <ContractInspector />
          </div>
        </main>
        
        <footer className="text-center p-4 mt-8 border-t border-white/10 text-sm text-muted-foreground">
          Built for the MegaETH ecosystem.
        </footer>
      </div>
    </div>
  );
}
