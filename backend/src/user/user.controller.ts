import { Controller, Post } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Post()
  getUser() {
    return { message: '' };
  }
}
