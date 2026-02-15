import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    userId: string,
    email: string,
    role: 'ADMIN' | 'USER',
  ) {
    const userProfile = await this.prisma.profile.create({
      data: {
        lastName: createProfileDto.lastName,
        firstName: createProfileDto.firstName,
        middleName: createProfileDto.middleName,
        address: createProfileDto.address,
        phoneNumber: createProfileDto.phoneNumber,
        birthDate: new Date(createProfileDto.birthDate),
        gender: createProfileDto.gender,
        userId,
      },
    });

    const payload = {
      sub: userId,
      email,
      role,
      hasProfile: true,
    };

    const secret = this.config.get<string>('JWT_SECRET');
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: secret,
    });

    return {
      profile: userProfile,
      access_token,
    };
  }

  async checkProfile(userId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    return !!profile;
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return profile;
  }
}
