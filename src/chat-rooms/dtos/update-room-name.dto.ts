import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateRoomNameDto {
  @ApiProperty()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  name: string;
}
