import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChatRoomTypeEnum } from 'etc/enum';

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty({ each: true })
  memberIdList: string[];

  @ApiProperty({ enum: ChatRoomTypeEnum, example: ChatRoomTypeEnum.ONE_ON_ONE })
  @IsEnum(ChatRoomTypeEnum)
  @IsNotEmpty()
  type: ChatRoomTypeEnum;
}
