import { Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import ResponseObject from 'etc/response-object';

@ApiTags('otps')
@Controller('otps')
export class OtpsController {
  constructor(private readonly otpsService: OtpsService) {}

  @Post('send-otp/:email')
  @ApiParam({ name: 'email', type: 'string', required: true })
  async sendOtp(@Param('email') email: string) {
    const [data, err] = await this.otpsService.sendOtp(email);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Send Otp failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Send Otp success', data, err);
  }
}
