import type { SearchParams } from "@/types";
import * as React from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { RecordsTable } from "./_components/table";
import { getRecords } from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";
import { postgrest } from "@/lib/postgrest";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Month Stock Upload",
  description: "View your Month Stock Upload data",
};

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
  params: Promise<{ id: number }>;
}

export default async function IndexPage(props: IndexPageProps) {
  const params = await props.params;
  if (!params.id) {
    return <div>Invalid ID</div>;
  }

  const { data, error } = await postgrest
    .from("data_upload")
    .select(
      "data_upload_id, template_name, template_id, file_uuid, data_table_name, data_upload_uuid"
    )
    .eq("data_upload_id", params.id)
    .single();

  if (error || !data) {
    console.error("Error fetching Month Stock Upload data:", error);
    return <div>Error fetching Month Stock Upload data</div>;
  }

  if (!data.template_id) {
    return <div>Template ID is missing</div>;
  }

  if (!data.data_table_name) {
    return <div>Data table name is missing</div>;
  }

  if (!data.data_upload_uuid) {
    return <div>Data table name is missing</div>;
  }

  const { data: templateData, error: templateError } = await postgrest
    .from("data_upload_setup")
    .select("data_upload_setup_id, template_file_fields_json")
    .eq("data_upload_setup_id", data.template_id)
    .single();

  if (templateError || !templateData) {
    return <div>Error fetching template data</div>;
  }

  const templateFields = Object.values(
    templateData.template_file_fields_json || {}
  ).map((value: { field_name: string }) => value.field_name);

  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getRecords({
      ...search,
      filters: validFilters,
      tableName: data.data_table_name,
      templateFields: templateFields,
      dataUploadId: data.data_upload_uuid,
    }),
  ]);

  return (
    <Shell className="gap-2">
      <div className="pb-2">
        <p className="text-muted-foreground">
          view the uploaded Month Stock data
        </p>
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
          <RecordsTable
            promises={promises}
            templateFields={templateFields}
            validFilters={validFilters}
            searchParams={search}
            tableName={data.data_table_name}
            dataUploadUuid={data.data_upload_uuid}
          />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
