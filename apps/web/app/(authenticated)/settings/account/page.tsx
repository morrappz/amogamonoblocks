import { getSupabaseSession } from "@/lib/supabase-server";

export default async function Settings() {
  const session = await getSupabaseSession();

  return (
    <>
      server session
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
}
