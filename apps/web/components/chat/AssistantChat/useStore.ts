import { create } from "zustand";
import { ChartData } from "../types/types";

type Chart = {
  chartData: ChartData;
  setChartData: (value: ChartData) => void;
};

export const useChatStore = create<Chart>((set) => ({
  chartData: {} as ChartData,
  setChartData: (value) => set({ chartData: value }),
}));
