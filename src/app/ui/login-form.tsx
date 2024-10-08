"use client";

import { Button } from "@/app/ui/button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { roboto } from "./fonts";
import Link from "next/link";
//import {authenticate}

export default function LoginForm() {
  return (
    <form>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 left-0">
        <h1 className={`${roboto.className} mb-3 text-2xl`}>
          {" "}
          Please log in to Continue
        </h1>
        <div className="w-full">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-90"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter Your email address"
              required
            />
          </div>
        </div>

        <div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
          </div>
          <div>
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              type="password"
              name="password"
              id="password"
              placeholder="Enter Password"
              required
              minLength={6}
            />
          </div>
        </div>
        <div>
            <Link href={"/forget"} className="text-bold text-blue-500">
                <u>Forget Password?</u>
            </Link>
        </div>
        <Button className="mt-3">
          Login <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        ></div>
      </div>
    </form>
  );
}
