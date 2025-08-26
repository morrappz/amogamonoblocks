import { type Product, productStatuses, publishStatuses } from "../type";
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
  product_name: z.string().min(1, "required"),
  product_code: z.string().optional(),
  product_short_description: z
    .string()
    .optional()
    .transform((val) => {
      // Transform empty string or undefined to null
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_start_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_end_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_publish_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_publish_status: z.enum(publishStatuses),
  product_group: z.string().optional(),
  product_category: z.string().optional(),
  uom: z
    .string()
    .min(1, "required")
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  manage_stock: z.boolean(),

  hsn_number: z.string().optional(),
  product_number: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  price: z.number().optional().nullable(),
  product_small_image_link: z.string().optional(),
});

export const updateProductSchema = z.object({
  status: z.enum(productStatuses),
  product_name: z.string().min(1, "required"),
  product_code: z.string().optional(),
  product_short_description: z
    .string()
    .optional()
    .transform((val) => {
      // Transform empty string or undefined to null
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_start_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_end_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_publish_date: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  product_publish_status: z.enum(publishStatuses),
  product_group: z.string().optional(),
  product_category: z.string().optional(),
  uom: z.string().min(1, "required"),
  manage_stock: z.boolean(),

  hsn_number: z.string().optional(),
  product_number: z
    .string()
    .optional()
    .transform((val) => {
      return val?.trim() === "" || val === undefined ? null : val;
    })
    .nullable(),
  price: z.number().optional().nullable(),
  product_small_image_link: z.string().optional(),
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
