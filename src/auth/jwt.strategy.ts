import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountsService } from '../accounts/accounts.service';
import ChatAppConfig from '../etc/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly accountsService: AccountsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ChatAppConfig.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const accountId = payload.sub;
    const account = await this.accountsService.getById(accountId);
    if (!account || !account.isActive) {
      return null;
    }
    return account;
  }
}
