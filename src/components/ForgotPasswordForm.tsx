"use client"
import { useSignIn, SignedOut, useClerk } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { forgotPasswordSchema } from '../../schemas/forgotPasswordSchema'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import Link from 'next/link'

const ForgotPasswordForm = () => {

  const router = useRouter()

  // Destucturing useSignUp hook to get all the methods.
  const { signIn, isLoaded, setActive } = useSignIn()

  // Destucturing useClerk hook to get signOut methods.
  const { signOut } = useClerk()

  // Destucturing useForm hook to get all the methods.
  const {
    register,
    handleSubmit, // 
    formState: { errors }
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    // Specifying the resolver
    resolver: zodResolver(forgotPasswordSchema),

    // Define default value for each field that user enter
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: ""
    }
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [emailIsSubmitting, setEmailIsSubmitting] = useState<boolean>(false)

  const [authError, setAuthError] = useState<string | null>("")

  const [email, setEmail] = useState<string>("")

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const [showNewPasswordComponent, setShowNewPasswordComponent] = useState<boolean>(false)


  const handleEmailVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // If the form is not loaded and the user is not active, return false
    if (!isLoaded) return;

    // If the form is loaded, set the isSubmitting to true
    setEmailIsSubmitting(true)
    setAuthError(null)

    try {

      // Create a reset password email code
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })

      setShowNewPasswordComponent(true)
    } catch (error: any) {
      console.error("Email verification error:", error);

      // Set the error message
      setAuthError(
        error.errors?.[0]?.message ||
        "An error occurred during email verification. Please try again."
      );
    } finally {
      // Set the isSubmitting to false
      setEmailIsSubmitting(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {

    // If the form is not loaded, return false
    if (!isLoaded || !signIn) return;

    // If the form is loaded, set the isSubmitting to true
    setIsSubmitting(true)
    setAuthError(null)

    // If the passwords don't match, set the error message
    if (data.password !== data.confirmPassword) {
      setAuthError("Passwords don't match")
      return
    }

    try {

      // Attempt to reset the password with the provided code
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password
      })

      console.log(result);

      // If the verification is successful, then end the session
      // and redirect to the sign-in page
      if (result.status === "complete") {
        // await setActive({ session: result.createdSessionId })

        console.log("Passord reset successfully")

        // await handleCreateNewUserInDB({ userId: result.createdUserId, ...userInfo! })
        signOut({ redirectUrl: "/sign-in" })
      } else {
        console.error("Password reset failed:", result);
        setAuthError("Password reset failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);

      // Set the error message
      setAuthError(
        error.errors?.[0]?.message ||
        "An error occurred during resting password. Please try again."
      );
    } finally {
      // Set the isSubmitting to false
      setIsSubmitting(false)
    }

  }


  return (
    <Card className="bg-white dark:bg-card-dark gap-0 max-w-lg w-full rounded">
      <CardHeader className="p-0 pt-8 px-4 sm:px-10 w-full flex flex-col items-start">
        <h4 className="font-roboto font-bold text-2xl">Reset your password</h4>
        <p className="text-sm mt-2 text-default-500">
          Enter the email address associated with your account and we'll send you a verification code.
        </p>
      </CardHeader>
      <CardBody className="overflow-visible mt-4 pb-2 px-4 sm:px-10 w-full">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleEmailVerification} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="Email"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id='Email'
              type="text"
              radius="sm"
              variant='bordered'
              className="w-full mt-1"
              size='lg'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type='submit'
            color='primary'
            className="w-full mt-1"
            isLoading={emailIsSubmitting}
            size='lg'
            radius='sm'
          >
            {emailIsSubmitting ? "Sending code..." : "Get Code"}
          </Button>
        </form>

        {
          showNewPasswordComponent && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-default-900"
                >
                  Verification Code
                </label>
                <Input
                  id='code'
                  type="text"
                  radius="sm"
                  variant='bordered'
                  isInvalid={!!errors.code}
                  errorMessage={errors.code?.message}
                  {...register("code")}
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
                {isSubmitting ? "Resetting password..." : "Reset Password"}
              </Button>
            </form>
          )
        }
      </CardBody>
      <CardFooter className="w-full">
        <div className="w-full py-6 rounded-sm flex justify-center items-center gap-2 bg-blue-500/10 dark:bg-blue-900/10">
          <p className="text-sm text-text dark:text-text-dark">
            <Link
              href="/sign-in"
              className="text-primary hover:text-black font-medium"
            >
              Return to sign in
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ForgotPasswordForm