"use client";

import React from "react";
import Navbar from "../components/NavBar";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center text-[#024CAA] mb-8">
            Knowledge Forge App
          </h1>
          <h2 className="text-2xl font-semibold text-center text-[#1A4870] mb-12">
            Designed for Teaching, Built for Learning
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-center mb-12">
              Welcome to Knowledge Forge App – a powerful, intuitive platform that empowers students, 
              instructors, and administrators to create, engage, and achieve together. Join us in 
              transforming learning!
            </p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-[#024CAA] mb-4">Mission</h3>
              <p className="text-gray-600">
                To bridge the gap between technology and education by creating an accessible, secure, 
                and intuitive platform that empowers students, instructors, and administrators. We 
                foster a collaborative environment that supports growth, knowledge-sharing, and 
                achievement, making quality education accessible to everyone, everywhere.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-[#024CAA] mb-4">Vision</h3>
              <p className="text-gray-600">
                To become a global leader in educational transformation, inspiring continuous learning, 
                inclusivity, and innovation. We envision a future where everyone has the tools to 
                succeed in a dynamic, ever-evolving world.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#024CAA] mb-6">Core Values</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold text-[#1A4870] mb-2">Innovation</h4>
                  <p className="text-gray-600">
                    We are committed to advancing education through cutting-edge solutions that 
                    simplify learning and enhance engagement, keeping our platform relevant in a 
                    rapidly evolving world.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#1A4870] mb-2">Accessibility</h4>
                  <p className="text-gray-600">
                    Education should be available to everyone, everywhere. Our platform is designed 
                    to break down barriers, providing a user-friendly experience that&apos;s inclusive 
                    and open to all.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#1A4870] mb-2">Collaboration</h4>
                  <p className="text-gray-600">
                    Learning thrives in community. We foster an environment where students, 
                    instructors, and administrators can connect, share knowledge, and support 
                    each other&apos;s growth.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#1A4870] mb-2">Achievement</h4>
                  <p className="text-gray-600">
                    We celebrate progress and accomplishments, recognizing every step forward to 
                    encourage a culture of lifelong learning and personal success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 