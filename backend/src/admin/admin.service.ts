import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'USER',
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.profile
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : 'No Profile',
      hasProfile: !!user.profile,
      totalAppointments: user._count.appointments,
      createdAt: user.createdAt,
    }));
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashBoardStats() {
    const [totalStudents, totalAppointments, pendingCount, acceptedCount] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'USER' } }),
        this.prisma.appointment.count(),
        this.prisma.appointment.count({ where: { status: 'PENDING' } }),
        this.prisma.appointment.count({ where: { status: 'ACCEPTED' } }),
      ]);

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.prisma.appointment.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: { not: 'REJECTED' },
      },
    });

    return {
      totalStudents,
      totalAppointments,
      pendingAppointments: pendingCount,
      completedAppointments: acceptedCount,
      todayAppointments,
    };
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'ACCEPTED' | 'REJECTED',
    adminId: string,
  ) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        adminId,
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

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: { appointments: true },
        },
        appointments: {
          select: {
            id: true,
            title: true,
            date: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }
}
