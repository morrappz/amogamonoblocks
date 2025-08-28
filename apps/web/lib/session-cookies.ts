"use server";

import { cookies } from "next/headers";

export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
  userId: string
) {
  const cookieStore = await cookies();

  // Set cookies server-side for better reliability
  cookieStore.set("sb-access-token", accessToken, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set("sb-user-id", userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");
  cookieStore.delete("sb-user-id");
}
