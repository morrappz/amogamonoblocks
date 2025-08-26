import type { Tables } from "@/types/database";

export type MyDoc = Omit<Tables<"mydocs">, "status"> & {
  status: MyDocStatus;
};

export type MyDocStatus = "inactive" | "active" | "canceled";
export const myDocStatuses: [MyDocStatus, ...MyDocStatus[]] = [
  "inactive",
  "active",
  "canceled",
];

export interface MyDocActions {
  mydoc_id: number;
  status: MyDocStatus;
  created_date: Date;
  updated_date?: Date;
  doc_name?: string;
  shareurl?: string;
}

export type NewMyDoc = Omit<MyDocActions, "created_date" | "updated_date">;

export type MyDocs = MyDoc[];
