/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  APPOINTMENT_ACCEPTED = 'APPOINTMENT_ACCEPTED',
  APPOINTMENT_REJECTED = 'APPOINTMENT_REJECTED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.APPOINTMENT_ACCEPTED,
    description: 'Type of notification',
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    example: 'Appointment Accepted',
    description: 'Notification title',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'Your appointment has been accepted by the admin',
    description: 'Notification message',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    example: 'user-123',
    description: 'User ID (optional, will use current user if not provided)',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
