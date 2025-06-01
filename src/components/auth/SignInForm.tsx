"use client"

import { useForm } from 'react-hook-form'
import { useSignIn } from '@clerk/nextjs'
import { z } from 'zod'

// Custom zod signup schema
import { signInSchema } from '../../../schemas/signInSchema'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { ErrorToast, SuccessToast } from '../ui/ShowToast'

const SignInForm = () => {

  const router = useRouter()

  // Destucturing useSignIn hook to get all the methods.
  const { signIn, isLoaded, setActive } = useSignIn()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Destucturing useForm hook to get all the methods.
  const {
    register,
    handleSubmit, // 
    formState: { errors }
  } = useForm<z.infer<typeof signInSchema>>({
    // Specifying the resolver
    resolver: zodResolver(signInSchema),

    // Define default value for each field that user enter
    defaultValues: {
      identifier: "",
      password: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;

    // If the form is loaded, set the isSubmitting to true
    setIsSubmitting(true)
    setAuthError(null)

    try {

      // Create a new user in clerk
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password
      })

      // Set the active session
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })

        SuccessToast("Login successful!");

        // Redirect the user to the home page
        router.push("/")
      } else {
        console.error("Sign-in failed:", result);
        ErrorToast("Sign-in failed. Please try again.")
      }

    } catch (error: any) {

      console.error("Sign-in error:", error);

      // Set the error message
      ErrorToast(
        error.errors[0].longMessage ||
        "An error occurred during sign-in. Please try again."
      );
    } finally {
      // Set the isSubmitting to false
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-card-dark gap-0 max-w-lg w-full rounded">
      <CardHeader className="p-0 pt-8 px-4 sm:px-10 w-full">
        <h4 className="font-roboto font-bold text-2xl">Sign in to your account</h4>
      </CardHeader>

      <CardBody className="overflow-visible pb-2 px-4 sm:px-10 w-full">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id='identifier'
              type="email"
              radius="sm"
              variant='bordered'
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
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
            <p className="text-sm text-right">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full mt-4"
            isLoading={isSubmitting}
            size='lg'
            radius='sm'
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <CardFooter className="w-full">
        <div className="w-full py-6 rounded-sm flex justify-center items-center gap-2 bg-blue-500/10 dark:bg-blue-900/10">
          <p className="text-sm text-text dark:text-text-dark">
            New to CodeQuiz?{" "}
            <Link
              href="/sign-up"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SignInForm