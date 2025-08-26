import { type FinalBomItem, finalBomItemStatuses } from "../type";
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
  sort: getSortingStateParser<FinalBomItem>().withDefault([
    { id: "created_date", desc: true },
  ]),
  query: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(finalBomItemStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(finalBomItemStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createFinalBomItemSchema = z.object({
  status: z.enum(finalBomItemStatuses),
  type: z.string().min(1, "required"),
  source: z.string().min(1, "required"),
  nature: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  combination: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  c_part_no: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  c_part_name: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  qty:z.number().optional(),
  uom: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  price:z.number().optional(),
  amount:z.number().optional()
});

export const updateFinalBomItemSchema = z.object({
  status: z.enum(finalBomItemStatuses),
  type: z.string().min(1, "required"),
  source: z.string().min(1, "required"),
  nature: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  combination: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  c_part_no: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  c_part_name: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  qty:z.number().optional(),
  uom: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  price:z.number().optional(),
  amount:z.number().optional()
});

export const quickUpdateFinalBomItemSchema = z.object({
  status: z.enum(finalBomItemStatuses),
});

export type GetFinalBomItemSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateFinalBomItemSchema = z.infer<typeof createFinalBomItemSchema>;
export type UpdateFinalBomItemSchema = z.infer<typeof updateFinalBomItemSchema>;
export type QuickUpdateFinalBomItemSchema = z.infer<typeof quickUpdateFinalBomItemSchema>;
