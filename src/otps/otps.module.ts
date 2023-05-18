import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { OtpsController } from './otps.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [OtpsController],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
