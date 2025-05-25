"use client"
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { useTheme } from 'next-themes';
import Image from 'next/image'
import React from 'react'

const ForgotPassword = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(220deg,_rgba(120,160,255,1)_0%,_rgba(255,255,255,1)_71%,_rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(220deg,_rgba(0,38,135,1)_0%,_rgba(11,13,30,1)_60%,_rgba(11,13,30,1)_100%)] font-poppins">
      {/* Use the unified Navbar component */}

      <header className='sm:py-6 py-4 w-full sm:px-30 px-8'>
        {
          theme === 'dark' ? (
            <Image src="/CQ_dark.png" alt="CodeQuiz Logo" width={150} height={100} />
          ) : (
            <Image src="/CQ_light.png" alt="CodeQuiz Logo" width={150} height={100} />
          )
        }
      </header>
      <main className="flex-1 flex justify-center items-start p-4">
        <ForgotPasswordForm />
      </main>
    </div>
  )
}

export default ForgotPassword