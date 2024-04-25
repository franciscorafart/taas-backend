import { IUser } from "../schema/User";

export const usersToResponseUsers = (users: IUser[]) =>
  users.map((u) => userToResponseUser(u));

export const userToResponseUser = (user?: IUser | null) =>
  user
    ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        confirmed: user.confirmed,
        stripeCheckoutSessionId: user.stripeCheckoutSessionId,
        credits: user.credits,
      }
    : null;
