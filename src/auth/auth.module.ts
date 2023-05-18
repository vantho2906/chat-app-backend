import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import TestNestjsConfig from 'etc/config';
import { AccountsModule } from '../accounts/accounts.module';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { HttpModule } from '@nestjs/axios';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { OtpsModule } from 'otps/otps.module';
import { GoogleApiModule } from 'google-api/google-api.module';

@Module({
  imports: [
    GoogleApiModule,
    OtpsModule,
    HttpModule,
    TypeOrmModule.forFeature([Account, NetworkFile]),
    AccountsModule,
    PassportModule,
    JwtModule.register({
      secret: TestNestjsConfig.JWT_SECRET,
      signOptions: {
        expiresIn: TestNestjsConfig.JWT_EXPIRES_IN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
