import { cn } from "@/utils/cn";
import React, { FormEvent, ReactNode } from "react";

import {
  ArrowUp,
  Bot,
  FileJson,
  Globe,
  LoaderCircle,
  MessageCircle,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Query } from "../types/types";

export function AssistantInput(props: {
  onSubmit: () => Promise<void>;

  value: string;
  setValue: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
}) {
  const disabled = props.loading;
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.onSubmit();

        // props.onSubmit(e);
      }}
      className={cn("flex w-full flex-col", props.className)}
    >
      <div className="border border-input bg-secondary rounded-lg flex flex-col gap-2 max-w-[768px] w-full mx-auto">
        <input
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.setValue(e.target.value)}
          className="border-none outline-none bg-transparent p-4"
        />

        <div className="flex justify-between ml-4 mr-2 mb-2">
          <div className="flex gap-3">{props.children}</div>

          <div className="flex gap-2 self-end">
            <Button
              size={"icon"}
              type="submit"
              className="self-end rounded-full"
              disabled={disabled}
            >
              {props.loading ? (
                <span role="status" className="flex justify-center">
                  <LoaderCircle className="animate-spin" />
                  <span className="sr-only">Loading...</span>
                </span>
              ) : (
                <span>
                  <ArrowUp className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
