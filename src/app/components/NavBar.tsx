"use client";
import React,{useEffect}  from "react";
import Link from "next/link";
import { signOut, useSession} from "next-auth/react";
import Image from "next/image"; 
import { Button } from "@nextui-org/react";
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { Bars4Icon } from '@heroicons/react/20/solid';
import { useRouter } from "next/router";

const Navbar = () => {
    // const router = useRouter();
    const { data: session, status } = useSession();
    
   if (status === "unauthenticated"){
    void signOut({
        redirect: false,
        callbackUrl: "/login",
    })
    console.log("Logout complete")
   }
    return (
        <div className="navbar bg-base-100 bg-[#024CAA]">
            <div className="flex-1">
                <Image
                    src={"/KnowledgeForge.png"}
                    alt="KnowledgeForge"
                    width={400}
                    height={90}
                    className="self-center"
                />
                <Button className="bg-[#FFC55A] text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg-[#FFC55A]">
                    <Link href="/">Home</Link>
                </Button>
                <br />
            </div>
            <div className="flex-none">
                {!session ? (
                    <>
                        <Button className="bg-[#FFC55A] text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg-[#FFC55A]">
                            <Link href="/login">Login</Link>
                        </Button>
                        <br />
                        <Button className="bg-[#FFC55A] text-white text-base hover:-translate-y-1 hover:scale-110 hover:bg-[#FFC55A]">
                            <Link href="/register">Register</Link>
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="text-white font-bold absolute right-16 top-7">
                            Welcome back: {session.user?.name}
                        </div>
                        <div className="absolute top-6 right-3">
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <MenuButton 
                                        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        aria-label="Open menu"
                                    >
                                        <Bars4Icon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                                    </MenuButton>
                                </div>

                                <Menu.Items
                                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                                >
                                    <div className="py-1">
                                        <MenuItem>
                                            <Link href="/account-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Account settings
                                            </Link>
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                            >
                                                Sign out
                                            </button>
                                        </MenuItem>
                                    </div>
                                </Menu.Items>
                            </Menu>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;