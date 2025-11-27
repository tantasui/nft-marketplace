import { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, BACKEND_URL } from '../config/constants';

interface Listing {
  nftId: string;
  seller: string;
  price: string;
  timestamp?: string;
}

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyingNftId, setBuyingNftId] = useState<string | null>(null);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/listings`);
      const data = await response.json();

      if (data.success) {
        setListings(data.data.listings);
        setError('');
      } else {
        setError('Failed to fetch listings');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (nftId: string, price: string) => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    setBuyingNftId(nftId);

    try {
      // Get user's coins
      const coins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });

      if (coins.data.length === 0) {
        setError('No SUI coins available in your wallet');
        setBuyingNftId(null);
        return;
      }

      // Find a coin with sufficient balance
      const priceNumber = parseInt(price);
      const coin = coins.data.find((c) => parseInt(c.balance) >= priceNumber);

      if (!coin) {
        setError(`Insufficient balance. Need ${priceNumber / 1e9} SUI`);
        setBuyingNftId(null);
        return;
      }

      const tx = new Transaction();

      // Split coin for exact payment
      const [paymentCoin] = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(priceNumber)]);

      // Call buy_nft function
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::buy_nft`,
        arguments: [tx.object(REGISTRY_ID), tx.object(nftId), paymentCoin],
      });

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log('Purchase successful:', result);
            alert('✅ NFT purchased successfully!');

            // Wait for transaction to be indexed
            await client.waitForTransaction({
              digest: result.digest,
            });

            // Refresh listings
            await fetchListings();
            setBuyingNftId(null);
          },
          onError: (error) => {
            console.error('Purchase failed:', error);
            setError(`Purchase failed: ${error.message}`);
            setBuyingNftId(null);
          },
        }
      );
    } catch (err: any) {
      console.error('Error buying NFT:', err);
      setError(`Error: ${err.message}`);
      setBuyingNftId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading listings...</div>;
  }

  return (
    <div className="listings">
      <h2>🛒 NFT Marketplace</h2>

      {error && <div className="error-message">{error}</div>}

      {listings.length === 0 ? (
        <div className="empty-state">
          <p>No NFTs listed for sale yet</p>
          <p className="hint">Mint an NFT and list it to see it here!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.nftId} className="listing-card">
              <div className="listing-header">
                <h3>NFT</h3>
                <span className="nft-id">
                  {listing.nftId.slice(0, 6)}...{listing.nftId.slice(-4)}
                </span>
              </div>

              <div className="listing-info">
                <div className="info-row">
                  <span className="label">Price:</span>
                  <span className="value price">{parseInt(listing.price) / 1e9} SUI</span>
                </div>

                <div className="info-row">
                  <span className="label">Seller:</span>
                  <span className="value address">
                    {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                  </span>
                </div>

                {listing.timestamp && (
                  <div className="info-row">
                    <span className="label">Listed:</span>
                    <span className="value">{new Date(parseInt(listing.timestamp)).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="listing-actions">
                {account?.address === listing.seller ? (
                  <button className="btn btn-secondary" disabled>
                    Your Listing
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(listing.nftId, listing.price)}
                    className="btn btn-primary"
                    disabled={buyingNftId === listing.nftId}
                  >
                    {buyingNftId === listing.nftId ? 'Buying...' : 'Buy NFT'}
                  </button>
                )}

                <a
                  href={`https://suiexplorer.com/object/${listing.nftId}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-link"
                >
                  View on Explorer →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchListings} className="btn btn-secondary refresh-btn">
        🔄 Refresh Listings
      </button>
    </div>
  );
}
