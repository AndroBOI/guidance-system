import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Request } from 'express';
import { ProfileGuard } from './profile.guard';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createProfile(
    @Req() req: RequestWithUser,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return await this.profileService.createProfile(
      createProfileDto,
      req.user.sub,
    );
  }

  @UseGuards(AuthGuard('jwt'), ProfileGuard)
  @Get('dashboard')
  getDashboard() {
    return { message: 'Welcome to your profile dashboard!' };
  }
}
