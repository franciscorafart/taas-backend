import User, { IUser } from "../schema/User";
import * as bcrypt from "bcryptjs";
import { UserUpdateAttributes } from "../shared/types";
import { logError } from "../helpers/logger";

export const createUser = async (user: UserUpdateAttributes) => {
  const date = new Date();

  try {
    const newUser = new User({
      email: user.email,
      password: user.encryptedPassword,
      createdAt: date,
      updatedAt: date,
    });
    // save the user
    await newUser.save();

    return newUser;
  } catch (e) {
    logError(`Error creating user ${e}`);
    return null;
  }
};

export const updateUser = async (
  user: IUser,
  updateProps: UserUpdateAttributes
) => {
  const date = new Date();

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id }, //
      {
        $set: {
          email: updateProps.email || user.email,
          firstName: updateProps.firstName || user.firstName,
          lastName: updateProps.lastName || user.lastName,
          updatedAt: date,
          password: updateProps.encryptedPassword || user.password,
          confirmed: updateProps.confirmed || user.confirmed,
          credits: updateProps.credits || user.credits,
          stripeCheckoutSessionId:
            updateProps.stripeCheckoutSessionId || user.stripeCheckoutSessionId,
        },
      },
      { new: true } // To return the updated document
    );

    return updatedUser;
  } catch (error) {
    logError(`Error updating user ${error}`);
    return null;
  }
};

export const findUserById = async (userId: string): Promise<IUser | null> => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    logError(`Error finding user ${error}`);
  }

  return null;
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ email: email });

    return user;
  } catch (error) {
    logError(`Error finding user ${error}`);
  }

  return null;
};

// Password management utilities. TODO: Move them somewhere else
export const genEncryptedPassword = (rawPassword: string) =>
  new Promise<string>((res, rej) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        rej(err);
      }
      bcrypt.hash(rawPassword, salt, function (err, hash) {
        if (err) {
          rej(err);
        }
        res(String(hash));
      });
    });
  });

export const comparePassword = (passw: string, hash: string) =>
  new Promise<boolean>((res, rej) => {
    bcrypt.compare(passw, hash, function (err: any, isMatch: boolean) {
      if (err) {
        rej(err);
      }
      res(isMatch);
    });
  });
