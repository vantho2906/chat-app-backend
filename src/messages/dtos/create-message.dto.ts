import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MessageTypeEnum } from 'etc/enums';

export class CreateMessageDto {
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files: string[];

  @ApiProperty({ enum: MessageTypeEnum })
  @IsNotEmpty()
  type: MessageTypeEnum;

  @ApiProperty()
  @IsNotEmpty()
  roomId: number;

  @ApiPropertyOptional()
  text: string;
}
