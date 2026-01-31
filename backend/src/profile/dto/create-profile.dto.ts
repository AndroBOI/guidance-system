import {
  IsString,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Gender } from 'generated/prisma/enums';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
