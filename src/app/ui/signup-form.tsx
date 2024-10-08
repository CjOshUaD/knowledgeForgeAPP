"use client";

import { Button } from "@/app/ui/button";
import { roboto } from "./fonts";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowRightCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

export default function SignupForm() {
  return (
    <form action="">
      <div  className="items-Left">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${roboto.className} mb-3 text-2xl`}>
          Create New Account
        </h1>
        <div>
          <div className="mr-20 w-full text-large">
            <label className="flex mb-3 mt-5  ">
              <strong>What Instution are you in </strong>
            </label>
            <select
              id="users"
              name="users"
              className="w-full border border-gray-200 rounded-lg"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>
        <div className="w-full">

          <label
            className="mb-3 mt-5 block text-lg font-medium text-gray-900"
            htmlFor="email"
          >
            <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            Email
          </label>
        </div>
        <div className="relative">
          <EnvelopeIcon className="absolute mt-3 h-5 w-5 ml-3 text-black-50 pointer-events-none" />
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] text-base pl-10 outline-2 placeholder:text-gray-500"
            type="email"
            name="email"
            placeholder=" Enter your Email"
            required
          />
        </div>
        <div>
          <label
            className="mb-3 mt-5 block text-lg font-medium text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
        </div>
        <div>
          <LockClosedIcon className="absolute mt-3 h-5 w-5 ml-3 text-black-50 pointer-events-none" />
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-base outline-2 placeholder:text-gray-500"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        
        <Button className="mt-3">
          Next <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        ></div>
      </div>
      </div>
    </form>
  );
}
