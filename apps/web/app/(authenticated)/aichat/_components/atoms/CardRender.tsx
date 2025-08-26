"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface PageProps {
  data: unknown[];
  columns: string[] | undefined;
}

const CardRender = ({ data, columns }: PageProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!data) {
    toast.error("No Data Avaliable");
  }

  return (
    <div className="">
      <Card>
        <CardContent className="p-2.5 space-y-2.5">
          {!columns && <div>No Data Avaliable.</div>}
          {columns?.map((column, index) => (
            <div key={index} className="flex  items-center gap-2.5">
              <p className="capitalize text-muted-foreground">{column}:</p>
              <p className="font-semibold">
                {data && data?.length > 0 && data[currentIndex][column]}
              </p>
            </div>
          ))}
        </CardContent>
        {columns && (
          <CardFooter className="flex justify-center items-center gap-2.5">
            <Button
              variant={"outline"}
              disabled={currentIndex === 0}
              size={"icon"}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <span>
              {currentIndex + 1} / {data?.length}
            </span>
            <Button
              disabled={currentIndex === data.length - 1}
              variant={"outline"}
              size={"icon"}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CardRender;
