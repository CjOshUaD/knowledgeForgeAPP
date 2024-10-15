"use client";

import { Button } from "./button";
import React from "react";
import { poppins } from "./fonts";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
export default function ForgetForm() {
  return (
    <form>
      <div className="bg-[#1A4870] md:h-screen md:w-screen">
        <div>
          <img
            src="/password.PNG"
            alt="Forget Password Forgetfull"
            width={2048}
            height={2048}
            className=" flex absolute  insent-y-0 right-10 top-10 h-4/5 w-3/5 rounded-lg"
          />
        </div>

        <div className=" flex-1 absolute place-content-center bg-[#f8f8ff] inset-y-0 left-10 pt-50 pl-10 w-1/3 h-4/5 top-10  right-1/3 rounded-lg">
          <div>
            <h1 className={`${poppins.className} mb-3 font-bold text-5xl`}>
              Forget Password?
            </h1>
            <p className="text-lg my-9">
              Enter your email address associate with your account. <br />
              We've sent a OTP to your email <br />
              Kindly Change your email
            </p>
          </div>
          <div>
            <div>
              <label htmlFor="email" className="font-bold">
                Your Email
              </label>
            </div>
            <div className="relative ">
              <EnvelopeIcon className="absolute mt-6 h-5 w-5 ml-3 text-black-50 pointer-events-none" />
              <input
                className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-2 h-12 pl-12 pr-16"
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
          <div>
            <Button className="mt-3 mb-3 h-14 text-lg">
              Request password reset
              <input type="submit" value=""/>
            </Button>
          </div>
          <div></div>
        </div>
      </div>
    </form>
  );
}
