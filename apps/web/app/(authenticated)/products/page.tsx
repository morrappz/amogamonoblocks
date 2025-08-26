import type { SearchParams } from "@/types";
import * as React from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { ProductsTable } from "./_components/table";
import {
  getDocumentCountByField,
  getProductGroups,
  getRecords,
} from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Products",
  description: "Manage your products",
};

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getRecords({
      ...search,
      filters: validFilters,
    }),
    getDocumentCountByField("status"),
  ]);

  const productGroups = await getProductGroups();

  return (
    <Shell className="gap-2">
      <div className="pb-2">
        <p className="text-muted-foreground">Manage your products</p>
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
          <ProductsTable promises={promises} productGroups={productGroups} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
