import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { SuiService } from '../sui/sui.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, SuiService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
