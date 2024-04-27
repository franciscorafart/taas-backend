import { Document, Schema, model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Roles } from "../shared/enums";

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  confirmed: boolean;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
  stripeCheckoutSessionId: string;
  password: string;
  comparePassword: (
    password: string,
    cb: (err: any, isMatch: boolean) => Promise<void>
  ) => Promise<void>;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  password: { type: String, required: true },
  confirmed: { type: Boolean, required: true, default: false },
  credits: { type: Number, required: false, default: 10 },
  role: { type: Number, required: true, default: Roles.Reader },
  stripeCheckoutSessionId: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

UserSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password") || user.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.method(
  "comparePassword",
  function (
    passw: string,
    cb: (err: any | null, isMatch?: boolean) => Promise<void>
  ): void {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  }
);

const User = model<IUser>("User", UserSchema, "users");

export default User;
