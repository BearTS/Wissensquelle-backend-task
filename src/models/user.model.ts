import IUser from "../interfaces/user";
import mongoose from "../providers/Database";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import Token from "./token.model";
import CryptoJS from "crypto-js";

export interface IUserModel extends Omit<IUser, "_id">, mongoose.Document {
  passwordResetToken: string;
  passwordResetExpires: Date;
  password: string;
  isVerified: boolean;
  verifyHash: string;
  comparePassword: (password: string) => Promise<boolean>;
  createToken: () => object;
}

export const UserSchema = new mongoose.Schema<IUserModel>(
  {
    email: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    verifyHash: { type: String },

    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUserModel>("save", async function (next) {
  const user = this as IUserModel;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    // use crypto-js to encrypt password
    const encryptedPassword = CryptoJS.AES.encrypt(
      user.password,
      process.env.CRYPTO_SECRET
    ).toString();
    user.password = encryptedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const user = this as IUserModel;
  const bytes = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET);
  const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
  return candidatePassword === originalPassword;
};

UserSchema.methods.createToken = function () {
  const user = this as IUserModel;
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 86400, // 1 day
    }
  );

  let expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);

  let _refreshToken = v4();
  const refreshToken = new Token({
    token: _refreshToken,
    user: user._id,
    expiryDate: expiredDate,
  });
  refreshToken.save();
  return {
    accessToken: token,
    refreshToken: {
      token: refreshToken.token,
      expiryDate: refreshToken.expiryDate,
    },
  };
};

const User = mongoose.model<IUserModel>("User", UserSchema);

export default User;
