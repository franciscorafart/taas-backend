import { Roles } from "./enums";

export type UserUpdateAttributes = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Roles;
  createdAt?: string;
  updatedAt?: string;
  encryptedPassword?: string;
  confirmed?: boolean;
  credits?: number;
  stripeCheckoutSessionId?: string;
};
