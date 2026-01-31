import { Role } from 'generated/prisma/enums';

export interface RequestWithUser {
  user: {
    sub: string;
    email: string;
    role: Role;
  };
}
