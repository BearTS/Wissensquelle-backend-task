import { Router } from "express";
import Login from "../controllers/Auth/Login";
import Register from "../controllers/Auth/Register";
import Validate from "../middlewares/Validate";
import Joi from "joi";
const router = Router();

const schema = {
  signup: Joi.object({
    firstName: Joi.string().required(),
    middleName: Joi.string().allow(""),
    lastName: Joi.string().required(),
    country: Joi.string().required(),
    phone: Joi.string().required(),

    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    confirm: Joi.string().required().equal(Joi.ref("password")),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  }),
  sendForgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassParam: Joi.object({
    id: Joi.string().required().min(24).max(24),
    hash: Joi.string().required(),
  }),
  id: Joi.object({
    id: Joi.string().required().min(24).max(24),
  }),
  resetPassword: Joi.object({
    password: Joi.string().required(),
    confirm: Joi.string().required().equal(Joi.ref("password")),
  }),
};

router.post("/auth/login", Validate.body(schema.login), Login.login);
router.post(
  "/auth/forgotPassword",
  Validate.body(schema.sendForgotPassword),
  Login.sendForgotPassword
);
router.post(
  "/auth/resetPassword/:id/:hash",
  Validate.params(schema.resetPassParam),
  Validate.body(schema.resetPassword),
  Login.resetPassword
);
router.get(
  "/auth/renewToken/:id",
  Validate.params(schema.id),
  Login.renewToken
);

router.post("/auth/signup", Validate.body(schema.signup), Register.signup);
router.get(
  "/verify/:id/:hash",
  Validate.params(schema.resetPassParam),
  Register.verify
);
router.post(
  "/auth/resendEmail",
  Validate.body(schema.sendForgotPassword),
  Register.resend
);

export default router;
