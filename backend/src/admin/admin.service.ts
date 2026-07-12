import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/dto/create-notification.dto';
import { format } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

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
    const [totalStudents, totalAppointments, pendingCount, completedCount] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'USER' } }),
        this.prisma.appointment.count(),
        this.prisma.appointment.count({ where: { status: 'PENDING' } }),
        this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      ]);

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const todayAppointments = await this.prisma.appointment.count({
      where: {
        date: todayStr,
        status: { not: 'REJECTED' },
      },
    });

    return {
      totalStudents,
      totalAppointments,
      pendingAppointments: pendingCount,
      completedAppointments: completedCount,
      todayAppointments,
    };
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED',
    adminId: string,
  ) {
    // Fetch current status before updating
    const existing = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { status: true },
    });

    if (!existing) {
      throw new BadRequestException('Appointment not found');
    }

    // Enforce valid transition rules
    const current = existing.status;
    if (current === 'REJECTED' || current === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot change status of a ${current.toLowerCase()} appointment`,
      );
    }
    if (current === 'PENDING' && status === 'COMPLETED') {
      throw new BadRequestException(
        'Appointment must be accepted before it can be marked as completed',
      );
    }

    const appointment = await this.prisma.appointment.update({
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

    const [year, month, day] = appointment.date.split('-').map(Number);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    const appointmentDate = format(dateObj, 'MMMM d, yyyy');
    const appointmentTime = format(dateObj, 'h:mm a');

    let notifType: NotificationType;
    let title: string;
    let message: string;

    if (status === 'ACCEPTED') {
      notifType = NotificationType.APPOINTMENT_ACCEPTED;
      title = 'Appointment Accepted';
      message = `Your appointment "${appointment.title}" has been accepted for ${appointmentDate} at ${appointmentTime}`;
    } else if (status === 'REJECTED') {
      notifType = NotificationType.APPOINTMENT_REJECTED;
      title = 'Appointment Rejected';
      message = `Your appointment "${appointment.title}" was not approved`;
    } else {
      notifType = NotificationType.APPOINTMENT_COMPLETED;
      title = 'Appointment Completed';
      message = `Your appointment "${appointment.title}" on ${appointmentDate} at ${appointmentTime} has been marked as completed`;
    }

    await this.notificationService.create(
      appointment.userId,
      notifType,
      title,
      message,
    );

    return appointment;
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
