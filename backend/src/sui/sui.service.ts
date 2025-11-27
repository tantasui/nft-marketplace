import { Injectable, Logger } from '@nestjs/common';
import { SuiClient, getFullnodeUrl, SuiEvent } from '@mysten/sui/client';

@Injectable()
export class SuiService {
  private readonly logger = new Logger(SuiService.name);
  private client: SuiClient;

  // Contract details from environment
  private packageId: string = process.env.PACKAGE_ID || 'YOUR_PACKAGE_ID';
  private registryId: string = process.env.REGISTRY_ID || 'YOUR_REGISTRY_ID';

  constructor() {
    // Initialize Sui client for testnet
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
    this.logger.log('Sui service initialized for testnet - read-only mode');
  }

  getClient(): SuiClient {
    return this.client;
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
   * Get NFT object details
   */
  async getNFTDetails(nftId: string): Promise<any> {
    try {
      const nft = await this.client.getObject({
        id: nftId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      return nft;
    } catch (error) {
      this.logger.error('Error fetching NFT details:', error);
      throw error;
    }
  }
}
