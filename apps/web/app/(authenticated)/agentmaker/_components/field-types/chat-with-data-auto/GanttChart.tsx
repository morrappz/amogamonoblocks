/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function GanttChart({ data }: { data: any }) {
  // Initialize currentDate to the start date of the first task, or today if no tasks
  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(() => {
    if (data?.length > 0) {
      for (const item of data) {
        if (item?.plan_start_date) {
          try {
            const date = new Date(item.plan_start_date);
            if (!isNaN(date.getTime())) {
              return date;
            }
          } catch (error) {
            console.error("Error parsing date:", error);
          }
        }
      }
    }
    return new Date();
  });

  const handlePrev = () => {
    if (viewType === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subYears(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addYears(currentDate, 1));
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getProgressColor = (progress: number | null, status: string) => {
    if (status === "InActive") return "bg-gray-300";
    if (progress === null) return "bg-blue-500";
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const isDateInPlan = (
    date: Date,
    startDateStr: string,
    endDateStr: string
  ) => {
    if (!startDateStr || !endDateStr) return false;

    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

      return isWithinInterval(date, { start: startDate, end: endDate });
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  };

  const isMonthInPlan = (
    month: Date,
    startDateStr: string,
    endDateStr: string
  ) => {
    if (!startDateStr || !endDateStr) return false;

    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      return (
        isWithinInterval(monthStart, { start: startDate, end: endDate }) ||
        isWithinInterval(monthEnd, { start: startDate, end: endDate }) ||
        isWithinInterval(startDate, { start: monthStart, end: monthEnd })
      );
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  };

  const formatDate = (dateString: any): string => {
    if (!dateString) return "Not Set";

    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid Date";
    }
  };

  if (!data || data.length === 0) {
    return <div>No tasks to display</div>;
  }

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col md:flex-row items-center w-full justify-between mb-6">
        <h2 className="text-md font-bold">Task Timeline</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() =>
                setViewType(viewType === "month" ? "year" : "month")
              }
            >
              <Calendar className="h-5 w-5" />
              {viewType === "month"
                ? "Switch to Year View"
                : "Switch to Month View"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-0" onClick={handlePrev}>
              <LuChevronLeft className="h-5 w-5" />
            </Button>
            <span>
              {viewType === "month"
                ? format(currentDate, "MMMM yyyy")
                : format(currentDate, "yyyy")}
            </span>
            <Button variant="outline" className="border-0" onClick={handleNext}>
              <LuChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[150px_1fr] md:grid-cols-[300px_1fr] gap-6">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data
                .filter(
                  (item: any) => item.plan_start_date && item.plan_end_date
                )
                .map((item: any) => {
                  // const startDate = new Date(item.plan_start_date);
                  // const endDate = new Date(item.plan_end_date);
                  // const shouldShowPlan =
                  //   startDate &&
                  //   endDate &&
                  //   (isSameMonth(startDate, currentDate) ||
                  //     isSameMonth(endDate, currentDate) ||
                  //     (currentDate > startDate && currentDate < endDate));
                  return (
                    <tr key={item.task_id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        Task #{item.task_id}
                        <br />
                        {item.progress_percent !== null &&
                          `${item.progress_percent}%`}
                        <br />
                        {item.status}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.plan_start_date)}
                        <br />
                        {formatDate(item.plan_end_date)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="overflow-auto">
          <div className="min-w-full">
            {viewType === "month" ? (
              <>
                <div className="grid grid-cols-[repeat(31,minmax(30px,1fr))] border-b border-gray-200">
                  {daysInMonth.map((day) => (
                    <div
                      key={day.toString()}
                      className="text-center text-xs text-gray-600 py-2 border-r border-gray-200 last:border-r-0"
                    >
                      <div className="font-medium">{format(day, "dd")}</div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {data
                    .filter(
                      (item: any) => item.plan_start_date && item.plan_end_date
                    )
                    .map((item: any) => {
                      const startDate = new Date(item.plan_start_date);
                      const endDate = new Date(item.plan_end_date);

                      if (
                        isNaN(startDate.getTime()) ||
                        isNaN(endDate.getTime())
                      ) {
                        return null;
                      }
                      const shouldShowPlan =
                        isSameMonth(startDate, currentDate) ||
                        isSameMonth(endDate, currentDate) ||
                        (currentDate > startDate && currentDate < endDate);
                      return (
                        <div
                          key={item.task_id}
                          className="grid grid-cols-[repeat(31,minmax(30px,1fr))] border-b border-gray-200"
                        >
                          {daysInMonth.map((day) => (
                            <div
                              key={day.toISOString()}
                              className={`h-8 border-r border-b border-gray-200 last:border-r-0 ${
                                isDateInPlan(
                                  day,
                                  item.plan_start_date,
                                  item.plan_end_date
                                ) && shouldShowPlan
                                  ? getProgressColor(
                                      item.progress_percent,
                                      item.status
                                    )
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 border-b border-gray-200">
                  {monthsInYear.map((month) => (
                    <div
                      key={month.toString()}
                      className="text-center text-sm text-gray-600 py-2 border-r border-gray-200 last:border-r-0"
                    >
                      {format(month, "MMM")}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {data
                    .filter(
                      (item: any) => item.plan_start_date && item.plan_end_date
                    )
                    .map((item: any) => {
                      const startDate = new Date(item.plan_start_date);
                      const endDate = new Date(item.plan_end_date);
                      if (
                        isNaN(startDate.getTime()) ||
                        isNaN(endDate.getTime())
                      ) {
                        return null;
                      }
                      const shouldShowPlan =
                        isSameYear(currentDate, startDate) ||
                        isSameYear(currentDate, endDate) ||
                        (currentDate > startDate && currentDate < endDate);

                      return (
                        <div
                          key={item.task_id}
                          className="grid grid-cols-12 border-b border-gray-200"
                        >
                          {monthsInYear.map((month) => (
                            <div
                              key={month.toString()}
                              className={`h-8 border-r border-gray-200 last:border-r-0 ${
                                isMonthInPlan(
                                  month,
                                  item.plan_start_date,
                                  item.plan_end_date
                                ) && shouldShowPlan
                                  ? getProgressColor(
                                      item.progress_percent,
                                      item.status
                                    )
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-6 justify-end">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-gray-300 rounded" />
          <span className="text-sm">Inactive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-blue-500 rounded" />
          <span className="text-sm">No Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-red-500 rounded" />
          <span className="text-sm">&lt; 50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-yellow-500 rounded" />
          <span className="text-sm">&gt;= 50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-green-500 rounded" />
          <span className="text-sm">Complete</span>
        </div>
      </div>
    </div>
  );
}
