import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChatRoomTypeEnum } from 'etc/enums';

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty({ each: true })
  memberIdList: string[];

  @ApiProperty({
    enum: ChatRoomTypeEnum,
    example: ChatRoomTypeEnum.ONE_ON_ONE,
    type: 'enum',
  })
  @IsEnum(ChatRoomTypeEnum)
  @IsNotEmpty()
  type: ChatRoomTypeEnum;
}
