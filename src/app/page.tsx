import SignOutButton from "@/components/SignOutButton";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@heroui/button";
import { LogOut, Power } from "lucide-react";

export default async function Home() {

  const {userId} = await auth()
  console.log(userId ?? null);
  

  return (
    <div className="font-poppins bg-background dark:bg-background-dark grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className=" flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <SignOutButton />
      </main>
    </div>
  );
}
