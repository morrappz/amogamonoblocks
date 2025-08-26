"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader } from "lucide-react";
import useSWR from "swr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiResponse {
  data?: Record<string, string>[];
  rawBomCount?: number;
  error?: string;
}

interface RawBomCountResponse {
  rawBomCount: number;
  error?: string;
}

type Template = {
  data_group_id: number;
  data_upload_id: number;
  file_name: string;
  model_name: string;
  variant_name: string;
  data_combination_json: Record<string, string>;
};

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) throw res.error;
      return res;
    });

const createQueryString = (template: Template): string => {
  const base = `/api/final-bom-data/rawbommodeldata?id=${template.data_upload_id}&data_group_id=${template.data_group_id}&model=${template.model_name}`;
  // const combinations = template.data_combination_json
  //   ?.map((v) => `frame=${v.frame}&engine=${v.engine}&mission=${v.mission}`)
  //   .join("&");
  return `${base}`;
};

export default function Step2({
  selectedTemplate,
  setFinalBomData,
  rawBomCount,
  setRawBomCount,
}: {
  selectedTemplate: Template | undefined;
  setFinalBomData: React.Dispatch<
    React.SetStateAction<Record<string, string>[] | undefined>
  >;
  rawBomCount: number;
  setRawBomCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const id = selectedTemplate?.data_upload_id;
  const queryString =
    id && selectedTemplate ? createQueryString(selectedTemplate) : null;

  const {
    data: AllRowBomCount,
    error: AllRowBomCountError,
    isLoading: AllRowBomCountLoading,
  } = useSWR<RawBomCountResponse>(
    id
      ? `/api/final-bom-data/rawbommodeldata?id=${id}&data_group_id=${selectedTemplate.data_group_id}&count_all=1`
      : null,
    fetcher
  );

  const {
    data: response,
    error: responseError,
    isLoading,
  } = useSWR<ApiResponse>(queryString, fetcher);

  useEffect(() => {
    if (response?.data) {
      setFinalBomData(response.data);
      setRawBomCount(response.rawBomCount ?? 0);
    }
  }, [response, setFinalBomData, setRawBomCount]);

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-xl font-bold">Review Raw BOM Data</h2>
      <div className="space-y-8 w-full">
        {/* BOM Counts */}
        <div className="grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-md font-medium mb-2">Raw BOM Rows</p>
            {AllRowBomCountLoading ? (
              <Skeleton className="h-[85px]" />
            ) : AllRowBomCountError ? (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{AllRowBomCountError}</AlertDescription>
              </Alert>
            ) : (
              <Card className="p-6 text-3xl font-bold h-[85px]">
                {AllRowBomCount?.rawBomCount}
              </Card>
            )}
          </div>
          <div>
            <p className="text-md font-medium mb-2">Model Final BOM Rows</p>
            <Card className="p-6 text-3xl font-bold h-[85px] flex justify-center">
              {isLoading ? (
                <div className="flex font-normal text-sm items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing data...
                </div>
              ) : (
                <>{rawBomCount}</>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          {!isLoading && response?.data && response.data.length !== 0 && (
            <Alert
              variant="default"
              className="w-full text-green-600 font-medium [&>svg]:text-green-600"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Data Loaded</AlertTitle>
              <AlertDescription>
                {response.data.length} rows of data processed successfully.
              </AlertDescription>
            </Alert>
          )}
          {responseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Processing Error</AlertTitle>
              <AlertDescription>{responseError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
