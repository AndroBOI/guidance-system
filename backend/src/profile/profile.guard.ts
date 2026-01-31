import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { RequestWithUser } from 'src/auth/request-user.interface';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
    });

    if (!profile) {
      throw new ForbiddenException('You must create a profile first');
    }

    return true;
  }
}
