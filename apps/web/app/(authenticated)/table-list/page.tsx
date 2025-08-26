import * as React from "react";

import { DataTableSkeleton } from "./_components/data-table-skeleton";
import { Shell } from "@/components/shell";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { Table } from "./_components/table";
import { Metadata } from "next";
import { dummyContacts } from "./dummy-data";
import { contactStatuses } from "./type";

export const metadata: Metadata = {
  title: "Contacts",
  description: "Manage your contacts",
};

export default function TableListPage() {
  // Compute status counts for filters
  const statusCounts = contactStatuses.reduce((acc, status) => {
    acc[status] = dummyContacts.filter((c) => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Shell className="gap-2">
      <div className="pb-2">
        <p className="text-muted-foreground">Manage your table list</p>
      </div>
      <FeatureFlagsProvider>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={4}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <Table data={dummyContacts} statusCounts={statusCounts} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
