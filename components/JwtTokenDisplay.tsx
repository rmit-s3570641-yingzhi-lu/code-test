"use client";

import { useSession } from "next-auth/react";
import React from "react";

const JwtTokenDisplay = () => {
    const { data: session } = useSession();
    if (session && session.user) {
        return (
          <div>
            <p>Email: {session.user.email} </p>
            <p>FirstName: {session.user.firstname} </p>
            <p>LastName: {session.user.lastname} </p>
            <p>Access Token: {session.user.accessToken} </p>
          </div>
        );
      }
      return (
        <div>
            <p>No Session found</p>
        </div>
      );
};

export default JwtTokenDisplay;