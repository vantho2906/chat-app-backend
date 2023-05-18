import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PaginationOptionsDto {
  @ApiProperty({ default: 10, example: 10 })
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @ApiProperty({ default: 1, example: 1 })
  @Type(() => Number)
  @IsNumber()
  page: number;
}
