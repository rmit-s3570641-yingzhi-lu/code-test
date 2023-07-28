"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

const SigninButton = () => {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <a onClick={() => signOut()} className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-black font-bold items-center justify-center hover:bg-gray-600 hover:text-white">
        Sign Out
      </a>
    );
  }
  return (
    <a onClick={() => signIn()} className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-black font-bold items-center justify-center hover:bg-gray-600 hover:text-white">
      Sign In
    </a>
  );
};

export default SigninButton;