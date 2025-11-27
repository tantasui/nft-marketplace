import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Enable CORS for frontend access
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 NFT Marketplace Backend running on http://localhost:${port}`);
  logger.log(`📊 API Endpoints:`);
  logger.log(`   GET  /api/listings - Get all NFT listings`);
  logger.log(`   GET  /api/listings/:nftId - Get specific listing`);
  logger.log(`   GET  /api/stats - Get marketplace statistics`);
  logger.log(`   POST /api/mint - Mint a new NFT`);
  logger.log(`   POST /api/buy - Buy an NFT`);
  logger.log(`   POST /api/list - List an NFT for sale`);
  logger.log(`\n⚠️  Make sure to set PACKAGE_ID and REGISTRY_ID environment variables`);
}

bootstrap();
