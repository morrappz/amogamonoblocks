import type { Tables } from "@/types/database";

export const productStatuses = ["active", "inactive", "draft"] as const;

export type ProductStatus = (typeof productStatuses)[number];

export type Product = Omit<Tables<"product">, "status"> & {
  status: ProductStatus;
};
