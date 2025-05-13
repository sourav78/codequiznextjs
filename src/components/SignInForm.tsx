"use client"

import {useForm} from 'react-hook-form'
import { useSignIn } from '@clerk/nextjs'
import {z} from 'zod'

// Custom zod signup schema
import { signInSchema } from '../../schemas/signInSchema'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {Input} from "@heroui/input";
import {Divider} from "@heroui/divider"; 
import {AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail} from 'lucide-react'
import Link from 'next/link'

const SignInForm = () => {

  const router = useRouter()

  // Destucturing useSignIn hook to get all the methods.
  const {signIn, isLoaded, setActive} = useSignIn()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Destucturing useForm hook to get all the methods.
  const {
    register, 
    handleSubmit, // 
    formState: {errors}
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

    try{

      // Create a new user in clerk
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password
      })

      // Set the active session
      if(result.status === "complete"){
        await setActive({session: result.createdSessionId})

        router.push("/")
      }else{
        console.error("Sign-in failed:", result); 
        setAuthError("Sign-in failed. Please try again.")
      }

    }catch(error: any){

      console.error("Sign-in error:", error);

      // Set the error message
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-in. Please try again."
      );
    }finally{
      // Set the isSubmitting to false
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">Welcome Back</h1>
        <p className="text-default-500 text-center">
          Sign in to access your secure cloud storage
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
              htmlFor="identifier"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-default-900"
              >
                Password
              </label>
            </div>
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

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignInForm