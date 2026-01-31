import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({}), PrismaModule, ProfileModule],
  controllers: [AppController, UserController, ProfileController],
  providers: [AppService, PrismaService, ProfileService],
})
export class AppModule {}
