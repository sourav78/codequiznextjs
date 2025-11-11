import { OnboardingValidatorType } from "@/types/UserType";
import CustomErrorHandler from "../helpers/ErrorHandler";


// Validating users onboarding details and throw custom error
export const validateOnboarding = ({
  firstName,
  bio,
  country
}:OnboardingValidatorType): void => {
  if (firstName === null) {
    throw new CustomErrorHandler("First name must be required", 400)
  }
  if (bio === null) {
    throw new CustomErrorHandler("Bio is required. Please write anything about yourself", 400)
  }
  if (country === null) {
    throw new CustomErrorHandler("Country must be required", 400)
  }
}