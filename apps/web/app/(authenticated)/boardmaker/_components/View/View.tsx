/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  NEXT_PUBLIC_API_KEY,
  SAVE_FORM_DATA,
  ADD_FORM_DATA,
} from "@/constants/envConfig";
import { usePathname } from "next/navigation";
import { DataTable } from "./data-table/data-table";
import { Button } from "@/components/ui/button";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import DataTableRowActions from "./data-table/data-table-row-actions";

const View = () => {
  const [formData, setFormData] = useState<any>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(undefined);
  const [toDate, setToDate] = useState<any>(undefined);
  const path = usePathname();
  const currentId = path.split("/").at(-1);

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
    const fetchData = async () => {
      try {
        // Fetch form setup
        const setupResponse = await fetch(
          `${SAVE_FORM_DATA}?form_id=eq.${currentId}`,
          {
            headers: {
              Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
            },
          }
        );
        const setupData = await setupResponse.json();

        // Generate columns based on custom_one
        if (setupData[0] && setupData[0].custom_one) {
          const customColumns = JSON.parse(setupData[0].custom_one).map(
            (columnName: string) => ({
              accessorKey: columnName,
              header: columnName,
              cell: ({ row }: any) => row.original.form_data[columnName],
            })
          );
          customColumns.push({
            id: "actions",
            header: "Actions",
            cell: () => <DataTableRowActions />,
          });
          setColumns(customColumns);
        }

        // Fetch form data
        const dataResponse = await fetch(
          `${ADD_FORM_DATA}?form_id=eq.${currentId}`,
          {
            headers: {
              Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
            },
          }
        );
        const formDataResult = await dataResponse.json();
        setFormData(formDataResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentId]);

  if (!formData.length || !columns.length) {
    return <div>Loading...</div>;
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

        <DataTable columns={columns} data={formData} />
      </div>
    </div>
  );
};

export default View;
