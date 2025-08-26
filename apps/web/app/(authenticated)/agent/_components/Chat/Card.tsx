/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bookmark,
  Dock,
  File,
  Heart,
  Link,
  MessageCircle,
  Share,
  Share2,
  Table,
  ImageDown,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { FaFilePdf } from "react-icons/fa";
// import DataCard from "../../AgentMaker/field-components/MediaPieChart";
import DataCard from "@/app/(authenticated)/agentmaker/_components/field-components/MediaPieChart";
import MediaDataLineChart from "@/app/(authenticated)/agentmaker/_components/field-components/MediaDataLineChart";
import MediaDataBarChart from "@/app/(authenticated)/agentmaker/_components/field-components/MediaDataBarChart";
import MediaDataBarHorizontalChart from "@/app/(authenticated)/agentmaker/_components/field-components/MediaDataBarHorizontalChart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// import {
//   generateChartConfig,
//   generateQuery,
//   runGenerateSQLQuery,
// } from "@/app/(authenticated)/agentmaker/_components/actions";
// import { toast } from "sonner";

const getFileIcon = (fileName: any) => {
  const extension = fileName.split(".").pop().toLowerCase();
  switch (extension) {
    case "png":
    case "jpg":
      return <ImageDown className="w-8 h-8" />;
    case "mp4":
    case "pdf":
      return <FaFilePdf className="w-8 h-8 text-red-500" />;
    case "doc":
    case "docx":
      return <Dock className="w-8 h-8 text-blue-500" />;
    case "xls":
    case "xlsx":
    case "csv":
      return <Table className="w-8 h-8 text-green-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const CardRender = ({
  field,
  handleRadioChange,
  setLoading,
  // setResults,
  // setColumns,
  // setChartConfig,
  setComponentName,
  setApiData,
}: // session,
any) => {
  const totalRevenue =
    (field?.cardui_json?.length > 0 &&
      field?.cardui_json?.[0]?.media_card_data?.card_json?.reduce(
        (sum: number, item: any) => sum + item.revenue,
        0
      )) ||
    0;

  // const handleSubmit = async (suggestion: any, dataFilter: any) => {
  //   setLoading(true);
  //   const question = suggestion;
  //   if (!suggestion) return;
  //   try {
  //     const query = await generateQuery(question, session, dataFilter);

  //     if (query === undefined) {
  //       toast.error("An error occurred. Please try again.");
  //       return;
  //     }
  //     const data = await runGenerateSQLQuery(query);
  //     const columns = data.length > 0 ? Object.keys(data[0]) : [];
  //     setResults(data);
  //     setColumns(columns);
  //     const generation = await generateChartConfig(data, question);
  //     setChartConfig(generation.config);
  //     setLoading(false);
  //   } catch (e) {
  //     console.log("error----", e);
  //     setLoading(false);
  //     toast.error("An error occurred. Please try again.");
  //   }
  // };

  const handleRadioChangeInternal = (value: string) => {
    const selectedItem = field?.cardui_json?.[0]?.chat_with_data?.buttons?.find(
      (item: any) => item?.button_text === value
    );
    if (selectedItem) {
      setComponentName(selectedItem);
      // if (selectedItem?.enable_prompt) {
      //   handleSubmit(selectedItem?.prompt, selectedItem?.prompt_dataFilter);
      // }
      if (selectedItem?.enable_api || selectedItem?.enable_dataApi) {
        setApiData(selectedItem);
        setLoading(false);
      }
    }

    if (handleRadioChange) {
      handleRadioChange(value);
    }
  };

  const renderElement = (item: any) => {
    if (!item || !item.type) return null;

    switch (item.type) {
      case "Heading":
        return (
          <h5
            key={item.text}
            className={`${
              item.weight === "bolder" ? "font-bold text-2xl" : "font-normal"
            } ${
              item.isSubtle ? "text-gray-500" : "text-gray-900"
            } dark:text-white`}
          >
            {item.text}
          </h5>
        );
      case "Paragraph":
        return (
          <p
            key={item.text}
            className={`${
              item.weight === "bolder" ? "font-bold text-2xl" : "font-normal"
            } ${
              item.isSubtle ? "text-gray-500" : "text-gray-900"
            } dark:text-white`}
          >
            {item.text}
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full   overflow-hidden">
        <CardHeader>
          <CardTitle className="">
            {field?.label && JSON.parse(field?.label)}
          </CardTitle>
          <CardDescription>
            {field?.description && JSON.parse(field?.description)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="relative w-full aspect-video bg-muted">
            {field?.cardui_json?.[0]?.media_card_data?.media_url &&
              field?.cardui_json?.[0]?.media_card_data?.card_type ===
                "Image" && (
                <Image
                  src={field?.cardui_json?.[0]?.media_card_data?.media_url}
                  alt="Media Image"
                  layout="fill"
                />
              )}
            {field?.cardui_json?.[0]?.media_card_data?.media_url &&
              field?.cardui_json?.[0]?.media_card_data?.card_type === "Video" &&
              (field?.cardui_json?.[0]?.media_card_data?.media_url.startsWith(
                "http"
              ) ? (
                /(youtube\.com|youtu\.be)/.test(
                  field?.cardui_json?.[0]?.media_card_data?.media_url
                ) ? (
                  <iframe
                    src={field?.cardui_json?.[0]?.media_card_data?.media_url.replace(
                      "watch?v=",
                      "embed/"
                    )}
                    title="video-preview"
                    className="h-64 w-full"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={field?.cardui_json[0]?.media_card_data?.media_url}
                    controls
                    className="h-fit w-full"
                  />
                )
              ) : (
                <video
                  src={field?.cardui_json[0]?.media_card_data?.media_url}
                  controls
                  className="h-fit w-full"
                />
              ))}
            {field?.cardui_json?.[0]?.media_card_data?.media_url &&
              field?.cardui_json?.[0]?.media_card_data?.card_type ===
                "File" && (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {getFileIcon(
                      field?.cardui_json[0]?.media_card_data?.media_url
                        .split("/")
                        .at(-1)
                    )}
                  </div>
                  <div className="text-sm flex flex-wrap max-w-[80%] text-wrap text-primary  truncate">
                    {field?.cardui_json[0]?.media_card_data?.media_url
                      .split("/")
                      .at(-1)}
                  </div>
                </div>
              )}
            {field?.cardui_json?.[0]?.media_card_data?.media_url &&
              field?.cardui_json?.[0]?.media_card_data?.card_type === "Pdf" && (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="text-4xl font-bold text-primary mb-2">
                    <FaFilePdf className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-sm flex flex-wrap max-w-[80%] text-wrap text-primary  truncate">
                    {field?.cardui_json?.[0]?.media_card_data?.media_url
                      .split("/")
                      .at(-1)}
                  </div>
                </div>
              )}
            {field?.cardui_json?.[0]?.media_card_data?.media_url &&
              field?.cardui_json?.[0]?.media_card_data?.card_type ===
                "Page URL" && (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="flex gap-2.5 max-w-[80%] flex-wrap items-center">
                    <div className="flex items-center gap-2 w-full">
                      {getFileIcon(
                        field?.cardui_json?.[0]?.media_card_data?.media_url
                      )}
                      <span className="flex-1 text-primary text-sm break-words overflow-hidden text-ellipsis">
                        {field?.cardui_json?.[0]?.media_card_data?.media_url}
                      </span>
                    </div>
                    <div className="flex  justify-center w-full">
                      <a
                        href={
                          field?.cardui_json?.[0]?.media_card_data?.media_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <Button
                          type="button"
                          className="flex  items-center gap-1"
                        >
                          <Link className="h-5 w-5" />
                          Open Link
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            {field?.cardui_json?.[0]?.media_card_data?.card_type ===
              "Data card" && (
              <div className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle>${totalRevenue}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
            {field?.cardui_json?.[0]?.media_card_data?.card_type ===
              "Chart card" &&
              (field?.cardui_json?.[0]?.media_card_data?.component_name ===
              "Data Card Donut Chart" ? (
                <DataCard field={field} />
              ) : field?.cardui_json?.[0]?.media_card_data?.component_name ===
                "Data Card Line Chart" ? (
                <MediaDataLineChart field={field} />
              ) : field?.cardui_json?.[0]?.media_card_data?.component_name ===
                "Data Card Bar Chart" ? (
                <MediaDataBarChart field={field} />
              ) : field?.cardui_json?.[0]?.media_card_data?.component_name ===
                "Data Card Bar Chart Horizontal" ? (
                <MediaDataBarHorizontalChart field={field} />
              ) : null)}
          </div>
          <div className="p-2.5">
            <div
              className="px-6 py-2 prose prose-sm max-w-none break-words"
              style={{
                width: "100%",
                overflowWrap: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
              }}
              dangerouslySetInnerHTML={{
                __html: field?.cardui_json?.[0]?.media_card_data?.custom_html,
              }}
            />
          </div>
          <div className="p-4">
            {field?.cardui_json?.[0]?.media_card_data?.card_json &&
              field?.cardui_json?.[0]?.media_card_data?.card_json[0]?.body?.[0]?.columns?.map(
                (column: any, colIndex: any) => (
                  <div key={colIndex} className={`w-${column.width}/3`}>
                    {column.items?.map((item: any) => renderElement(item))}
                  </div>
                )
              )}
          </div>

          {field?.cardui_json?.[0]?.chat_with_data?.buttons && (
            <div className="p-4">
              <RadioGroup
                value={field?.cardui_json?.[0]?.chat_with_data?.preference}
                onValueChange={handleRadioChangeInternal}
                className="flex w-full flex-wrap items-center"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {field?.cardui_json?.[0]?.chat_with_data?.buttons?.map(
                    (item: any, index: any) =>
                      item?.button_text ? (
                        <div
                          key={index}
                          className="flex border rounded-full p-2.5 items-center gap-2"
                        >
                          <RadioGroupItem
                            value={item?.button_text}
                            id={index}
                          />
                          <Label htmlFor={index}>{item?.button_text}</Label>
                        </div>
                      ) : null
                  )}
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pb-2">
          <Button variant="ghost" size="icon">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">Bookmark</span>
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CardRender;
