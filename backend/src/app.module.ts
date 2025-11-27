import { Module } from '@nestjs/common';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [MarketplaceModule],
})
export class AppModule {}
