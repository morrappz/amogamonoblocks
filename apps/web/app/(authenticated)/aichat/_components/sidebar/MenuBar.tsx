/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Bookmark, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFormSetupData } from "../../lib/actions";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: string;
  formId?: number;
  //   setDeleteHistory: (deleteHistory: boolean) => void;
  //   refreshHistory: () => any;
}

const MenuBar = ({ open, setOpen, mode }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getFormSetupData();
      setData(response);
    };

    fetchData();
  }, []);

  // Filter data based on search term

  const filteredData =
    data &&
    data.filter((prompt: any) =>
      prompt.form_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <Sheet open={open} onOpenChange={(open) => setOpen(open ? true : false)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search menu...`}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-2.5 mt-4">
            {filteredData.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                {searchTerm
                  ? "No matching items found"
                  : data.length === 0
                  ? "No history found"
                  : "No items to display"}
              </div>
            ) : (
              filteredData.map((prompt: any) => (
                <div
                  key={prompt.form_id}
                  className="hover:bg-secondary cursor-pointer p-2.5 rounded-md"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex justify-between items-center gap-2">
                      {prompt.bookmark && (
                        <Bookmark className="h-5 w-5 fill-primary text-primary" />
                      )}

                      <Link
                        href={`${
                          mode === "AI-Chat"
                            ? `/aichat/ai_mode/${prompt.form_id}?mode=ai`
                            : `/aichat/${prompt.form_id}`
                        }`}
                      >
                        {prompt.form_name}
                      </Link>
                    </div>
                    <Trash className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuBar;
