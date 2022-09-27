import { Router } from "express";
import User from "../controllers/User/user";
import { authorise } from "../middlewares/Authorise";
const router = Router();

router.get("/myprofile", authorise, User.myprofile);

export default router;
