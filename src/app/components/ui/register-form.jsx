"use client";

import React, { useState } from "react";
import Link from "next/link";
import { poppins } from "./fonts";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from 'axios';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/users', {
        name,
        email,
        password,
        role
      });
      setError("Account created successfully!");
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className={`${poppins.className} text-4xl font-bold text-gray-900 mb-2`}>
            Create Account
          </h1>
          <p className="text-gray-600">Begin your learning journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent"
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-lg text-center ${
              error.includes('successfully') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFC55A] text-white py-3 rounded-lg font-medium
              transition-all duration-300 hover:bg-[#f7ba4a] hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border
              transition-all duration-300 hover:bg-gray-50 hover:shadow-md 
              flex items-center justify-center gap-2"
          >
            Continue with Google
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-[#024CAA] hover:text-[#0367e0] font-medium transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}