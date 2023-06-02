import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import ResponseObject from 'etc/response-object';
import { HandleApprovalDto } from './dtos/handle-approval.dto';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';

@ApiTags('approvals')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('get-all-approvals/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllApprovals(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const [data, err] = await this.approvalsService.getAllApprovals(
      self,
      roomId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get all approvals failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get all approvals success',
      data,
      err,
    );
  }

  @Post('accept-all-approvals/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async acceptAllApprovals(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const [data, err] = await this.approvalsService.acceptAllApprovals(
      self,
      roomId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Accept all approvals failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Accept all approvals success',
      data,
      null,
    );
  }

  @Post('handle-approval')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async handleApproval(
    @CurrentAccount() self: Account,
    @Body() handleApprovalDto: HandleApprovalDto,
  ) {
    const { roomId, approvalId, decision } = handleApprovalDto;
    const [data, err] = await this.approvalsService.handleApproval(
      self,
      roomId,
      approvalId,
      decision,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Handle approval failed',
        null,
        err,
      );
    if (data == true)
      return new ResponseObject(
        HttpStatus.OK,
        'Decline approval success',
        data,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Accept approval success',
      data,
      null,
    );
  }
}
