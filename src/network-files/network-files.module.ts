import { Module } from '@nestjs/common';
import { NetworkFilesService } from './network-files.service';
import { NetworkFilesController } from './network-files.controller';

@Module({
  controllers: [NetworkFilesController],
  providers: [NetworkFilesService],
  exports: [NetworkFilesService],
})
export class NetworkFilesModule {}
