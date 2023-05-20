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
  @Matches(/^[a-zA-Z]+(?:[ ]?[a-zA-Z]*)*$/, {
    message: 'First name only contains alphabet characters and spaces',
  })
  fname: string;

  @ApiProperty({ example: 'Trần Văn' })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+(?:[ ]?[a-zA-Z]*)*$/, {
    message: 'Last name only contains alphabet characters and spaces',
  })
  lname: string;

  @ApiProperty()
  @IsNotEmpty()
  userOTP: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
