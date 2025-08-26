/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface MetricsContextType {
  metrics: Record<string, any> | null;
  setMetrics: (data: Record<string, any> | null) => void;
}

const MetricContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);

  return (
    <MetricContext.Provider value={{ metrics, setMetrics }}>
      {children}
    </MetricContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricContext);
  if (!context) {
    throw new Error("useMetrics must be used within a MetricProvider");
  }
  return context;
};
