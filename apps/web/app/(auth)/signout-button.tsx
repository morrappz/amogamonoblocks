"use client";
import { useAuth } from "@/context/supabase-provider";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <div
      onClick={async () => await signOut()}
      className="relative flex items-center gap-2 text-sm outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0"
    >
      <LogOut />
      Sign Out
    </div>
  );
}
