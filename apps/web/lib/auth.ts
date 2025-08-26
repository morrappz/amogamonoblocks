// lib/auth.ts

import { auth } from "@/auth";

export async function chatAuth() {
  const session = await auth(); // your existing logic

  if (!session) return null;

  // Map to what chatbot expects
  return {
    user: {
      id:
        session.user?.user_catalog_id ||
        session?.user.user_catalog_id?.toString(),
      email: session.user.user_email,
      name: session.user.user_name || session.user.first_name,
      avatar_url: session.user.avatar_url ?? null,
    },
    raw: session, // in case you need to access full original session
  };
}
