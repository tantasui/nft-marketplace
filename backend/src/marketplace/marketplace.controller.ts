import {
  Controller,
  Get,
  Post,
  Body,
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
   * POST /api/mint
   * Mint a new NFT
   * Body: { name: string, description: string, url: string }
   */
  @Post('mint')
  async mintNFT(
    @Body() body: { name: string; description: string; url: string }
  ) {
    try {
      const { name, description, url } = body;

      // Validate input
      if (!name || !description || !url) {
        throw new HttpException(
          {
            success: false,
            error: 'Missing required fields',
            message: 'name, description, and url are required',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.marketplaceService.mintNFT(
        name,
        description,
        url
      );

      return {
        success: true,
        message: 'NFT minted successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error minting NFT:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to mint NFT',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/buy
   * Buy a listed NFT
   * Body: { nftId: string }
   */
  @Post('buy')
  async buyNFT(@Body() body: { nftId: string }) {
    try {
      const { nftId } = body;

      // Validate input
      if (!nftId) {
        throw new HttpException(
          {
            success: false,
            error: 'Missing required field',
            message: 'nftId is required',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if NFT is listed
      const listing = this.marketplaceService.getListing(nftId);
      if (!listing) {
        throw new HttpException(
          {
            success: false,
            error: 'NFT not listed',
            message: 'This NFT is not currently listed for sale',
          },
          HttpStatus.NOT_FOUND
        );
      }

      const result = await this.marketplaceService.buyNFT(nftId);

      return {
        success: true,
        message: 'NFT purchased successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error buying NFT:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to buy NFT',
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

  /**
   * POST /api/list
   * List an NFT for sale
   * Body: { nftId: string, price: number }
   */
  @Post('list')
  async listNFT(@Body() body: { nftId: string; price: number }) {
    try {
      const { nftId, price } = body;

      // Validate input
      if (!nftId || !price) {
        throw new HttpException(
          {
            success: false,
            error: 'Missing required fields',
            message: 'nftId and price are required',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (price <= 0) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid price',
            message: 'Price must be greater than 0',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.marketplaceService.listNFT(nftId, price);

      return {
        success: true,
        message: 'NFT listed successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error listing NFT:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to list NFT',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
