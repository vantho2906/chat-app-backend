import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, ValidateIf } from 'class-validator';
import { GenderEnum } from 'etc/enums';

export class UpdateAccountInfoDto {
  @ApiProperty({
    example: 'Van Tho',
  })
  fname: string;

  @ApiProperty({
    example: 'Tran',
  })
  lname: string;

  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE, nullable: true })
  @ValidateIf((object, value) => value != null)
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({ example: new Date('2003-06-29') })
  @ValidateIf((object, value) => value != null)
  @IsDate()
  @Type(() => Date)
  dob: Date;
}
