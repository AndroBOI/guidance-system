import { Controller, Post } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Post()
  getUser() {
    return { message: '' };
  }
}
