import { Router } from "express";
import Login from "../controllers/Auth/Login";
import Register from "../controllers/Auth/Register";
import Validate from "../middlewares/Validate";
import Joi from "joi";
// @ts-ignore
import country from "joi-country";
const router = Router();
const joi = Joi.extend(country);

const schema = {
  signup: joi.object({
    firstName: joi.string().required(),
    middleName: joi.string().allow(""),
    lastName: joi.string().required(),
    country: joi.string().required().country(),
    phone: joi
      .string()
      .required()
      .regex(/^[0-9]{10}$/),

    email: joi.string().email().required(),
    password: joi.string().required(),
    role: joi.string().required().valid("user", "admin", "agent"),
    confirm: joi.string().required().equal(joi.ref("password")),
  }),
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    role: joi.string().required().valid("user", "admin", "agent"),
  }),
  sendForgotPassword: joi.object({
    email: joi.string().email().required(),
    role: joi.string().required().valid("user", "admin", "agent"),
  }),
  resetPassParam: joi.object({
    id: joi.string().required().min(24).max(24),
    hash: joi.string().required(),
  }),
  token: joi.object({
    token: joi.string().required(),
  }),
  resetPassword: joi.object({
    password: joi.string().required(),
    confirm: joi.string().required().equal(joi.ref("password")),
  }),
};

router.post("/auth/login", Validate.body(schema.login), Login.login);
router.post(
  "/auth/forgotPassword",
  Validate.body(schema.sendForgotPassword),
  Login.sendForgotPassword
);
router.patch(
  "/auth/resetPassword/:id/:hash",
  Validate.params(schema.resetPassParam),
  Validate.body(schema.resetPassword),
  Login.resetPassword
);
router.post("/auth/renewToken", Validate.body(schema.token), Login.renewToken);

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
