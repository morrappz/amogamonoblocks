/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
  title: string;
  setDeleteHistory: (deleteHistory: boolean) => void;
}

const MenuBar = ({ open, setOpen, data, title }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  // const handleDelete = async (id: string) => {
  //   console.log("id----", id);
  //   const response = await fetch(
  //     `https://amogaagents.morr.biz/Chat?id=eq.${id}`,
  //     {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //       },
  //     }
  //   );
  //   if (response.ok) {
  //     setDeleteHistory(true);
  //     toast({
  //       description: "Chat deleted successfully",
  //     });
  //   } else {
  //     toast({
  //       description: "Failed to delete chat",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const filteredData =
    data && data.filter((item: any) => item.form_name.includes(searchTerm));
  return (
    <div>
      <div>
        <Sheet
          open={open}
          onOpenChange={(open) => setOpen(open ? true : false)}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <div className="flex items-center pl-2 gap-2 border rounded-md ">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  className="border-none"
                  placeholder={`Search ${title}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-2.5 mt-2.5">
              {filteredData &&
                filteredData.length > 0 &&
                filteredData.map((prompt: any) => (
                  <div
                    key={prompt.chatId}
                    className="hover:bg-secondary cursor-pointer p-2.5 rounded-md"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <Link href={`/agent/Chat/${prompt.form_id}`}>
                        {prompt.form_name}
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MenuBar;
