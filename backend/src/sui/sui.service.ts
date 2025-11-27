import { Injectable, Logger } from '@nestjs/common';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiEvent } from '@mysten/sui.js/client';

@Injectable()
export class SuiService {
  private readonly logger = new Logger(SuiService.name);
  private client: SuiClient;
  private keypair: Ed25519Keypair;

  // Replace these with your deployed contract details
  private packageId: string = process.env.PACKAGE_ID || 'YOUR_PACKAGE_ID';
  private registryId: string = process.env.REGISTRY_ID || 'YOUR_REGISTRY_ID';

  constructor() {
    // Initialize Sui client for testnet
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') });

    // Initialize keypair from environment or create a new one
    // In production, use a secure key management system
    if (process.env.PRIVATE_KEY) {
      const privateKeyArray = Uint8Array.from(
        Buffer.from(process.env.PRIVATE_KEY, 'hex')
      );
      this.keypair = Ed25519Keypair.fromSecretKey(privateKeyArray);
    } else {
      this.keypair = new Ed25519Keypair();
      this.logger.warn(
        'No private key found, generated new keypair for testing'
      );
      this.logger.warn(
        `Address: ${this.keypair.getPublicKey().toSuiAddress()}`
      );
    }
  }

  getClient(): SuiClient {
    return this.client;
  }

  getAddress(): string {
    return this.keypair.getPublicKey().toSuiAddress();
  }

  getPackageId(): string {
    return this.packageId;
  }

  getRegistryId(): string {
    return this.registryId;
  }

  setPackageId(packageId: string) {
    this.packageId = packageId;
  }

  setRegistryId(registryId: string) {
    this.registryId = registryId;
  }

  /**
   * Mint a new NFT
   */
  async mintNFT(
    name: string,
    description: string,
    url: string
  ): Promise<any> {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::marketplace::mint_nft`,
        arguments: [
          tx.object(this.registryId),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(url),
        ],
      });

      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.keypair,
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      this.logger.log(`NFT minted successfully: ${result.digest}`);
      return result;
    } catch (error) {
      this.logger.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * List an NFT for sale
   */
  async listNFT(nftId: string, price: number): Promise<any> {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::marketplace::list_nft`,
        arguments: [
          tx.object(this.registryId),
          tx.object(nftId),
          tx.pure.u64(price),
        ],
      });

      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.keypair,
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      this.logger.log(`NFT listed successfully: ${result.digest}`);
      return result;
    } catch (error) {
      this.logger.error('Error listing NFT:', error);
      throw error;
    }
  }

  /**
   * Buy a listed NFT
   */
  async buyNFT(nftId: string, price: number, coinId: string): Promise<any> {
    try {
      const tx = new TransactionBlock();

      // Split coin for exact payment
      const [coin] = tx.splitCoins(tx.object(coinId), [tx.pure.u64(price)]);

      tx.moveCall({
        target: `${this.packageId}::marketplace::buy_nft`,
        arguments: [tx.object(this.registryId), tx.object(nftId), coin],
      });

      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.keypair,
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      this.logger.log(`NFT purchased successfully: ${result.digest}`);
      return result;
    } catch (error) {
      this.logger.error('Error buying NFT:', error);
      throw error;
    }
  }

  /**
   * Get marketplace registry stats
   */
  async getRegistryStats(): Promise<any> {
    try {
      const registry = await this.client.getObject({
        id: this.registryId,
        options: {
          showContent: true,
        },
      });

      return registry;
    } catch (error) {
      this.logger.error('Error fetching registry stats:', error);
      throw error;
    }
  }

  /**
   * Query events by type
   */
  async queryEvents(
    eventType: string,
    limit: number = 50
  ): Promise<SuiEvent[]> {
    try {
      const events = await this.client.queryEvents({
        query: { MoveEventType: `${this.packageId}::marketplace::${eventType}` },
        limit,
        order: 'descending',
      });

      return events.data;
    } catch (error) {
      this.logger.error(`Error querying events ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Get all NFT listings from events
   */
  async getListings(): Promise<any[]> {
    try {
      const listedEvents = await this.queryEvents('NFTListed', 100);
      const soldEvents = await this.queryEvents('NFTSold', 100);
      const delistedEvents = await this.queryEvents('NFTDelisted', 100);

      // Create a map of sold and delisted NFT IDs
      const soldNFTs = new Set(
        soldEvents.map((event: any) => event.parsedJson?.nft_id)
      );
      const delistedNFTs = new Set(
        delistedEvents.map((event: any) => event.parsedJson?.nft_id)
      );

      // Filter out sold and delisted NFTs
      const activeListings = listedEvents
        .filter((event: any) => {
          const nftId = event.parsedJson?.nft_id;
          return !soldNFTs.has(nftId) && !delistedNFTs.has(nftId);
        })
        .map((event: any) => ({
          nftId: event.parsedJson?.nft_id,
          seller: event.parsedJson?.seller,
          price: event.parsedJson?.price,
          timestamp: event.timestampMs,
        }));

      return activeListings;
    } catch (error) {
      this.logger.error('Error fetching listings:', error);
      throw error;
    }
  }

  /**
   * Get user's SUI coins
   */
  async getUserCoins(address?: string): Promise<any[]> {
    try {
      const userAddress = address || this.getAddress();
      const coins = await this.client.getCoins({
        owner: userAddress,
        coinType: '0x2::sui::SUI',
      });

      return coins.data;
    } catch (error) {
      this.logger.error('Error fetching user coins:', error);
      throw error;
    }
  }
}
