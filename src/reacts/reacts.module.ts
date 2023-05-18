import { Module } from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';

@Module({
  controllers: [ReactsController],
  providers: [ReactsService]
})
export class ReactsModule {}
