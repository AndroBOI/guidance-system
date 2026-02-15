import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from 'generated/prisma/internal/prismaNamespace';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: { email: dto.email, password: hash },
      });

      const token = await this.signToken(user.id, user.email, user.role, false);

      return {
        access_token: token.access_token,
        user: {
          sub: user.id,
          email: user.email,
          role: user.role,
          hasProfile: false,
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
        throw error;
      }
    }
  }

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new ForbiddenException('User do not exist');
    }

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const hasProfile = !!user.profile;
    const token = await this.signToken(
      user.id,
      user.email,
      user.role,
      hasProfile,
    );

    return {
      access_token: token.access_token,
      user: {
        sub: user.id,
        email: user.email,
        role: user.role,
        hasProfile,
      },
    };
  }

  async signToken(
    userId: string,
    email: string,
    role: 'ADMIN' | 'USER' = 'USER',
    hasProfile: boolean = false,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
      hasProfile,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: secret,
    });

    return {
      access_token: accessToken,
    };
  }

  logout(userId: string) {
    return { message: 'Logged out', user: userId };
  }
}
