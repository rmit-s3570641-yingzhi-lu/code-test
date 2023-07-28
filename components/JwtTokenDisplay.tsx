"use client";

import { useSession } from "next-auth/react";
import React from "react";

const JwtTokenDisplay = () => {
    const { data: session } = useSession();
    if (session && session.user) {
        return (
          <div className="grid grid-cols-1 divide-y break-words p-10">
            <div className="grid grid-cols-2"><div className="font-bold">Email:</div> <div>{session.user.email} </div> </div>
            <div className="grid grid-cols-2"><div className="font-bold">FirstName:</div> <div>{session.user.firstname} </div> </div>
            <div className="grid grid-cols-2"><div className="font-bold">LastName:</div> <div>{session.user.lastname} </div> </div>
            <div className="grid grid-cols-2"><div className="font-bold">Access Token:</div> <div>{session.user.accessToken} </div> </div>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 divide-y break-words p-10" >
            <p>No Session found</p>
        </div>
      );
};

export default JwtTokenDisplay;