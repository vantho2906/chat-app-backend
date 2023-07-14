import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import ResponseObject from 'etc/response-object';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Account } from 'accounts/entities/account.entity';
import { NormalLoginDto } from './dtos/normal-login-dto';
import { FinalStepNormalRegisterDto } from './dtos/final-step-normal-register-dto';
import { FirstStepNormalRegisterDto } from './dtos/first-step-normal-register-dto';
import CurrentAccount from 'decorators/current-account.decorator';
import { ChangePasswordDto } from './dtos/change-password-dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google-login/:credential')
  @ApiParam({ name: 'credential' })
  async googleLogin(@Param('credential') credential: string) {
    const [account, err] = await this.authService.googleLogin(credential);
    if (err) {
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Login failed',
        null,
        err,
      );
    }
    if (!account) {
      return new ResponseObject(
        HttpStatus.NOT_FOUND,
        'Login failed',
        null,
        'Account not found',
      );
    }
    return new ResponseObject(HttpStatus.OK, 'Login success', account, null);
  }

  @Get('get-info-from-google/:credential')
  @ApiParam({ name: 'credential' })
  async getInfoFromGoogle(@Param('credential') credential: string) {
    const [info, err] = await this.authService.getInfoFromGoogle(credential);
    return new ResponseObject(
      HttpStatus.OK,
      'Get info from google success',
      info,
      null,
    );
  }

  @Post('normal-login')
  @ApiBody({ type: NormalLoginDto, required: true })
  async normalLogin(@Body() info: NormalLoginDto) {
    const [data, err] = await this.authService.normalLogin(info);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Login failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Login success', data, null);
  }

  @Post('first-step-normal-register')
  @ApiBody({ type: FirstStepNormalRegisterDto, required: true })
  async firstStepOfNormalRegister(@Body() info: FirstStepNormalRegisterDto) {
    const [data, err] = await this.authService.firstStepOfNormalRegister(info);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Register failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Pass this step success',
      data,
      null,
    );
  }

  @Post('final-step-normal-register')
  @ApiBody({ type: FinalStepNormalRegisterDto, required: true })
  async finalStepOfNormalRegister(@Body() info: FinalStepNormalRegisterDto) {
    const [data, err] = await this.authService.finalStepOfNormalRegister(info);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Register failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Register success', data, null);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @CurrentAccount() self: Account,
    @Body() { oldPassword, newPassword, confirmNewPassword }: ChangePasswordDto,
  ) {
    const [data, err] = await this.authService.changePassword(
      self,
      oldPassword,
      newPassword,
      confirmNewPassword,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Change password failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Change password success',
      data,
      null,
    );
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async self(@CurrentAccount() account: Account) {
    return account;
  }
}
