import { type FinalBom, FinalBomStatuses } from "../type";
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
  sort: getSortingStateParser<FinalBom>().withDefault([
    { id: "created_date", desc: true },
  ]),
  bom_name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(FinalBomStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(FinalBomStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createFinalBomSchema = z.object({
  status: z.enum(FinalBomStatuses),
  model: z.string().min(1, "required"),
  variant:z.string().min(1, "required"),
  file_name:z.string().optional(),
  data_upload_id: z.number().optional(),
  bom_name: z.string().min(1, "required"),
  bom_description:z.string().optional()
});

export const updateFinalBomSchema = z.object({
  status: z.enum(FinalBomStatuses),
  model: z.string().min(1, "required"),
  variant:z.string().min(1, "required"),
  file_name:z.string().optional(),
  data_upload_id: z.number().optional(),
  bom_name: z.string().min(1, "required"),
  bom_description:z.string().optional()
  // updated_date: z.string().datetime({ offset: true }).optional(),
});

export type GetFinalBomSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateFinalBomSchema = z.infer<typeof createFinalBomSchema>;
export type UpdateFinalBomSchema = z.infer<typeof updateFinalBomSchema>;
