import { UserRole } from "@scholarbase/shared-types";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
}
