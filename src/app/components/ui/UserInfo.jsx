"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { UserCircleIcon, LockClosedIcon} from "@heroicons/react/24/outline";
export default function UserInfo() {
  //const {data: session } = useSession(""); {session?.user?.name} {session?.user?.email}
  return (
    <div className="flex flex-col gap-y-8">

      <div className="flex items-center justify-between w-full">
        <div className="text-2xl font-bold">Welcome back</div>
      </div>
      <div className="shadow-lg p-8 bg-zinc-300 flex-col gap-2 my-6">
        Name: <span className="font-bold"></span>
      </div>
      <div className="shadow-lg p-8 bg-zinc-300 flex-col gap-2 my-6">
        Email: <span className="font-bold"></span>
      </div>
      <button onClick={() => signOut()} 
       className="bg-red-500 text-white font-bold px-6 py-2 mt-3">
        Log out
      </button>
    </div>
  );
}
