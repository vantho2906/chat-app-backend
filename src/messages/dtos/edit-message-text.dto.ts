import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EditMessageTextDto {
  @ApiProperty()
  @IsNumber()
  msgId: number;

  @ApiPropertyOptional()
  text: string;
}
