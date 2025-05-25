"use client"
import { useClerk } from '@clerk/nextjs'
import { Button } from '@heroui/button'
import { Power } from 'lucide-react'
import React from 'react'

const SignOutButton = () => {

  const { signOut } = useClerk()

  return (
    <Button
      color="danger"
      className="w-full mt-4"
      size='lg'
      radius='sm'
      startContent={<Power />}
      onClick={() => {
        signOut({ redirectUrl: "/sign-in" })
      }}
    >
      Logout
    </Button>
  )
}

export default SignOutButton