"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { Menu } from '@headlessui/react';
import { Bars4Icon, PencilSquareIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { Link } from "@nextui-org/react";
import NextLink from "next/link";

const Navbar = () => {
    const { data: session } = useSession();
    
    return (
        <div className="navbar sticky top-0 z-[100] bg-gradient-to-r from-[#024CAA] to-[#0367e0] shadow-lg">
            <div className="container mx-auto flex items-center justify-between px-4 py-2">
                <Link as={NextLink} href="/" className="flex-shrink-0">
                    <Image
                        src={"/KnowledgeForge.png"}
                        alt="KnowledgeForge"
                        width={300}
                        height={75}
                        className="transition-transform duration-300 hover:scale-105"
                    />
                </Link>

                <div className="flex-1 flex justify-center space-x-8 mx-8">
                    <Button 
                        as={NextLink}
                        href="/"
                        className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-2 rounded-lg 
                        transition-all duration-300 hover:-translate-y-1 hover:scale-105 
                        hover:bg-[#FFC55A] hover:shadow-lg shadow-md text-sm min-w-[120px]"
                    >
                        Home
                    </Button>
                    <Button 
                        as={NextLink}
                        href="/about"
                        className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-2 rounded-lg 
                        transition-all duration-300 hover:-translate-y-1 hover:scale-105 
                        hover:bg-[#FFC55A] hover:shadow-lg shadow-md text-sm min-w-[120px]"
                    >
                        About
                    </Button>
                    <Button 
                        as={NextLink}
                        href="/courses"
                        className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-2 rounded-lg 
                        transition-all duration-300 hover:-translate-y-1 hover:scale-105 
                        hover:bg-[#FFC55A] hover:shadow-lg shadow-md text-sm min-w-[120px]"
                    >
                        Courses
                    </Button>
                </div>

                <div className="flex-shrink-0 flex space-x-4">
                    {!session ? (
                        <>
                            <Button 
                                as={NextLink}
                                href="/login"
                                className="bg-[#FFC55A]/90 text-white font-semibold px-8 py-2 
                                rounded-lg transition-all duration-300 hover:-translate-y-1 
                                hover:scale-105 hover:bg-[#FFC55A] hover:shadow-lg shadow-md text-sm"
                            >
                                Login
                            </Button>
                            <Button 
                                as={NextLink}
                                href="/register"
                                className="bg-white/10 backdrop-blur-sm text-white font-semibold 
                                px-8 py-2 rounded-lg transition-all duration-300 hover:-translate-y-1 
                                hover:scale-105 hover:bg-white/20 hover:shadow-lg shadow-md text-sm"
                            >
                                Register
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-8">
                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                <UserCircleIcon className="h-6 w-6 text-[#FFC55A]" />
                                Welcome back, <span className="text-[#FFC55A] font-extrabold">{session.user?.name}</span>
                            </div>
                            <Menu as="div" className="relative">
                                <Menu.Button 
                                    className="inline-flex items-center justify-center p-3 rounded-lg
                                    bg-white/10 backdrop-blur-sm text-white transition-all duration-300
                                    hover:bg-white/20 hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    <Bars4Icon className="h-6 w-6" />
                                </Menu.Button>

                                <Menu.Items className="absolute right-0 mt-4 w-64 origin-top-right rounded-xl
                                    bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5
                                    transition-all duration-300 focus:outline-none divide-y divide-gray-100">
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    as={NextLink}
                                                    href="/profile/edit"
                                                    className={`flex items-center px-6 py-3 text-sm font-medium
                                                    transition-colors duration-200 ${
                                                        active ? 'bg-[#024CAA] text-white' : 'text-gray-700'
                                                    }`}
                                                >
                                                    <PencilSquareIcon className="h-5 w-5 mr-2" />
                                                    Edit Profile
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => signOut({ callbackUrl: '/' })}
                                                    className={`flex w-full items-center px-6 py-3 text-sm
                                                    font-medium transition-colors duration-200 ${
                                                        active ? 'bg-[#024CAA] text-white' : 'text-gray-700'
                                                    }`}
                                                >
                                                    Sign out
                                                </button>
                                            )}
                                        </Menu.Item>
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
