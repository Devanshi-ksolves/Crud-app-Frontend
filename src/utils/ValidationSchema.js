import * as Yup from "yup";
import { Messages } from "../utils/Messages";

export const signupValidationSchema = Yup.object({
  name: Yup.string().required(Messages.signup.required),
  email: Yup.string()
    .email(Messages.signup.invalidEmail)
    .required(Messages.signup.required),
  password: Yup.string()
    .min(8, Messages.signup.password.tooShort)
    .matches(/[A-Z]/, Messages.signup.password.uppercase)
    .matches(/[0-9]/, Messages.signup.password.digit)
    .matches(/[!@#$%^&*]/, Messages.signup.password.special)
    .required(Messages.signup.required),
  confirmPassword: Yup.string()
    .required(Messages.signup.confirmPassword.required)
    .oneOf(
      [Yup.ref("password"), null],
      Messages.signup.confirmPassword.mismatch
    ),
});
