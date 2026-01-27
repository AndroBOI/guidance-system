import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(email: string, password: string) {
    const user = await this.prisma.user.create({
      data: { email, password },
    });

    return user;
  }

  async singIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, password },
    });

    return user;
  }
}
