import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('api')
export class MarketplaceController {
  private readonly logger = new Logger(MarketplaceController.name);

  constructor(private readonly marketplaceService: MarketplaceService) {}

  /**
   * GET /api/listings
   * Get all active NFT listings
   */
  @Get('listings')
  async getListings() {
    try {
      const listings = this.marketplaceService.getListings();
      const stats = this.marketplaceService.getStats();

      return {
        success: true,
        data: {
          listings,
          stats,
          count: listings.length,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching listings:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch listings',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/listings/:nftId
   * Get a specific listing by NFT ID
   */
  @Get('listings/:nftId')
  async getListing(@Param('nftId') nftId: string) {
    try {
      const listing = this.marketplaceService.getListing(nftId);

      if (!listing) {
        throw new HttpException(
          {
            success: false,
            error: 'Listing not found',
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: listing,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error fetching listing:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch listing',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/config
   * Get contract configuration for frontend
   */
  @Get('config')
  async getConfig() {
    try {
      const config = this.marketplaceService.getContractConfig();

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      this.logger.error('Error fetching config:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch config',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/stats
   * Get marketplace statistics
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = this.marketplaceService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Error fetching stats:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch stats',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
