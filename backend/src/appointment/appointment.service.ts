import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-apppointment.dto';

const TOTAL_SLOTS = 7;

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto, userId: string) {
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        date: dto.date,
        time: dto.time,
        status: { not: 'REJECTED' },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'This time slot is already booked. Please choose another.',
      );
    }

    try {
      return await this.prisma.appointment.create({
        data: {
          title: dto.title,
          concern: dto.concern,
          description: dto.description,
          date: dto.date,
          time: dto.time,
          userId,
        },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'This time slot is already booked. Please choose another.',
        );
      }
      throw error;
    }
  }

  async getUserAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookedSlots(dateStr: string): Promise<{ bookedSlots: string[] }> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: dateStr,
        status: { not: 'REJECTED' },
      },
      select: {
        time: true,
      },
    });

    const bookedSlots = appointments.map((a) => a.time);

    return { bookedSlots };
  }

  async getFullyBookedDates(
    month: string,
  ): Promise<{ fullyBookedDates: string[] }> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { startsWith: month },
        status: { not: 'REJECTED' },
      },
      select: { date: true },
    });

    const countByDay: Record<string, number> = {};
    for (const appt of appointments) {
      countByDay[appt.date] = (countByDay[appt.date] || 0) + 1;
    }
    const fullyBookedDates = Object.entries(countByDay)
      .filter(([, count]) => count >= TOTAL_SLOTS)
      .map(([day]) => day);

    return { fullyBookedDates };
  }
}
