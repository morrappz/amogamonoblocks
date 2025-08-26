import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";

interface DataTableRowProps {
  formId: string;
  shareUrl: string;
  user_name: string;
  business_number: string | number;
}

const DataTableRowActions = ({
  formId,
  shareUrl,
  user_name,
  business_number,
}: DataTableRowProps) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <Link href={`/form_maker/edit/${formId}`}>
            <DropdownMenuItem>Edit form</DropdownMenuItem>
          </Link>
          <a
            href={`/submit/${shareUrl}/business_number=${business_number}/user_name=${user_name}`}
            target="_blank"
          >
            <DropdownMenuItem>View form</DropdownMenuItem>
          </a>
          <Link href={`/form_maker/view/${formId}`}>
            <DropdownMenuItem>View Data</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableRowActions;
