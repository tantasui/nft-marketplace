import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SuiService } from '../sui/sui.service';

export interface Listing {
  nftId: string;
  seller: string;
  price: string;
  timestamp?: string;
  name?: string;
  description?: string;
  url?: string;
}

export interface MarketplaceStats {
  totalNftsMinted: number;
  totalNftsListed: number;
  totalSales: number;
  totalVolume: number;
}

@Injectable()
export class MarketplaceService implements OnModuleInit {
  private readonly logger = new Logger(MarketplaceService.name);
  private listings: Map<string, Listing> = new Map();
  private stats: MarketplaceStats = {
    totalNftsMinted: 0,
    totalNftsListed: 0,
    totalSales: 0,
    totalVolume: 0,
  };

  constructor(private readonly suiService: SuiService) {}

  async onModuleInit() {
    // Index events on startup
    await this.indexEvents();

    // Set up periodic event indexing (every 30 seconds)
    setInterval(async () => {
      await this.indexEvents();
    }, 30000);

    this.logger.log('Marketplace service initialized');
  }

  /**
   * Index blockchain events to update local state
   */
  async indexEvents(): Promise<void> {
    try {
      this.logger.log('Indexing blockchain events...');

      // Fetch all event types
      const [mintedEvents, listedEvents, soldEvents, delistedEvents] =
        await Promise.all([
          this.suiService.queryEvents('NFTMinted', 200),
          this.suiService.queryEvents('NFTListed', 200),
          this.suiService.queryEvents('NFTSold', 200),
          this.suiService.queryEvents('NFTDelisted', 200),
        ]);

      // Update stats from minted events
      this.stats.totalNftsMinted = mintedEvents.length;

      // Track sold and delisted NFTs
      const soldNFTs = new Set(
        soldEvents.map((event: any) => event.parsedJson?.nft_id)
      );
      const delistedNFTs = new Set(
        delistedEvents.map((event: any) => event.parsedJson?.nft_id)
      );

      // Update sales stats
      this.stats.totalSales = soldEvents.length;
      this.stats.totalVolume = soldEvents.reduce(
        (sum: number, event: any) =>
          sum + parseInt(event.parsedJson?.price || '0'),
        0
      );

      // Clear existing listings
      this.listings.clear();

      // Build active listings map
      listedEvents.forEach((event: any) => {
        const nftId = event.parsedJson?.nft_id;

        // Skip if sold or delisted
        if (soldNFTs.has(nftId) || delistedNFTs.has(nftId)) {
          return;
        }

        this.listings.set(nftId, {
          nftId,
          seller: event.parsedJson?.seller,
          price: event.parsedJson?.price,
          timestamp: event.timestampMs,
        });
      });

      this.stats.totalNftsListed = this.listings.size;

      this.logger.log(
        `Indexed ${mintedEvents.length} mints, ${this.listings.size} active listings, ${soldEvents.length} sales`
      );
    } catch (error) {
      this.logger.error('Error indexing events:', error);
    }
  }

  /**
   * Get all active listings
   */
  getListings(): Listing[] {
    return Array.from(this.listings.values());
  }

  /**
   * Get a specific listing by NFT ID
   */
  getListing(nftId: string): Listing | undefined {
    return this.listings.get(nftId);
  }

  /**
   * Get marketplace statistics
   */
  getStats(): MarketplaceStats {
    return this.stats;
  }

  /**
   * Get contract configuration for frontend
   */
  getContractConfig() {
    return {
      packageId: this.suiService.getPackageId(),
      registryId: this.suiService.getRegistryId(),
    };
  }
}
