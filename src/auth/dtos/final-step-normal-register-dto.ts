import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class FinalStepNormalRegisterDto {
  @ApiProperty({
    example: 'thotv.t1.1821@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Thọ' })
  @IsNotEmpty()
  fname: string;

  @ApiProperty({ example: 'Trần Văn' })
  @IsNotEmpty()
  lname: string;

  @ApiProperty()
  @IsNotEmpty()
  userOTP: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
