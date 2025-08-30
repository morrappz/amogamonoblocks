"use client";

import { useSession } from "next-auth/react";
import React from "react";

export default function Settings() {
  const { data: session } = useSession();

  return (
    <>
      client session
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
}
