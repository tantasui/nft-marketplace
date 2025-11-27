import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { MintNFT } from './MintNFT';
import { Listings } from './Listings';
import { Stats } from './Stats';
import { MyNFTs } from './MyNFTs';

export function Marketplace() {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'mint' | 'my-nfts'>('marketplace');

  return (
    <div className="marketplace">
      <div className="wallet-section">
        <ConnectButton />
        {account && (
          <div className="account-info">
            <p className="address">
              Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {!account && (
        <div className="connect-prompt">
          <h2>👋 Welcome!</h2>
          <p>Connect your wallet to start using the NFT marketplace</p>
        </div>
      )}

      {account && (
        <>
          <Stats />

          <div className="tabs">
            <button
              className={activeTab === 'marketplace' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('marketplace')}
            >
              🛒 Marketplace
            </button>
            <button
              className={activeTab === 'mint' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('mint')}
            >
              ✨ Mint NFT
            </button>
            <button
              className={activeTab === 'my-nfts' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('my-nfts')}
            >
              🖼️ My NFTs
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'marketplace' && <Listings />}
            {activeTab === 'mint' && <MintNFT />}
            {activeTab === 'my-nfts' && <MyNFTs />}
          </div>
        </>
      )}
    </div>
  );
}
