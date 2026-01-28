import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
/* eslint-disable @typescript-eslint/no-unsafe-call */
export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
