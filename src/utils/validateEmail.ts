import { emailRegExp } from "@/Constants/Regexp";

export const validateEmail = (val: string) => !emailRegExp.test(val);
