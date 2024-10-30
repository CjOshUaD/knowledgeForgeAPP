"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Link} from "@nextui-org/react";
import { poppins } from "./fonts";
import { useRouter } from "next/navigation";
import { React } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from 'react'

export default function LoginForm({setLoggedIn, isLoggedIn }) {
 const [pending, setPending] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState (false);

  useEffect(() => {
    signOut({
      redirect: false,
    });
  },[]);

  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if ( !email || !password ) {
      setError("All fields are necessary.");
      return;
    }

    try{
      setPending(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      }) 

      if (res.error) {
        setError("Invalid Credentials");
        setPending(false);
        return;
      }
      router.replace("/dashboard");
    } catch (error){
      console.log("Error during Login: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div className=" flex-1 absolute place-content-center bg-[#f8f8ff] inset-y-0 left-10 pt-50 pl-10 w-1/3 h-4/5 top-10  right-1/3 rounded-lg">
          <div>
            <h1 className={`${poppins.className} mb-3 font-bold text-5xl`}>
              Login
            </h1>
            <p className="text-lg my-9">
              Please Enter the necessary details to begin your Journey!
            </p>
          </div>
          <div>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-3 h-12 pl-12 pr-48"
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              autoComplete="off"
            />
            <br />
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-3 h-12 pl-12 pr-48"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              autoComplete="off"
            />
          </div>
          
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <div>
            <Link href="/forget" className="underline my-3">
              Forgot Password
            </Link>
          </div>

          <button
             //href="/dashboard"
              className="bg-[#FFC55A]  text-white text-base  hover:bg[
                        #FFC55A] mt-3 mb-3 rounded-md w-20 h-10"
                        disabled ={pending?true:false}
                        type="submit"
            >
              {pending?"Login in" : "Login"}
              </button> 
              <br/>
          <Link className="text-right" href="/register">
            Already have account? <span className="underline"> Register</span>
          </Link>
        </div>
      </div>
    </form>
  );
}
