"use client";
import React, { useState, useEffect } from "react";
import SideNav from "@/app/components/adminSidebar";
import Table from "@/app/components/table";
//import { useRouter } from "next/navigation";
import axios from "axios";

export default async function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users");

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Hello Admin</h1>
      <h2>Manage Students</h2>
      <SideNav />
      {/* <Table users={users} /> */}
      <div>
        {/* <form onSubmit={handleSubmit}> */}
        <form>
          <label htmlFor="userType">User Type</label>
          <select
            name="userType"
            id="userType"
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="">-----Institution-----</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <br />
          <label htmlFor="name">Name</label>
          <input
            id="name"
            onChange={(e) => setName(e.target.value)}
            className="border border-black-500"
            type="text"
            placeholder="Enter student name"
            autoComplete="off"
          />
          <br />
          <label htmlFor="email">Email</label>
          <input
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black-500"
            type="email"
            placeholder="Enter student email"
            autoComplete="off"
          />
          <br />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-black-500"
            type="password"
            placeholder="Enter student password"
            autoComplete="off"
          />
          <br />

          <button
            className="bg-[#FFC55A] text-white text-base hover:bg-[#FFC55A] mt-3 mb-3 rounded-md w-20 h-10"
            // disabled={pending}
          >
            {/* {pending ? "Registering..." : "Register"} */}
            Register
          </button>
          {/* {error && (
          <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
            {error}
          </div>
        )} */}
        </form>
      </div>
    </div>
  );
}
