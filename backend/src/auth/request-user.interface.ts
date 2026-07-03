import { Role } from 'src/generated/prisma/enums';

export interface RequestWithUser {
  user: {
    sub: string;
    email: string;
    role: Role;
    hasProfile?: boolean;
  };
}
