import { Request, Response } from "express";
import { IJWT } from "../../interfaces/jwt";
import Log from "../../middlewares/Log";
import UserModel from "../../models/user.model";

class User {
    public static async myprofile(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        try {
            const currentUser = req.user as IJWT;
            const user = await UserModel.findById(currentUser.id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            return res.status(200).json({
                message: "User profile",
                user:{
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    country: user.country
                }
            });
        } catch (error) {
            Log.error(error);
            return res.status(500).send("Internal server error");
        }
    }
}

export default User;