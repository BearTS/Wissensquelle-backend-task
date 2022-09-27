import { Request, Response, text } from "express";
import { v4 } from "uuid";
import User, { IUserModel } from "../../models/user.model";
import Token from "../../models/token.model";
import { sendEmail } from "../../services/sendEmail";
import Log from "../../middlewares/Log";
class Login {
  public static async login(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    try {
      const { email, password, role } = req.body;
      // find by role and id
      const user: IUserModel = await User.findOne({ email });
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (user.role !== role) {
        return res.status(400).send("Invalid role");
      }
      if (!user.isVerified) {
        return res.status(400).send("User not verified");
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).send("Invalid credentials");
      }
      const token = await user.createToken();
      return res.status(200).json({
        message: "Logged in",
        token,
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }
  public static async sendForgotPassword(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    try {
      const { email, role } = req.body;
      const user: IUserModel = await User.findOne({ email, role });
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (!user.isVerified) {
        return res.status(400).send("User not verified");
      }
      const token = v4();
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();
      const subject = "Reset Password";
      const text = `Click me to reset your password\nid: ${user._id}\nhash: ${token}`;
      await sendEmail(user.email, subject, text);
      return res.status(200).json({
        message: "Email sent",
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }
  public static async resetPassword(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    try {
      const { id, hash } = req.params;
      const { password } = req.body;
      const user: IUserModel = await User.findById(id)
      console.log(user);
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (user.passwordResetToken !== hash) {
        return res.status(401).send("Invalid token");
      }
      if (user.passwordResetExpires < new Date()) {
        return res.status(401).send("Token expired");
      }
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      const subject = "Password reset";
      const text = `Your password has been reset`;
      await sendEmail(user.email, subject, text);
      return res.status(200).json({
        message: "Password changed",
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }

  public static async renewToken(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    try {
      const { token } = req.body;
      const _token = await Token.findOne({ token: token });
      if (!_token) {
        return res.status(401).send("Token Does not exist");
      }
      if (_token.expiryDate < new Date()) {
        return res.status(401).send("Token expired");
      }
      // renew a new token
      const user: IUserModel = await User.findById(_token.user);
      if (!user) {
        return res.status(404).send("User not found");
      }
      const newToken = await user.createToken();
      await _token.remove();
      return res.status(200).json({
        message: "Token renewed",
        token: newToken,
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }
}

export default Login;
