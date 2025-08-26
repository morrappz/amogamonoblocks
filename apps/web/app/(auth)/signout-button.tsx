"use client";
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <div
      onClick={() => signOut()}
      className="relative flex items-center gap-2 text-sm outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0"
    >
      <LogOut />
      Sign Out
    </div>
  );
}
