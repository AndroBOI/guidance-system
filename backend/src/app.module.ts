import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({}), PrismaModule],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
