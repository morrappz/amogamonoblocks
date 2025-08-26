/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Building2,
  Edit,
  Eye,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const Contacts = ({ contacts }: { contacts: any }) => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="flex flex-col mt-4 gap-4 w-full items-center">
        <div className="flex w-full  gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Contacts"
              className="pl-10 text-md"
            />
          </div>
          <Link href="/chat/contacts/new">
            <Button size={"icon"}>
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4 w-full">
          {contacts
            .filter((item: any) => {
              const searchTerm = search.toLowerCase();
              return item?.user_name?.toLowerCase().includes(searchTerm);
              //   item.business_name.toLowerCase().includes(searchTerm)
            })
            .map((item: any) => (
              <Card key={item.user_catalog_id} className="py-2 px-2">
                <CardContent className="space-y-[10px] px-2 py-2">
                  <h2 className="font-semibold text-md">{item.user_name}</h2>
                  <p className="text-md text-muted-foreground">
                    {item.designation}
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{item.user_email}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{item.user_mobile}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{item.business_postcode}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span>{item.department}</span>
                  </p>

                  <div className="flex justify-between items-center">
                    <p className="text-md flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                      <span>{item.business_name}</span>
                    </p>
                    <div className="flex gap-1.5 md:gap-2 space-x-2">
                      <Link
                        href={`/chat/contacts/view/${item.user_catalog_id}`}
                      >
                        <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                      </Link>
                      <Link
                        href={`/chat/contacts/edit/${item.user_catalog_id}`}
                      >
                        <Edit className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                      </Link>
                      <Link
                        href={`/chat/contacts/messages/${item.user_catalog_id}`}
                      >
                        <MessageCircle className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
