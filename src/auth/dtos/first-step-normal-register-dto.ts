import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class FirstStepNormalRegisterDto {
  @ApiProperty({
    example: 'thotv.t1.1821@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  confirmPassword: string;
}
