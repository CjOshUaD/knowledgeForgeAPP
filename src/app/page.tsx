"use client";

import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { connectMongoDB } from "./lib/mongodb";
import Navbar from "./components/NavBar";
import { Button, Link } from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";

export default function Page() {
  initialScale: 1;
  width: "device-width";
  height: "device-height";
  maximumScale: 1;
  viewportFit: "cover";

  const db = connectMongoDB();
  return (
    <main className="flex-12 flex-col item-center justify-center md:h-screen md:w-screen antialiased">
      <Navbar/>

      {/* LANDING PAGE*/}
      <div className="md:h-screen">
        {" "}
        {/*Main DIV */}
        <div className=" grid grid-cols-2 bg-[#1A4870] md:h-screen md:w-screen ">
          <div>
            <div className="flex-1 fixed md:h-screen pr-45 bg-[#596fb7] rounded-2xl relative bg-opacity-70">
              <div className="flex text-5xl justify-center p-6">
                <h1 className="text-white font-bold">
                  Forge Your Future <br />
                  Unlock Your Potential
                </h1>
              </div>
              <div className=" flex justify-start ">
                <p className="flex text-white  text-center text-2xl p-10">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Purus gravida quis blandit turpis. Augue neque gravida in
                  fermentum et sollicitudin ac orci. Et sollicitudin ac orci
                  phasellus egestas. Elementum empus egestas sed sed risus
                  pretium quam vulputate. Interdum velit euismod in pellentesque
                  massa placerat duis ultricies.
                </p>
              </div>

              {/*SIGN UP BUTTON*/}
              <div className="flex justify-center mb-10">
                <Button
                  as={Link}
                  href="/register"
                  variant="flat"
                  className="flex transition duration-150 ease-in-out bg-[#FFC55A] mb-5 text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                    #FFC55A]"
                >
                  <strong>Sign Up</strong>
                  <ArrowRightCircleIcon className="ml-auto h-6 w-6  " />
                </Button>
              </div>
            </div>
          </div>

          <div className="justify-end">
            <div>
              {" "}
              <Image
                src="/vibrant-books.png"
                width={600}
                height={600}
                alt="bookshelves"
                className="flex relative fixed object-none object-right  rounded-2xl w-11/12 top-50 left-10  opacity-50 size-3/6"
              />
              <Image
                src="/group-of-peopleSmiling.png"
                alt="Group of People Smiling"
                width={1000}
                height={1000}
                className="flex relative fixed  inset-x-0 bottom-36  top-50  left-32 size-4/5"
              />
            </div>
        </div>
          </div>
      </div>{" "}
      {/*Main DIV */}
    </main>
  );
}
