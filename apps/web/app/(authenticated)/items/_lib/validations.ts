import { type Product, productStatuses } from "../type";
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
  sort: getSortingStateParser<Product>().withDefault([
    { id: "created_date", desc: true },
  ]),
  query: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(productStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(productStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createProductSchema = z.object({
  status: z.enum(productStatuses),
  product_title: z.string().min(1, "required"),
  product_small_image_link:z.string().optional(),
  product_category: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  product_number: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  product_short_description:z.string().optional().transform((val) => {
    // Transform empty string or undefined to null
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  uom:z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  fifo_price:z.number().optional(),
  moving_average_price:z.number().optional(),
  recent_purchase_price:z.number().optional()
});

export const updateProductSchema = z.object({
  status: z.enum(productStatuses),
  product_title: z.string().min(1, "required"),
  product_small_image_link:z.string().optional(),
  product_category: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  product_number: z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  product_short_description:z.string().optional().transform((val) => {
    // Transform empty string or undefined to null
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  uom:z.string().optional().transform((val) => {
    return val?.trim() === "" || val === undefined ? null : val;
  }).nullable(),
  fifo_price:z.number().optional(),
  moving_average_price:z.number().optional(),
  recent_purchase_price:z.number().optional()
});

export const quickUpdateProductSchema = z.object({
  status: z.enum(productStatuses),
});

export type GetProductsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type QuickUpdateProductSchema = z.infer<typeof quickUpdateProductSchema>;
