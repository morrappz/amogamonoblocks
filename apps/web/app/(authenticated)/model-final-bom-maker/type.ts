import type { Tables } from "@/types/database";

export type FinalBom = Omit<Tables<"final_bom">, "status"> & {
  status: FinalBomStatus;
};

export type FinalBomStatus = "active" | "inactive" | "canceled";
export const FinalBomStatuses: [FinalBomStatus, ...FinalBomStatus[]] = [
  "active",
  "inactive",
  "canceled",
];

export interface FinalBomActions {
  data_upload_id: number;
  status: FinalBomStatus;
  created_date: Date;
  updated_date?: Date;
  model?: string;
  variant?: string;
  bom_name?: string;
  file_name?: string; 
}

export type NewFinalBom = Omit<
  FinalBomActions,
  "created_date" | "updated_date"
>;

export type FinalBoms = FinalBom[];
