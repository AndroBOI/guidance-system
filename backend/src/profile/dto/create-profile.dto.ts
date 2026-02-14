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
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  middleName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s,.\-#]+$/, {
    message:
      'Address can only contain letters, numbers, spaces, commas, dots, hyphens, and #',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Phone number must be 7-15 digits, optional leading +',
  })
  phoneNumber: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
