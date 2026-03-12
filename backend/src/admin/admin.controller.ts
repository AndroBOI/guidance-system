import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { AdminService } from './admin.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  verifyAdmin() {
    return { message: 'This is admin route' };
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashBoardStats();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('appointments')
  getAllAppointments() {
    return this.adminService.getAllAppointments();
  }

  @Patch('appointments/:id/status')
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACCEPTED' | 'REJECTED' },
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.updateAppointmentStatus(
      id,
      body.status,
      req.user.sub,
    );
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }
}
