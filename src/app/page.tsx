"use client";

import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import Image from "next/image";
import Navbar from "./components/NavBar";
import { Button, Link } from "@nextui-org/react";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <main className="flex-12 flex-col item-center justify-center md:h-screen md:w-screen antialiased">
      <Navbar/>

      {/* LANDING PAGE*/}
      <div className="md:h-screen">
        {" "}
        {/*Main DIV */}
        <div className=" grid grid-cols-2 bg-[#1A4870] md:h-screen md:w-screen ">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex-1 fixed md:h-screen pr-45 bg-[#596fb7] rounded-2xl relative bg-opacity-70">
              <motion.div 
                className="flex text-5xl justify-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-white font-bold text-6xl leading-tight">
                  Forge Your Future,<br />
                  <span className="text-[#FFC55A]">Unlock Your Potential</span>
                </h1>
              </motion.div>

              <motion.p 
                className="flex text-white text-center text-2xl p-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Transform your learning journey with our innovative platform. Join thousands of students who have already discovered their path to success through interactive courses, expert mentorship, and a supportive community.
              </motion.p>

              <motion.div 
                className="flex justify-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Button
                  as={Link}
                  href="/register"
                  variant="flat"
                  className="flex transition duration-300 ease-in-out bg-[#FFC55A] mb-5 text-white text-lg px-8 py-6 hover:-translate-y-1 hover:scale-110 hover:bg-[#FFD68A]"
                >
                  <strong>Start Your Journey</strong>
                  <ArrowRightCircleIcon className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Image
                  src="/vibrant-books.png"
                  width={600}
                  height={600}
                  alt="bookshelves"
                  className="flex relative fixed object-none object-right rounded-2xl w-11/12 top-50 left-10 size-3/6"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Image
                  src="/group-of-peopleSmiling.png"
                  alt="Group of People Smiling"
                  width={1000}
                  height={1000}
                  className="flex relative fixed inset-x-0 bottom-36 top-50 left-32 size-4/5"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold mb-4">About Us</h4>
                <p className="text-gray-400">
                  Empowering learners worldwide with quality education and innovative learning solutions.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Courses</a></li>
                  <li><a href="#" className="hover:text-white">Teachers</a></li>
                  <li><a href="#" className="hover:text-white">Resources</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: info@edutech.com</li>
                  <li>Phone: +1 234 567 890</li>
                  <li>Address: 123 Education St</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {/* Add your social media icons here */}
                  <a href="#" className="text-gray-400 hover:text-white">FB</a>
                  <a href="#" className="text-gray-400 hover:text-white">TW</a>
                  <a href="#" className="text-gray-400 hover:text-white">IG</a>
                  <a href="#" className="text-gray-400 hover:text-white">LI</a>
                </div>
              </div>
            </div>
            <div className="text-center text-gray-400 mt-8">
              © 2024 KnowledgeForge. All rights reserved.
            </div>
          </div>
        </footer>

      </div>{" "}
    </main>
  );
}
