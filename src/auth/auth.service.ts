import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { AccountsService } from '../accounts/accounts.service';
import ChatAppConfig from '../etc/config';
import { ChatRoomTypeEnum } from 'etc/enums';
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
import { ChatRoomsService } from 'chat-rooms/chat-rooms.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly otpService: OtpsService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly googleApiService: GoogleApiService,
    private readonly chatRoomsService: ChatRoomsService,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,
  ) {}

  async getInfoFromGoogle(credential: string) {
    const client = new OAuth2Client(ChatAppConfig.GOOGLE_CLIENT_ID);
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: ChatAppConfig.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      console.log(payload);
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
    if (!account) {
      // const imageUrl = payload.picture;
      // const response = await this.httpService.get(imageUrl).toPromise();
      // const contentType = response.headers['content-type'];
      const newAccount = new Account();
      newAccount.email = email;
      newAccount.fname = payload.given_name;
      newAccount.lname = payload.family_name;
      newAccount.avatarUrl = payload.picture;
      const accountCreate = await this.accountRepository.save(newAccount);
      // create own room
      await this.chatRoomsService.createRoom(
        accountCreate,
        [],
        ChatRoomTypeEnum.OWN,
      );
      const token = this.jwtService.sign({ sub: accountCreate.id });
      return [token, null];
    } else if (!account.isActive) return [null, 'Account is blocked'];
    const token = this.jwtService.sign({ sub: account.id });
    return [token, null];
  }

  async normalLogin(info: NormalLoginDto) {
    const account = await this.accountsService.getByEmail(info.email);
    if (!account || !account.checkIfUnencryptedPasswordIsValid(info.password))
      return [null, 'Account not exist or wrong password!'];
    if (!account.isActive) return [null, 'Account is blocked'];
    const token = this.jwtService.sign({ sub: account.id });
    return [token, null];
  }

  async firstStepOfNormalRegister(info: FirstStepNormalRegisterDto) {
    if (info.password != info.confirmPassword)
      return [null, 'Passwords do not match'];
    const isEmailExist = !!(await this.accountsService.getByEmail(info.email));
    if (isEmailExist) return [null, 'Email existed'];
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
    const accountCreate = this.accountRepository.create({
      email: info.email,
      password: info.password,
      fname: info.fname.trim(),
      lname: info.lname.trim(),
    });
    accountCreate.hashPassword();
    await this.accountRepository.save(accountCreate);
    return [accountCreate, null];
  }

  async changePassword(
    self: Account,
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    const selfWithPassword = await this.accountRepository.findOne({
      where: { id: self.id },
    });
    if (selfWithPassword.password) {
      const isOldPasswordCorrect =
        selfWithPassword.checkIfUnencryptedPasswordIsValid(oldPassword.trim());
      if (!isOldPasswordCorrect) return [null, 'Old password not correct'];
    }
    if (newPassword != confirmNewPassword)
      return [null, 'Confirm password not correct'];
    selfWithPassword.password = newPassword.trim();
    selfWithPassword.hashPassword();
    await this.accountRepository.save(selfWithPassword);
    return [true, null];
  }
}
