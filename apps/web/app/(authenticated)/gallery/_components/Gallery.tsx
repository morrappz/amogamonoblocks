"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function Gallery({ data }: { data: GalleryImage[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Configuration options
  const autoPlay = true;
  const autoPlayInterval = 5000;
  const showThumbnails = true;

  // Static images array

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  // Auto play functionality
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, autoPlayInterval]);

  // Keyboard navigation for main carousel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full p-4 md:p-6">
      {/* Main carousel */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative aspect-video w-full overflow-hidden">
          {data.map((image, index) => (
            <div
              key={`slide-${index}`}
              className={cn(
                "absolute inset-0 transform transition-all duration-500 ease-in-out",
                index === currentIndex
                  ? "translate-x-0 opacity-100"
                  : index < currentIndex
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <Button
          size="icon"
          className="absolute top-1/2 left-2 -translate-y-1/2"
          onClick={prevSlide}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Button>

        <Button
          size="icon"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={nextSlide}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </Button>

        {/* Caption */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-sm text-white">
          {data[currentIndex].alt}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="mt-4 flex gap-2 overflow-x-auto px-2 py-2">
          {data.map((image, index) => (
            <button
              key={`thumb-${index}`}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 transition-all duration-200",
                index === currentIndex
                  ? "ring-primary ring-2 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image.src}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="h-full w-full rounded-sm object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
