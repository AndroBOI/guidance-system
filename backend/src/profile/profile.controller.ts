import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Request, Response } from 'express';
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
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.profileService.createProfile(
      createProfileDto,
      req.user.sub,
      req.user.email,
      req.user.role as 'ADMIN' | 'USER',
    );

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Profile created sucessfully',
      profile: result.profile,
    };
  }

  @UseGuards(AuthGuard('jwt'), ProfileGuard)
  @Get('dashboard')
  getDashboard(@Req() req: RequestWithUser) {
    return {
      message: 'Welcome to your profile dashboard!',
      user: req.user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async checkProfile(@Req() req: RequestWithUser) {
    const hasProfile = await this.profileService.getProfile(req.user.sub);
    return { hasProfile };
  }
}
