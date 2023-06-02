import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class FinalStepNormalRegisterDto {
  @ApiProperty({
    example: 'thotv.t1.1821@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Thọ' })
  @IsNotEmpty()
  @Matches(/^([^0-9]*)$/, {
    message: 'First name only contains alphabet characters and spaces',
  })
  @Length(30)
  fname: string;

  @ApiProperty({ example: 'Trần Văn' })
  @IsNotEmpty()
  @Matches(/^([^0-9]*)$/, {
    message: 'Last name only contains alphabet characters and spaces',
  })
  @Length(30)
  lname: string;

  @ApiProperty()
  @IsNotEmpty()
  userOTP: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
