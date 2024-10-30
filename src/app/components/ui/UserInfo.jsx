"use client";

import React from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Navbar from "../NavBar";
import { Calendar } from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Card, CardBody, CardFooter, Image, Skeleton } from "@nextui-org/react";

export default function UserInfo() {
  let defaultDate = today(getLocalTimeZone());
  let [focusedDate, setFocusedDate] = React.useState(defaultDate);
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    
    <div className="bg-[#1A4870]">
      <Navbar />
      <h1 className="text-white font-bold mt">Welcome back Students</h1>
      <div>
        <button className="bg-red-500 rounded-lg">Hello</button>
      </div>

      <Card shadow="sm" isPressable onPress={() => console.log("item pressed")}>
        <Skeleton isLoaded={isLoaded} className="flex rounded-full w-12 h-12" />
        <CardBody className="overflow-visible p-0">
          <Image
            shadow="sm"
            radius="lg"
            width="100%"
            className="w-full object-cover h-[140px]"
          />
        </CardBody>
        <CardFooter className="text-small justify-between">
          <b>{/*item.title*/}</b>
          <p className="text-default-500">{/*item.price*/}</p>
        </CardFooter>
      </Card>

      <Calendar
        className="bg-white w-screen object-cover font-lg"
        aria-label="Date (Controlled Focused Value)"
        focusedValue={focusedDate}
        value={defaultDate}
        onFocusChange={setFocusedDate}
      />
    </div>
  );
}