"use client"

import { useForm } from 'react-hook-form'
import { useSignUp } from '@clerk/nextjs'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'

// Custom zod signup schema
import { signUpSchema } from '../../../schemas/signUpSchema'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { User } from '@/db/schema'
import { AuthApiResponse } from '@/types/AuthApiResponse'
import { UserRequest } from '@/types/UserType'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { ErrorToast, InfoToast, SuccessToast } from '../ui/ShowToast'

const SignupForm = () => {

  const router = useRouter()

  // Destucturing useSignUp hook to get all the methods.
  const { signUp, isLoaded, setActive } = useSignUp()

  // Destucturing useForm hook to get all the methods.
  const {
    register,
    handleSubmit, // 
    formState: { errors }
  } = useForm<z.infer<typeof signUpSchema>>({
    // Specifying the resolver
    resolver: zodResolver(signUpSchema),

    // Define default value for each field that user enter
    defaultValues: {
      email: "",
      userName: "",
      password: "",
      confirmPassword: ""
    }
  })

  const [verifying, setVerifying] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>("")

  const [verificationCode, setVerificationCode] = useState<string>("")
  const [verificationError, setVerificationError] = useState<string | null>("")
  const [isVerifivationCodeLoading, setIsVerifivationCodeLoading] = useState<boolean>(false)
  const [verificationCodeCountdown, setVerificationCodeCountdown] = useState<number>(0)

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const [userInfo, setUserInfo] = useState<UserRequest | null>(null)


  // Effect to manage the countdown timer
  useEffect(() => {
    let timer:any;
    if (verificationCodeCountdown > 0) {
      timer = setTimeout(() => setVerificationCodeCountdown(verificationCodeCountdown - 1), 1000);
    }
    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [verificationCodeCountdown]);


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {

    // If the form is not loaded, return false
    if (!isLoaded) return;

    // If the form is loaded, set the isSubmitting to true
    setIsSubmitting(true)
    setAuthError(null)

    try {

      // Create a new user in clerk
      await signUp.create({
        username: data.userName,
        emailAddress: data.email,
        password: data.password
      })

      // Send a verification email to the user
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })

      setUserInfo({
        email: data.email,
        userName: data.userName,
        password: data.password
      })

      setVerifying(true)

      // Show a success message
      InfoToast("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      console.error("Sign-up error:", error);

      // Set the error message
      ErrorToast(
        error.errors[0].longMessage ||
        "An error occurred during sign-up. Please try again."
      );
    } finally {

      // Set the isSubmitting to false
      setIsSubmitting(false)
    }


  }

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // If the form is not loaded and the user is not active, return false
    if (!isLoaded || !signUp) return;

    // If the form is loaded, set the isSubmitting to true
    setIsSubmitting(true)
    setAuthError(null)

    try {

      // Attempt to verify the email address with the provided verification code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode
      })

      console.log(result);

      // If the verification is successful, set the active session
      // and redirect to the home page
      if (result.status === "complete") {
        await handleCreateNewUserInDB({ userId: result.createdUserId, ...userInfo! })

        await setActive({ session: result.createdSessionId })

        // Redirect the user to the home page
        router.push("/onboarding")
      } else {
        console.error("Verification failed:", result);
        ErrorToast("Verification failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      ErrorToast(
        error.errors[0].longMessage ||
        "An error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  // This function is used to create a new user in the database
  const handleCreateNewUserInDB = async (userData: UserRequest) => {
    try {

      // Send a POST request to the /api/auth/signup endpoint
      const response = await axios.post<AuthApiResponse>("/api/auth/signup", {
        userId: userData.userId,
        userName: userData.userName,
        email: userData.email,
        password: userData.password
      })

      console.log(response.data);

      SuccessToast("Verification successful! Account created successfully.");

    } catch (error) {

      // If the error is an AxiosError, log the error message
      const axiosError = error as AxiosError<AuthApiResponse>;
      console.error("Error while creating new user in DB:", axiosError);

      ErrorToast(
        axiosError.response?.data.message ||
        "An error occurred while creating your account. Please try again."
      );
    }
  }

  const handleResendVerificationCode = async () => {
    setIsVerifivationCodeLoading(true)
    try {
      if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
      setVerificationCodeCountdown(40)
      InfoToast("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      ErrorToast("Something went wrong while sending verification code")
    }finally{
      setIsVerifivationCodeLoading(false)
    }
  }

  // This component is shown when we need to enter OTP
  if (verifying) {
    return (
      <>
        <Card className="bg-white dark:bg-card-dark gap-0 max-w-lg w-full rounded">
          <CardHeader className="p-0 pt-8 px-4 sm:px-10 w-full flex flex-col items-start">
            <h4 className="font-roboto font-bold text-2xl">Verify Your Email</h4>
            <p className="text-default-500 text-center">
              We've sent a verification code to your email
            </p>
          </CardHeader>
          <CardBody className="overflow-visible mt-4 pb-2 px-4 sm:px-10 w-full">
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="verificationCode"
                  className="text-sm font-medium text-default-900"
                >
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  radius="sm"
                  variant='bordered'
                  size='lg'
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full mt-1"
                  autoFocus
                />
              </div>

              <Button
                type='submit'
                color='primary'
                className="w-full mt-4"
                isLoading={isSubmitting}
                size='lg'
                radius='sm'
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </CardBody>
          <CardFooter className="w-full">
            <div className="w-full py-6 rounded-sm flex justify-center items-center gap-2 bg-blue-500/10 dark:bg-blue-900/10">

              {
                isVerifivationCodeLoading ? (
                  <p className="text-sm text-default-500 flex justify-center items-center">
                    Sending Verification... {" "}
                    <Loader2 className='w-4 h-4 ml-1 text-primary animate-spin' />
                  </p>
                ) : (
                  <p className="text-sm text-default-500 flex justify-center items-center">
                    Didn't receive a code?{" "}
                    <button
                      onClick={handleResendVerificationCode}
                      disabled={isVerifivationCodeLoading || verificationCodeCountdown > 0}
                      className={`text-primary ${verificationCodeCountdown > 0 ? "" : "hover:underline"} font-medium ${verificationCodeCountdown > 0 && "cursor-not-allowed"}`}
                    >
                      
                      {verificationCodeCountdown > 0 ? `Resend code in ${verificationCodeCountdown}s` : "Resend code"}
                    </button>
                  </p>
                )
              }


            </div>
          </CardFooter>
        </Card>
      </>
    )
  }


  return (
    <>
      <Card className="bg-white dark:bg-card-dark gap-0 max-w-lg w-full rounded">
        <CardHeader className="p-0 pt-8 px-4 sm:px-10 w-full">
          <h4 className="font-roboto font-bold text-2xl">Create your CodeQuiz account</h4>
        </CardHeader>
        <CardBody className="overflow-visible pb-2 px-4 sm:px-10 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-default-900"
              >
                Username
              </label>
              <Input
                id='username'
                type="text"
                radius="sm"
                variant='bordered'
                isInvalid={!!errors.userName}
                errorMessage={errors.userName?.message}
                {...register("userName")}
                className="w-full mt-1"
                size='lg'
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-default-900"
              >
                Email
              </label>
              <Input
                id='email'
                type="email"
                radius="sm"
                variant='bordered'
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
                className="w-full mt-1"
                size='lg'
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-default-900"
              >
                Password
              </label>
              <Input
                id='password'
                type={showPassword ? "text" : "password"}
                radius="sm"
                variant='bordered'
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
                className="w-full mt-1"
                size='lg'
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-default-900"
              >
                Confirm Password
              </label>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                radius="sm"
                variant='bordered'
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                {...register("confirmPassword")}
                className="w-full mt-1"
                size='lg'
              />
            </div>

            <Button
              type='submit'
              color='primary'
              className="w-full mt-4"
              isLoading={isSubmitting}
              size='lg'
              radius='sm'
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardBody>
        <CardFooter className="w-full">
          <div className="w-full py-6 rounded-sm flex justify-center items-center gap-2 bg-blue-500/10 dark:bg-blue-900/10">
            <p className="text-sm text-text dark:text-text-dark">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default SignupForm