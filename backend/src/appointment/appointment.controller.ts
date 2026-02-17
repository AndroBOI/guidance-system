import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateAppointmentDto } from './dto/create-apppointment.dto';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    hasProfile?: boolean;
  };
}

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.appointmentService.createAppointment(dto, req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyAppointments(@Req() req: RequestWithUser) {
    return this.appointmentService.getUserAppointments(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('booked-slots')
  async getBookedSlots(@Query('date') date: string) {
    return this.appointmentService.getBookedSlots(date);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('fully-booked-dates')
  async getFullyBookedDates(@Query('month') month: string) {
    return this.appointmentService.getFullyBookedDates(month);
  }
}
