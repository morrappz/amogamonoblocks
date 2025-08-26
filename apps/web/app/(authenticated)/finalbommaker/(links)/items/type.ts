import type { Tables } from "@/types/database";

export const finalBomItemStatuses = ["active", "inactive", "draft"] as const;

export type FinalBomItemStatus = (typeof finalBomItemStatuses)[number];

export type FinalBomItem = Omit<Tables<"final_bom_item">, "status"> & {
  status: FinalBomItemStatus;
};
