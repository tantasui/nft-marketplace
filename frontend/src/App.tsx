import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { networkConfig } from './config/networks';
import { Marketplace } from './components/Marketplace';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <div className="app">
            <header className="app-header">
              <h1>🎨 Sui NFT Marketplace</h1>
              <p className="subtitle">Mint, List, and Trade NFTs on Sui</p>
            </header>
            <Marketplace />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
