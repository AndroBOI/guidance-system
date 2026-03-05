import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-apppointment.dto';

const TOTAL_SLOTS = 7;

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto, userId: string) {
    const appointmentDate = new Date(dto.date);

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: { not: 'REJECTED' },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'This time slot is already booked. Please choose another.',
      );
    }

    return this.prisma.appointment.create({
      data: {
        title: dto.title,
        concern: dto.concern,
        description: dto.description,
        date: appointmentDate,
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
  }

  async getUserAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookedSlots(dateStr: string): Promise<{ bookedSlots: string[] }> {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'REJECTED' },
      },
      select: { date: true },
    });

    const bookedSlots = appointments.map((a) => {
      const hours = a.date.getHours().toString().padStart(2, '0');
      return `${hours}:00`;
    });

    return { bookedSlots };
  }

  async getFullyBookedDates(
    month: string,
  ): Promise<{ fullyBookedDates: string[] }> {
    const [year, monthNum] = month.split('-').map(Number);

    const start = new Date(year, monthNum - 1, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(year, monthNum, 0);
    end.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { not: 'REJECTED' },
      },
      select: { date: true },
    });
    const countByDay: Record<string, number> = {};
    for (const appt of appointments) {
      const day = appt.date.toISOString().split('T')[0];
      countByDay[day] = (countByDay[day] || 0) + 1;
    }
    const fullyBookedDates = Object.entries(countByDay)
      .filter(([_, count]) => count >= TOTAL_SLOTS)
      .map(([day]) => day);

    return { fullyBookedDates };
  }
}
