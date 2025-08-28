"use client";

import { useAuth } from "@/context/supabase-provider";
import React from "react";

export default function Settings() {
  const { session } = useAuth();

  return (
    <>
      client session
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
}
