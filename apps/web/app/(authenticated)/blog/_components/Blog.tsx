"use client";

import { useState, useRef, useEffect, TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  imageUrl: string;
  excerpt: string;
}

export default function Blog({ data }: { data: BlogPost[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible items based on screen size
  const visibleItems = screenSize.isDesktop ? 3 : screenSize.isTablet ? 2 : 1;
  const maxIndex = Math.max(0, data.length - visibleItems);

  // Initialize and update screen size
  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setScreenSize({
          isMobile: width < 640,
          isTablet: width >= 640 && width < 1024,
          isDesktop: width >= 1024,
        });
      }
    };

    // Initial check
    updateScreenSize();

    // Listen for resize
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  // Ensure current index is valid when screen size changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [screenSize, maxIndex]);

  // Handle navigation
  function handlePrevious() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }

  // Scroll to current index
  useEffect(() => {
    if (sliderRef.current) {
      const scrollToIndex = () => {
        if (sliderRef.current) {
          const cardWidth =
            sliderRef.current.querySelector(".carousel-item")?.clientWidth || 0;
          const scrollLeft = cardWidth * currentIndex;

          sliderRef.current.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }
      };

      // Small delay to ensure the DOM has updated
      const timeoutId = setTimeout(scrollToIndex, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, screenSize]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Prevent default to stop page scrolling during swipe
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;

    const currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;

    // Determine if swipe is significant
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < maxIndex) {
        handleNext();
      } else if (diff < 0 && currentIndex > 0) {
        handlePrevious();
      }
    }

    setIsSwiping(false);
  };

  // Progress indicators
  const renderProgressIndicators = () => {
    return (
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-primary w-6" : "bg-primary/30 w-2"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 md:py-20 lg:py-24">
      <div
        ref={containerRef}
        className="container mx-auto space-y-6 px-4 md:space-y-8 md:px-6 2xl:max-w-[1400px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Latest Marketing Articles
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Stay updated with our most recent insights
            </p>
          </div>
          <div className="flex hidden items-center space-x-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={sliderRef}
            className="scrollbar-hide -mx-4 flex touch-pan-x snap-x snap-mandatory overflow-x-auto px-4 pt-1 pb-2 md:pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {data.map((post) => (
              <div
                key={post.id}
                className="carousel-item w-full flex-none snap-start px-2 sm:w-1/2 sm:px-4 lg:w-1/3"
              >
                <Card className="flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative h-40 overflow-hidden sm:h-48 md:h-52">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary hover:bg-primary/90">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-grow">
                    <div className="text-muted-foreground mb-2 flex items-center text-xs sm:mb-3 sm:text-sm">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold sm:text-lg">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-xs sm:line-clamp-3 sm:text-sm">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="pb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm"
                      asChild
                    >
                      <Link
                        href="#"
                        className="flex items-center justify-center"
                      >
                        Read Article
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>

          {/* Progress indicators for mobile */}
          <div className="sm:hidden">{renderProgressIndicators()}</div>

          {/* Mobile navigation buttons - only shown on very small screens */}
          <div className="mt-6 flex items-center justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="mr-2 h-9 flex-1 text-xs"
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="ml-2 h-9 flex-1 text-xs"
            >
              Next
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex justify-center sm:mt-8">
          <Button variant="outline" className="w-full max-w-sm" asChild>
            <Link href="#">Browse All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
