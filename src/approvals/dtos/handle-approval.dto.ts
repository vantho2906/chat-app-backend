import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';
import { HandleApprovalEnum } from 'etc/enums';

export class HandleApprovalDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  roomId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  approvalId: number;

  @ApiProperty({ enum: HandleApprovalEnum })
  @IsEnum(HandleApprovalEnum)
  decision: HandleApprovalEnum;
}
