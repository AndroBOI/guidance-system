import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
/* eslint-disable @typescript-eslint/no-unsafe-call */
export class AuthDto {
  @IsEmail()
  @MaxLength(60)
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
