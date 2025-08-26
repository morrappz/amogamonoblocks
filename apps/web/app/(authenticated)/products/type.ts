import { DataTableRowAction } from "@/types";
import type { Tables } from "@/types/database";
import { Row } from "@tanstack/react-table";

export const productStatuses = ["active", "inactive", "draft"] as const;

export const publishStatuses = ["published", "draft"] as const;

export type ProductStatus = (typeof productStatuses)[number];
export type PublishStatus = (typeof publishStatuses)[number];

export type Product = Omit<Tables<"product">, "status"> & {
  status: ProductStatus;
  product_name: string;
  product_code: string;
  product_short_description: string;
  product_start_date: string | null;
  product_end_date: string | null;
  product_publish_date: string | null;
  product_publish_status: PublishStatus;
  product_group: string;
  product_category: string;
  uom: string;
  manage_stock: boolean;
  hsn_number: string;
  product_number: string;
  price: number | null;
  product_small_image_link: string;
};

export type ExtendedRowAction =
  | DataTableRowAction<Product>
  | { type: "enhancer"; row: Row<Product> | null }
  | null;
