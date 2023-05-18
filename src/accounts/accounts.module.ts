import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { GoogleApiModule } from 'google-api/google-api.module';
import { NetworkFile } from 'network-files/entities/networkFile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, NetworkFile]), GoogleApiModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
