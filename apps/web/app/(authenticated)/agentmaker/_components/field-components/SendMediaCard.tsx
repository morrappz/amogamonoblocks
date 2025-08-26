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
import DataCard from "./MediaPieChart";
import MediaDataLineChart from "./MediaDataLineChart";
import MediaDataBarChart from "./MediaDataBarChart";
import MediaDataBarHorizontalChart from "./MediaDataBarHorizontalChart";

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

const SendMediaCard = ({ field }: any) => {
  const {
    custom_html = "",
    card_type = "",
    media_url = "",
    card_json = [],
    component_name = "",
  } = field?.media_card_data || {};

  const totalRevenue =
    card_json?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;

  return (
    <div>
      <Card className="w-full max-w-sm mx-auto overflow-hidden">
        <CardHeader>
          <CardTitle className="">{field?.label}</CardTitle>
          <CardDescription>{field?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="relative w-full aspect-video bg-muted">
            {media_url && card_type === "Image" && (
              <Image src={media_url} alt="Media Image" layout="fill" />
            )}
            {media_url &&
              card_type === "Video" &&
              (media_url.startsWith("http") ? (
                /(youtube\.com|youtu\.be)/.test(media_url) ? (
                  <iframe
                    src={media_url.replace("watch?v=", "embed/")}
                    title="video-preview"
                    className="h-64 w-full"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video src={media_url} controls className="h-fit w-full" />
                )
              ) : (
                <video src={media_url} controls className="h-fit w-full" />
              ))}
            {media_url && card_type === "File" && (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="text-4xl font-bold text-primary mb-2">
                  {getFileIcon(media_url.split("/").at(-1))}
                </div>
                <div className="text-sm flex flex-wrap max-w-[80%] text-wrap text-primary  truncate">
                  {media_url.split("/").at(-1)}
                </div>
              </div>
            )}
            {media_url && card_type === "Pdf" && (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="text-4xl font-bold text-primary mb-2">
                  <FaFilePdf className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-sm flex flex-wrap max-w-[80%] text-wrap text-primary  truncate">
                  {media_url.split("/").at(-1)}
                </div>
              </div>
            )}
            {media_url && card_type === "Page URL" && (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="flex gap-2.5 max-w-[80%] flex-wrap items-center">
                  <div className="flex items-center gap-2 w-full">
                    {getFileIcon(media_url)}
                    <span className="flex-1 text-primary text-sm break-words overflow-hidden text-ellipsis">
                      {media_url}
                    </span>
                  </div>
                  <div className="flex  justify-center w-full">
                    <a
                      href={media_url}
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
            {card_type === "Data card" && (
              <div className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle>${totalRevenue}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
            {card_type === "Chart card" &&
              (component_name === "Data Card Donut Chart" ? (
                <DataCard field={field} />
              ) : component_name === "Data Card Line Chart" ? (
                <MediaDataLineChart field={field} />
              ) : component_name === "Data Card Bar Chart" ? (
                <MediaDataBarChart field={field} />
              ) : component_name === "Data Card Bar Chart Horizontal" ? (
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
              dangerouslySetInnerHTML={{ __html: custom_html }}
            />
          </div>
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

export default SendMediaCard;
