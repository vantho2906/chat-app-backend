import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { AccountsService } from '../accounts/accounts.service';
import TestNestjsConfig from '../etc/config';
import { SignInWay } from 'etc/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { OtpsService } from 'otps/otps.service';
import { FirstStepNormalRegisterDto } from 'auth/dtos/first-step-normal-register-dto';
import { NormalLoginDto } from './dtos/normal-login-dto';
import { FinalStepNormalRegisterDto } from './dtos/final-step-normal-register-dto';
import { GoogleApiService } from 'google-api/google-api.service';
import { getGoogleDriveUrl } from 'etc/google-drive-url';
@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly otpService: OtpsService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly googleApiService: GoogleApiService,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,
  ) {}

  async getInfoFromGoogle(credential: string) {
    const client = new OAuth2Client(TestNestjsConfig.GOOGLE_CLIENT_ID);
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: TestNestjsConfig.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return [payload, null];
    } catch (err) {
      return [null, err.message];
    }
  }

  async googleLogin(credential: string) {
    // Verify credential
    const [payload, err] = await this.getInfoFromGoogle(credential);
    if (err) {
      return [null, err];
    }
    const email = payload.email;

    // Check database
    const account = await this.accountsService.getByEmail(email);
    if (!account || account.signInWay != SignInWay.GOOGLE) {
      return [null, 'Account not found'];
    }
    if (!account.isActive) return [null, 'Account is blocked'];

    // Sign JWT
    const token = this.jwtService.sign({ sub: account.id });
    return [token, null];
  }

  async googleRegister(credential: string) {
    const [payload, err] = await this.getInfoFromGoogle(credential);
    if (err) {
      return [null, err];
    }
    const email = payload.email;

    const account = await this.accountsService.getByEmail(email);
    if (account) {
      return [null, 'Account existed'];
    }
    const imageUrl = payload.picture;
    const response = await this.httpService.get(imageUrl).toPromise();
    const contentType = response.headers['content-type'];
    const accountCreate = await this.accountRepository.save({
      email,
      signInWay: SignInWay.GOOGLE,
      fname: payload.given_name,
      lname: payload.family_name,
      avatar: {
        mimeType: contentType,
        url: payload.picture,
      },
    });
    return [accountCreate, null];
  }

  async normalLogin(info: NormalLoginDto) {
    const account = await this.accountsService.getByEmail(info.email);
    if (
      !account ||
      account.signInWay != SignInWay.NORMAL ||
      !account.checkIfUnencryptedPasswordIsValid(info.password)
    )
      return [null, 'Account not exist or wrong password!'];
    if (!account.isActive) return [null, 'Account is blocked'];
    const token = this.jwtService.sign({ sub: account.id });
    return [token, null];
  }

  async firstStepOfNormalRegister(info: FirstStepNormalRegisterDto) {
    if (info.password != info.confirmPassword)
      return [null, 'Passwords do not match'];
    if (await this.accountsService.getByEmail(info.email))
      return [null, 'Email existed'];
    this.otpService.sendOtp(info.email);
    return [true, null];
  }

  async finalStepOfNormalRegister(info: FinalStepNormalRegisterDto) {
    const account = await this.accountsService.getByEmail(info.email);
    if (account) return [null, 'Account existed'];
    const isMatchOTP = await this.otpService.confirmOTP(
      info.userOTP,
      info.email,
    );
    if (!isMatchOTP) return [null, 'OTP not match or expired'];
    const avatar = await this.googleApiService.getFileByName(
      info.fname.trim()[0].toUpperCase() + '.png',
    );
    console.log(avatar);
    console.log(info.fname.trim()[0]);
    if (!avatar) return [null, 'File not found'];
    const accountCreate = this.accountRepository.create({
      email: info.email,
      password: info.password,
      signInWay: SignInWay.NORMAL,
      fname: info.fname.trim(),
      lname: info.lname.trim(),
      avatar: {
        filename: avatar.name,
        mimeType: avatar.mimeType,
        url: getGoogleDriveUrl(avatar.id),
      },
    });
    accountCreate.hashPassword();
    await this.accountRepository.save(accountCreate);
    return [accountCreate, null];
  }

  async changePassword(self: Account, newPassword: string) {
    if (self.signInWay == SignInWay.GOOGLE)
      return [null, 'Google login can not change password'];
    const selfWithPassword = await this.accountRepository.findOne({
      where: { id: self.id },
    });
    if (selfWithPassword.checkIfUnencryptedPasswordIsValid(newPassword.trim()))
      return [null, 'Same with old password'];
    selfWithPassword.password = newPassword.trim();
    selfWithPassword.hashPassword();
    await this.accountRepository.save(selfWithPassword);
    return [true, null];
  }
}
