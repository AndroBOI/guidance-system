import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';

enum Concern {
  ACADEMIC = 'ACADEMIC',
  PERSONAL = 'PERSONAL',
  HEALTH = 'HEALTH',
  CAREER = 'CAREER',
  OTHER = 'OTHER',
}

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be 100 characters or less' })
  title!: string;

  @IsEnum(Concern, { message: 'Please select a valid concern' })
  @IsNotEmpty({ message: 'Concern is required' })
  concern!: Concern;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must be 500 characters or less' })
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Date is required' })
  date!: string;

  @IsString()
  @IsNotEmpty({ message: 'Time is required' })
  time!: string;
}
