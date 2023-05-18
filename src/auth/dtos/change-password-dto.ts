import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'tho123',
  })
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;
}
