import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(createProfileDto: CreateProfileDto, userId: string) {
    const userProfile = await this.prisma.profile.create({
      data: {
        name: createProfileDto.name,
        birthDate: new Date(createProfileDto.birthDate),
        gender: createProfileDto.gender,
        userId,
      },
    });

    return userProfile;
  }
}
