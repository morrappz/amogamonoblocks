import { type MyDoc, myDocStatuses } from "../type";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    []
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(12),
  sort: getSortingStateParser<MyDoc>().withDefault([
    { id: "created_date", desc: true },
  ]),
  doc_name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(myDocStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(myDocStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createMyDocSchema = z.object({
  status: z.enum(myDocStatuses),
  doc_name: z.string().min(1,"required"),
  shareurl: z.string().optional(),
  created_date: z.date().optional(),
  updated_date: z.date().optional(),
});

export const updateMyDocSchema = z.object({
  status: z.enum(myDocStatuses),
  doc_name: z.string().min(1,"required"),
  shareurl: z.string().optional(),
  created_date: z.date().optional(),
  updated_date: z.date().optional(),
});

export type GetMyDocsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateMyDocSchema = z.infer<typeof createMyDocSchema>;
export type UpdateMyDocSchema = z.infer<typeof updateMyDocSchema>;
