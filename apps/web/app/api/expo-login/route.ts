import { NextResponse } from "next/server";
import { signIn } from "@/auth"; // import from your NextAuth config (the `signIn` you exported)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // ✅ Call NextAuth signIn with provider and email
  const result = await signIn("user-email", {
    email,
    redirect: false, // don't redirect yet
  });

  if (!result) {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }

  // ✅ Redirect user to callbackUrl with cookies set
  return NextResponse.redirect(new URL(callbackUrl, req.url));
}
