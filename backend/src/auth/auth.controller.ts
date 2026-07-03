import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

interface RequestUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signUp(authDto);
    if (!result) throw new ForbiddenException('Signup failed');

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Signed up successfully',
      user: result.user,
    };
  }

  @Post('signin')
  async signIn(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(authDto);
    if (!result) throw new ForbiddenException('Signin failed');

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Signed in successfully',
      user: result.user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(
    @Req() req: Request & { user: RequestUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.logout(req.user.sub);
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
