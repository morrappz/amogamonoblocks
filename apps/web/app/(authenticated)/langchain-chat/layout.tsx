import { cn } from "@/lib/utils";
// import MenuActions from "./_components/MenuActions";
import { History } from "lucide-react";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-[800px] w-full mx-auto">
      <div
        id="content"
        className={cn(
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "transition-[width] duration-200 ease-linear",
          "flex h-svh flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh"
        )}
      >
        {/* <div className="flex justify-end">
          <MenuActions />
        </div> */}
        <div className="relative pr-3 pl-3 flex-1">{children}</div>
      </div>
    </div>
  );
}
