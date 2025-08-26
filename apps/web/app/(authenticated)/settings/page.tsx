"use client";

import React from "react";
import { useSession } from "next-auth/react";

export default function Settings() {
  const { data: session } = useSession();

  return (
    <>
      client session
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
}
