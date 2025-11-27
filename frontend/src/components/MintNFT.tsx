import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID } from '../config/constants';

export function MintNFT() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const handleMint = async () => {
    if (!name || !description || !url) {
      setStatus('Please fill in all fields');
      return;
    }

    setStatus('Building transaction...');

    try {
      const tx = new Transaction();

      // Call the mint_nft function
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::mint_nft`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(url),
        ],
      });

      setStatus('Please sign the transaction in your wallet...');

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log('Transaction successful:', result);
            setStatus('✅ NFT minted successfully!');
            setDigest(result.digest);

            // Wait for transaction to be indexed
            await client.waitForTransaction({
              digest: result.digest,
            });

            // Clear form
            setName('');
            setDescription('');
            setUrl('');

            setTimeout(() => {
              setStatus('');
              setDigest('');
            }, 5000);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setStatus(`❌ Error: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error('Error building transaction:', error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="mint-nft">
      <h2>✨ Mint New NFT</h2>
      <p className="description">Create your unique NFT on the Sui blockchain</p>

      <div className="form">
        <div className="form-group">
          <label>NFT Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Awesome NFT"
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT..."
            rows={4}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.png"
          />
          <small>Enter a direct link to your image (JPEG, PNG, GIF)</small>
        </div>

        {url && (
          <div className="image-preview">
            <img src={url} alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        )}

        <button onClick={handleMint} className="btn btn-primary" disabled={!name || !description || !url}>
          Mint NFT
        </button>

        {status && (
          <div className={status.includes('Error') || status.includes('❌') ? 'status error' : 'status success'}>
            {status}
          </div>
        )}

        {digest && (
          <div className="digest">
            <small>
              Transaction:{' '}
              <a
                href={`https://suiexplorer.com/txblock/${digest}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {digest.slice(0, 8)}...{digest.slice(-6)}
              </a>
            </small>
          </div>
        )}
      </div>

      <div className="tips">
        <h3>💡 Tips</h3>
        <ul>
          <li>Make sure your wallet has enough SUI for gas fees</li>
          <li>Use high-quality images for better presentation</li>
          <li>Keep names short and descriptive</li>
          <li>You'll be able to list your NFT for sale after minting</li>
        </ul>
      </div>
    </div>
  );
}
