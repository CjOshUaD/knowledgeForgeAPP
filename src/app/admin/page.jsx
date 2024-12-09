"use client";
import React, { useState, useEffect } from "react";
// import SideNav from "@/app/components/adminSidebar";
import Table from "@/app/components/table";
//import { useRouter } from "next/navigation";
import axios from "axios";

export default function Admin() {
 
  return (
    <div>
      <h1>Hello Admin</h1>
      <h2>Manage Students</h2>
      <Table/>
    </div>
  );
}
