"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import useSWR from "swr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Template = {
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
      console.log(res);
      return res;
    });

export default function Step2({
  selectedTemplate,
  finalBomData,
  setFinalBomData,
  rawBomCount,
  setRawBomCount
}: {
  selectedTemplate: Template | undefined;
  finalBomData: Record<string, string>[] | undefined;
  setFinalBomData: React.Dispatch<
    React.SetStateAction<Record<string, string>[] | undefined>
  >;
  rawBomCount: number;
  setRawBomCount: React.Dispatch<React.SetStateAction<number>>;
}) {

const [finalBomCount, setFinalBomCount] = useState(0);
const [progress, setProgress] = useState(0);
const [isProcessing, setIsProcessing] = useState(false);
const [success, setSuccess] = useState(false);

const handleProcess = async () => {
  setIsProcessing(true);
  setSuccess(false);
  setProgress(0);
  setFinalBomCount(0);

  // Simulate progress
  let value = 0;
  const interval = setInterval(() => {
    value += 5;
    if (value >= 100) {
      clearInterval(interval);
      setProgress(100);
      setFinalBomCount(finalBomData?.length ?? 0);
      setSuccess(true);
      setIsProcessing(false);
    } else {
      setProgress(value);
    }
  }, 150);
};

  const id = selectedTemplate?.data_upload_id;
  const model = selectedTemplate?.model_name;
  const variant = selectedTemplate?.variant_name;
  const frame = selectedTemplate?.data_combination_json?.frame;
  const engine = selectedTemplate?.data_combination_json?.engine;
  const mission = selectedTemplate?.data_combination_json?.mission;

  const {
    data: response,
    error,
    isLoading
  } = useSWR(
    id ? `/api/final-bom-data/rawbomdata?id=${id}&frame=${frame}&engine=${engine}&mission=${mission}&model=${model}&variant=${variant}` : null,
    fetcher
  );

  useEffect(() => {
    if (response?.data) {
      setFinalBomData(response?.data ?? []);
      setRawBomCount(response?.rawBomCount ?? 0);
    }
  }, [response]);

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-xl font-bold">Review Raw BOM Data</h2>
      {isLoading && (
        <Loader
          className="mr-2 size-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-8 w-full">
      
        {/* BOM Counts */}
        <div className="grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-md font-medium mb-2">Raw BOM Rows</p>
            <Card className="p-6 text-3xl font-bold">{rawBomCount}</Card>
          </div>
          <div>
            <p className="text-md font-medium mb-2">Final BOM Rows</p>
            <Card className="p-6 text-3xl font-bold">{finalBomCount}</Card>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-full" />
            <span className="text-sm font-medium min-w-[40px]">
              {progress}%
            </span>
          </div>

          {success && (
            <div className="text-green-600 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Processing completed successfully!
            </div>
          )}

          <Button
            onClick={handleProcess}
            className="w-full bg-black text-white"
            disabled={isProcessing || rawBomCount === 0}
          >
            Process BOM Data
          </Button>
        </div>
      </div>
    </div>
  );
}
