import { type FinalBom, finalBomStatuses } from "../type";
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
  query: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(finalBomStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(finalBomStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createFinalBomSchema = z.object({
  status: z.enum(finalBomStatuses),
  bom_type: z.string().min(1, "required"),
  bom_name: z.string().min(1, "required"),
  bom_code: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  bom_description: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  model: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  variant: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  frame: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  engine: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  mission: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable()
});

export const updateFinalBomSchema = z.object({
  status: z.enum(finalBomStatuses),
  bom_type: z.string().min(1, "required"),
  bom_name: z.string().min(1, "required"),
  bom_code: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  bom_description: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  model: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  variant: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  frame: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  engine: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  mission: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable()
});

export const quickUpdateFinalBomSchema = z.object({
  status: z.enum(finalBomStatuses),
});

export type GetFinalBomSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateFinalBomSchema = z.infer<typeof createFinalBomSchema>;
export type UpdateFinalBomSchema = z.infer<typeof updateFinalBomSchema>;
export type QuickUpdateFinalBomSchema = z.infer<typeof quickUpdateFinalBomSchema>;
