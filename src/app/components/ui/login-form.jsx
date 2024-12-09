"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Link } from "@nextui-org/react";
import { poppins } from "./fonts";
import { useRouter } from "next/navigation";
import { React } from "react";
import axios from 'axios';

export default function LoginForm({ setLoggedIn, isLoggedIn }) {
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false });
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res.error) {
        setLoggedIn(true);
        
        // Fetch user role after successful login
        try {
          const userResponse = await axios.get('/api/user/me');
          const userRole = userResponse.data.role;
          
          // Redirect based on role
          if (userRole === 'teacher') {
            router.push('/teacher');
          } else {
            router.push('/dashboard');
          }
        } catch (roleError) {
          console.error('Error fetching user role:', roleError);
          router.push('/dashboard'); // Fallback to dashboard if role fetch fails
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed");
    }
    setPending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`${poppins.className} text-4xl font-bold text-gray-900 mb-2`}>
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Please enter your details to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent
                transition-all duration-200"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-[#FFC55A] focus:border-transparent
                transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <Link 
              href="/forget"
              className="text-sm text-[#024CAA] hover:text-[#0367e0] 
                transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg text-center bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#FFC55A] text-white py-3 rounded-lg font-medium
              transition-all duration-300 hover:bg-[#f7ba4a] hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register"
              className="text-[#024CAA] hover:text-[#0367e0] font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </div>

          {/* Google Sign In */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border
              transition-all duration-300 hover:bg-gray-50 hover:shadow-md 
              flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}