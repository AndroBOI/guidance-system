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
import { RefreshTokenGuard } from './refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';

interface RequestUser {
  sub: string;
  email: string;
  role: string;
}

export interface RequestUserWithRefreshToken extends RequestUser {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signUp(authDto);
    if (!tokens) throw new ForbiddenException('Signup failed');
    this.setTokenCookies(res, tokens);
    return { message: 'Signed up successfully' };
  }

  @Post('signin')
  async signIn(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(authDto);
    if (!tokens) throw new ForbiddenException('Signup failed');
    this.setTokenCookies(res, tokens);
    return { message: 'Signed in successfully' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: RequestUserWithRefreshToken },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );

    this.setTokenCookies(res, tokens);
    return { message: 'Tokens refreshed successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @Req() req: Request & { user: RequestUserWithRefreshToken },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out sucessfully ' };
  }

  private setTokenCookies(
    res: Response,
    tokens: {
      access_token: string;
      refresh_token: string;
    },
  ) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 1000,
      sameSite: 'lax',
      path: '/',
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    });
  }
}
