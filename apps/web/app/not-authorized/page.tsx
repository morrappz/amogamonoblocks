import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-4xl font-bold text-destructive">
        Not Authorized
      </h1>
      <p className="mb-8 text-lg text-gray-700">
        You do not have permission to access this page.
      </p>
      <Link href="/role-menu" passHref>
        <Button variant="default">Go back to menu</Button>
      </Link>
    </div>
  );
}
