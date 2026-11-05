import { Module } from '@nestjs/common';
import { CryptoController } from './crypto/crypto.controller';
import { CryptoService } from './crypto/crypto.service';

@Module({
  controllers: [CryptoController],
  providers: [{ provide: CryptoService, useFactory: () => new CryptoService() }],
})
export class AppModule {}
