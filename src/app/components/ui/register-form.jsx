"use client";

import React from "react";
import Link from "next/link";
import { poppins } from "./fonts";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RegisterForm() {
  const [pending, setPending] = useState("");
  const [userType, setUserType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !userType) {
      setError("All fields are necessary.");
      return;
    }

    try{

      const resUserExists = await fetch("api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();



      if (user) {
        setError("User already exists.");
        return;
      }

      setPending(true);
      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType,
          name,
          email,
          password,
        }),
      });
       if (res.ok) {
        setPending(false);
        const form = e.target;
        form.reset();
        router.push("/");
      } else {
        const errorData = await res.json();
        console.log("User registration failed")
        setPending(false);
      }

      router.push("/login")
    } catch (error){
      console.log("Error during registration: ", error);
    }
  };

return (

    <form onSubmit={handleSubmit}>
      <div>

        <div className=" flex-1 absolute place-content-center bg-[#f8f8ff] inset-y-0 left-10 pt-50 pl-10 w-1/3 h-4/5 top-10  right-1/3 rounded-lg">
          <div>
            <h1 className={`${poppins.className} mb-3 font-bold text-5xl`}>
              Register Here
            </h1>
            <p className="text-lg my-9">
              Please Enter the nessecary details to begin your Journey!
            </p>
          </div>
          <div>
            <h2 className="font-bold">Kindly Select Your Instution</h2>
            <br />
            <select name="userType" id="userType" onChange={(e) => setUserType(e.target.value) }>
              <option>-----Instution-----</option>
              <option value="student" >Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <br />
            <input
            onChange={(e) => setName(e.target.value) }
              className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-2 h-12 pl-12 pr-16"
              type="text"
              placeholder="Full Name"
              
            />
            <br />
            <input
            onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-2 h-12 pl-12 pr-16"
              type="email"
              placeholder="Email"
              autoComplete="off"
            />
            <br />
            <input
            onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-[#dcdcdc] border border-black-2 mt-2 h-12 pl-12 pr-16"
              type="password"
              name="password"
              id="password"
              placeholder="password"
              autoComplete="0ff"
            />
          </div>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}

            </div>
          )}

          <div>

          <Link className="text-sm mt-3 text-right" href={"/login"}>
            Already have an account? <span className="underline">Login</span>
          </Link>
          
            <button
              className="bg-[#FFC55A]  text-white text-base  hover:bg[
                        #FFC55A] mt-3 mb-3 rounded-md w-20 h-10"
                        disabled ={pending?true:false}
            >
              {pending?"Registering" : "Register"}
              </button>
            
            
          </div>
        </div>
      </div>
    </form>
  );
}
