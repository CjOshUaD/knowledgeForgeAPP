"use client";

import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Page() {
  initialScale: 1;
  width: "device-width";
  height: "device-height";
  maximumScale: 1;
  vieportFit: "cover";
  return (
    <main className="flex-12 flex-col item-center justify-center md:h-screen md:w-screen antilaised">
      {/*Navigation Bar */}
        <div>
          <Navbar className="sm:flex justify-between bg-[#1A4870]">
            <NavbarBrand>
              <Image
                src={"/KnowledgeForge.png"}
                alt="KnowledgeForge "
                width={400}
                height={90}
                className="self-center"
              />
            </NavbarBrand>

            <NavbarContent
              className="sm:flex gap-4 space-x-14 text-3xl"
              justify="center"
            >
              <NavbarItem isActive>
                <Button
                  as={Link}
                  color="primary"
                  href="#"
                  className="bg-[#FFC55A]  text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                #FFC55A"
                >
                  <strong>Home</strong>
                </Button>
              </NavbarItem>
              <NavbarItem isActive>
                <Button
                  as={Link}
                  color="primary"
                  href="#"
                  className="bg-[#FFC55A]  text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                #FFC55A"
                >
                  <strong>About</strong>
                </Button>
              </NavbarItem>
              <NavbarItem isActive>
                <Button
                  as={Link}
                  color="primary"
                  href="#"
                  className="bg-[#FFC55A]  text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                #FFC55A"
                >
                  <strong>Course</strong>
                </Button>
              </NavbarItem>
              <NavbarItem isActive>
                <Button
                  as={Link}
                  color="primary"
                  href="#"
                  className="bg-[#FFC55A]  text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                #FFC55A"
                >
                  <strong>Contacts</strong>
                </Button>
              </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
              {/*SEARCH BAR */}
              <NavbarItem className="relative flex rounded-lg items-center focus-within: text-gray-200">
                <MagnifyingGlassIcon className="absolute h-5 w-5 ml-3 text-black-50 pointer-events-none" />
                <input
                  className="flex w-full pr-3 pl-10 py-2 font-semibold placeholder-black-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus-ring-500 focus:ring-2"
                  type="search"
                  name="search"
                  placeholder="Search Courses"
                  autoComplete="off"
                  aria-label="Search Courses"
                />
              </NavbarItem>

              <NavbarItem className=" flex ">
                {/*LOGIN BUTTON */}
                <Button
                  as={Link}
                  href="/login"
                  className="bg-[#FFC55A]  text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg[
                    #FFC55A"
                >
                  <strong>Login</strong>
                </Button>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>

      {/* LANDING PAGE*/}
      <div className="md:h-screen">
        {" "}
        {/*Main DIV */}
        <div className=" grid grid-cols-2 bg-[#1A4870] md:h-screen md:w-screen ">
          <div>
            <div className="flex-1 fixed md:h-sreen pr-45 bg-[#596fb7] rounded-2xl relative bg-opacity-70">
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
