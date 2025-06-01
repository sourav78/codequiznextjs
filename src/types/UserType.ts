import { UUID } from "crypto";
import { string } from "zod";

export interface UserRequest {
  userId?: string | null;
  userName: string;
  email: string;
  password: string;
}

export interface OnboardingValidatorType {
  firstName: string | null,
  bio: string | null,
  country: string | null,
}