"use client";
import { cn } from "@/lib/utils";
import { Main } from "@/components/layout/main";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { JSX, useState } from "react";
import { usePathname } from "next/navigation";

const sidebarNavItems = [
  {
    title: "Profile",
    icon: <User size={18} />,
    href: "/settings",
  },
  {
    title: "Account",
    icon: <User size={18} />,
    href: "/settings/account",
  },
  {
    title: "Appearance",
    icon: <User size={18} />,
    href: "#",
  },
  {
    title: "Appearance2",
    icon: <User size={18} />,
    href: "#2",
  },{
    title: "Appearance3",
    icon: <User size={18} />,
    href: "#3",
  },{
    title: "Appearance4",
    icon: <User size={18} />,
    href: "#4",
  },
];

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Main fixed>
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex w-full overflow-y-hidden p-1 pr-4">{children}</div>
      </div>
    </Main>
  );
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: JSX.Element;
  }[];
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  // const navigate = useNavigate();
  const [val, setVal] = useState(pathname ?? "/settings");

  const handleSelect = (e: string) => {
    setVal(e);
    // navigate({ to: e });
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        type="always"
        className="hidden w-full min-w-40 bg-background px-1 py-2 md:block"
      >
        <nav
          className={cn(
            "flex space-x-2 py-1 lg:flex-col lg:space-x-0 lg:space-y-1",
            className
          )}
          {...props}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
