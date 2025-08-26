/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table/data-table";
import { columns } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { NEXT_PUBLIC_API_KEY, SAVE_FORM_DATA } from "@/constants/envConfig";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { useSession } from "next-auth/react";
import { Session } from "../BoardMaker";

function Loading() {
  return <div>Loading...</div>;
}

function ErrorDisplay({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}

function FormsDataTable() {
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromDate, setFromDate] = useState<any>(undefined);
  const [toDate, setToDate] = useState<any>(undefined);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const handleFromDateSelect = (date: Date | undefined) => {
    if (date) {
      setFromDate(date);
    }
  };

  const handleToDateSelect = (date: Date | undefined) => {
    if (date) {
      setToDate(date);
    }
  };

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch(`${SAVE_FORM_DATA}?form_group=eq.Agents`, {
          headers: {
            Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch API data");
        }
        const data = await response.json();
        const filteredData = data.filter(
          (item: any) => item.business_number === session?.user?.business_number
        );
        setApiData(filteredData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [session]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="space-x-2">
            <Button
              variant="outline"
              className="rounded-full border-secondary"
              size="sm"
            >
              Recent
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-secondary"
              size="sm"
            >
              Today
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-secondary"
              size="sm"
            >
              This Week
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-secondary"
              size="sm"
            >
              This Month
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-secondary"
              size="sm"
            >
              This Year
            </Button>
          </div>
          <div className="flex pl-3 items-center gap-2">
            <span className="text-sm">From</span>
            <CalendarDatePicker
              date={fromDate}
              onDateSelect={handleFromDateSelect}
              placeholder="From Date"
            />
            <span className="text-sm">To</span>
            <CalendarDatePicker
              date={toDate}
              onDateSelect={handleToDateSelect}
              placeholder="To Date"
            />
          </div>
        </div>

        <DataTable columns={columns} data={apiData} />
      </div>
    </div>
  );
}

export default function Page() {
  return <FormsDataTable />;
}
