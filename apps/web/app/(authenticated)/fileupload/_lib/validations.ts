import { type FileUpload, FileUploadStatuses } from "../type";
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
  sort: getSortingStateParser<FileUpload>().withDefault([
    { id: "created_date", desc: true },
  ]),
  file_name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(FileUploadStatuses)).withDefault([]),
  priority: parseAsArrayOf(z.enum(FileUploadStatuses)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createFileUploadSchema = z.object({
  status: z.enum(FileUploadStatuses),
  file_name: z.string().min(1, "required"),
  file_description: z.string().optional(),
  file_publish_url: z.string().optional(),
});

export const updateFileUploadSchema = z.object({
  status: z.enum(FileUploadStatuses),
  file_name: z.string().min(1, "required"),
  file_description: z.string().optional(),
  file_publish_url: z.string().optional(),
  created_date: z.string().datetime({ offset: true }).optional(),
  // updated_date: z.string().datetime({ offset: true }).optional(),
});

export type GetFileUploadsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
export type CreateFileUploadSchema = z.infer<typeof createFileUploadSchema>;
export type UpdateFileUploadSchema = z.infer<typeof updateFileUploadSchema>;
