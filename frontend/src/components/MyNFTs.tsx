import { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID } from '../config/constants';

interface NFT {
  objectId: string;
  content?: {
    fields?: {
      name?: string;
      description?: string;
      url?: string;
      owner?: string;
    };
  };
}

export function MyNFTs() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingPrice, setListingPrice] = useState<{ [key: string]: string }>({});
  const [listingNftId, setListingNftId] = useState<string | null>(null);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();

  useEffect(() => {
    if (account) {
      fetchMyNFTs();
    }
  }, [account]);

  const fetchMyNFTs = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Get all objects owned by the user
      const objects = await client.getOwnedObjects({
        owner: account.address,
        options: {
          showContent: true,
          showType: true,
        },
      });

      // Filter for NFT objects from our package
      const nftObjects = objects.data.filter((obj) => {
        const type = obj.data?.type;
        return type?.includes(`${PACKAGE_ID}::marketplace::NFT`);
      });

      setNfts(nftObjects as any);
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleList = async (nftId: string) => {
    const priceStr = listingPrice[nftId];
    if (!priceStr || parseFloat(priceStr) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setListingNftId(nftId);

    try {
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = Math.floor(parseFloat(priceStr) * 1e9);

      const tx = new Transaction();

      // Call list_nft function
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list_nft`,
        arguments: [tx.object(REGISTRY_ID), tx.object(nftId), tx.pure.u64(priceInMist)],
      });

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log('Listing successful:', result);
            alert(`✅ NFT listed successfully for ${priceStr} SUI!`);

            // Wait for transaction to be indexed
            await client.waitForTransaction({
              digest: result.digest,
            });

            // Refresh NFTs
            await fetchMyNFTs();
            setListingNftId(null);
            setListingPrice((prev) => ({ ...prev, [nftId]: '' }));
          },
          onError: (error) => {
            console.error('Listing failed:', error);
            alert(`❌ Listing failed: ${error.message}`);
            setListingNftId(null);
          },
        }
      );
    } catch (err: any) {
      console.error('Error listing NFT:', err);
      alert(`❌ Error: ${err.message}`);
      setListingNftId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading your NFTs...</div>;
  }

  return (
    <div className="my-nfts">
      <h2>🖼️ My NFTs</h2>

      {nfts.length === 0 ? (
        <div className="empty-state">
          <p>You don't own any NFTs yet</p>
          <p className="hint">Go to the "Mint NFT" tab to create your first NFT!</p>
        </div>
      ) : (
        <div className="nfts-grid">
          {nfts.map((nft) => {
            const fields = nft.content?.fields;
            const nftId = nft.objectId;

            return (
              <div key={nftId} className="nft-card">
                <div className="nft-header">
                  <h3>{fields?.name || 'Unnamed NFT'}</h3>
                </div>

                {fields?.url && (
                  <div className="nft-image">
                    <img src={fields.url} alt={fields.name || 'NFT'} />
                  </div>
                )}

                <div className="nft-info">
                  {fields?.description && (
                    <p className="description">{fields.description}</p>
                  )}

                  <div className="info-row">
                    <span className="label">Token ID:</span>
                    <span className="value">
                      {nftId.slice(0, 6)}...{nftId.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="list-section">
                  <div className="price-input-group">
                    <input
                      type="number"
                      placeholder="Price in SUI"
                      value={listingPrice[nftId] || ''}
                      onChange={(e) =>
                        setListingPrice((prev) => ({
                          ...prev,
                          [nftId]: e.target.value,
                        }))
                      }
                      step="0.1"
                      min="0.01"
                    />
                    <span className="currency">SUI</span>
                  </div>

                  <button
                    onClick={() => handleList(nftId)}
                    className="btn btn-primary"
                    disabled={listingNftId === nftId || !listingPrice[nftId]}
                  >
                    {listingNftId === nftId ? 'Listing...' : 'List for Sale'}
                  </button>
                </div>

                <a
                  href={`https://suiexplorer.com/object/${nftId}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-link"
                >
                  View on Explorer →
                </a>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={fetchMyNFTs} className="btn btn-secondary refresh-btn">
        🔄 Refresh NFTs
      </button>
    </div>
  );
}
