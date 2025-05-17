"use client"

import {useForm} from 'react-hook-form'
import { useSignUp } from '@clerk/nextjs'
import {z} from 'zod'

// Custom zod signup schema
import { signUpSchema } from '../../schemas/signUpSchema'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {Input} from "@heroui/input";
import {Divider} from "@heroui/divider"; 

import {AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail} from 'lucide-react'
import Link from 'next/link'

const SignupForm = () => {

  const router = useRouter()

  // Destucturing useSignUp hook to get all the methods.
  const {signUp, isLoaded, setActive} = useSignUp()

  // Destucturing useForm hook to get all the methods.
  const {
    register, 
    handleSubmit, // 
    formState: {errors}
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

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    
    // If the form is not loaded, return false
    if (!isLoaded) return;

    // If the form is loaded, set the isSubmitting to true
    setIsSubmitting(true)
    setAuthError(null)

    try{

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

      setVerifying(true)
    }catch(error: any){
      console.error("Sign-up error:", error);

      // Set the error message
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-up. Please try again."
      );
    }finally{

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

    try{

      // Attempt to verify the email address with the provided verification code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode
      })

      console.log(result);

      // If the verification is successful, set the active session
      // and redirect to the home page
      if(result.status === "complete"){
        await setActive({session: result.createdSessionId})

        router.push("/")
      }else{
        console.error("Verification failed:", result);
        setVerificationError("Verification failed. Please try again.")
      }
    }catch(error: any){
      console.error("Verification error:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // This component is shown when we need to enter OTP
  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            We've sent a verification code to your email
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
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
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-red-400 bg-green-400 w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">
          Create Your Account
        </h1>
        <p className="text-default-500 text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-default-900"
            >
              username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="your name"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.userName}
              errorMessage={errors.userName?.message}
              {...register("userName")}
              className="w-full"
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
              id="email"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
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
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
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
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-default-900"
            >
              Confirm Password
            </label>
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
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
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-default-600">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignupForm