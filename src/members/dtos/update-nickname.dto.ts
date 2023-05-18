import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateNickNameDto {
  @ApiProperty()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  targetId: string;

  @ApiProperty()
  nickname: string;
}
