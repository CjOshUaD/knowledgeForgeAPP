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
    const { data: session, status } = useSession();
    
    if (status === "unauthenticated"){
        void signOut({
            redirect: false,
            callbackUrl: "/login",
        })
        console.log("Logout complete")
    }

    return (
        <div className="navbar sticky top-0 z-50 bg-gradient-to-r from-[#024CAA] to-[#0367e0] shadow-lg px-8 py-2">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src={"/KnowledgeForge.png"}
                            alt="KnowledgeForge"
                            width={300}
                            height={70}
                            className="transition-transform duration-300 hover:scale-105"
                        />
                    </Link>
                    <Button 
                        className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-5 rounded-lg 
                        transition-all duration-300 hover:-translate-y-1 hover:scale-105 
                        hover:bg-[#FFC55A] hover:shadow-lg shadow-md"
                    >
                        <Link href="/">Home</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-6">
                    {!session ? (
                        <div className="flex items-center gap-4">
                            <Button 
                                className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-5 
                                rounded-lg transition-all duration-300 hover:-translate-y-1 
                                hover:scale-105 hover:bg-[#FFC55A] hover:shadow-lg shadow-md"
                            >
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button 
                                className="bg-white/10 backdrop-blur-sm text-white font-semibold 
                                px-8 py-5 rounded-lg transition-all duration-300 hover:-translate-y-1 
                                hover:scale-105 hover:bg-white/20 hover:shadow-lg shadow-md"
                            >
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-8">
                            <div className="text-white font-bold text-lg">
                                Welcome back, <span className="text-[#FFC55A] font-extrabold">{session.user?.name}</span>
                            </div>
                            <Menu as="div" className="relative">
                                <MenuButton 
                                    className="inline-flex items-center justify-center p-3 rounded-lg
                                    bg-white/10 backdrop-blur-sm text-white transition-all duration-300
                                    hover:bg-white/20 hover:scale-105 shadow-md hover:shadow-lg"
                                    aria-label="Open menu"
                                >
                                    <Bars4Icon aria-hidden="true" className="h-6 w-6" />
                                </MenuButton>

                                <Menu.Items
                                    className="absolute right-0 mt-4 w-64 origin-top-right rounded-xl
                                    bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5
                                    transition-all duration-300 focus:outline-none"
                                >
                                    <div className="py-2">
                                        <MenuItem>
                                            {({ active }) => (
                                                <Link 
                                                    href="/account-settings" 
                                                    className={`block px-6 py-3 text-sm font-medium
                                                    transition-colors duration-200 ${
                                                        active ? 'bg-[#024CAA] text-white' : 'text-gray-700'
                                                    }`}
                                                >
                                                    Account settings
                                                </Link>
                                            )}
                                        </MenuItem>
                                        <MenuItem>
                                            {({ active }) => (
                                                <button
                                                    className={`block w-full text-left px-6 py-3 text-sm
                                                    font-medium transition-colors duration-200 ${
                                                        active ? 'bg-[#024CAA] text-white' : 'text-gray-700'
                                                    }`}
                                                    onClick={() => signOut({ callbackUrl: '/' })}
                                                >
                                                    Sign out
                                                </button>
                                            )}
                                        </MenuItem>
                                    </div>
                                </Menu.Items>
                            </Menu>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;