import { auth } from "@/auth";

export default async function Settings() {
  const session = await auth();

  return (
    <>
      server session
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
}
