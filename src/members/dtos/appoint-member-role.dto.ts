import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { MemberRoleEnum } from 'etc/enums';

export class AppointMemberRoleDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  roomId: number;

  @ApiProperty()
  targetAcccountId: string;

  @ApiProperty({ enum: MemberRoleEnum })
  roleAppointed: MemberRoleEnum;
}
