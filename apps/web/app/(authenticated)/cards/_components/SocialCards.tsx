"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Twitter,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Repeat2,
  Heart,
  ExternalLink,
  VerifiedIcon,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState } from "react";

// Sample tweets data
const tweets = [
  {
    id: "1",
    user: {
      name: "Alex Morgan",
      handle: "@alexmdev",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1170&auto=format&fit=crop",
      verified: true,
    },
    content:
      "Just launched my new portfolio website built with Next.js and Tailwind CSS! Check it out and let me know what you think. #webdev #frontend #portfoliowebsite",
    date: "2h ago",
    metrics: {
      replies: 12,
      retweets: 24,
      likes: 89,
    },
    url: "#",
  },
  {
    id: "2",
    user: {
      name: "Sarah Johnson",
      handle: "@sarahj_ux",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop",
      verified: true,
    },
    content:
      "Had the pleasure of working with @alexmdev on our company's website redesign. His technical skills and eye for design are exceptional! Highly recommend for any web development project. 💯",
    date: "1d ago",
    metrics: {
      replies: 3,
      retweets: 15,
      likes: 67,
    },
    url: "#",
  },
  {
    id: "3",
    user: {
      name: "Tech Insights",
      handle: "@techinsights",
      avatar:
        "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1074&auto=format&fit=crop",
      verified: true,
    },
    content:
      "We interviewed @alexmdev about his approach to modern web development in our latest podcast episode. Great insights on balancing performance and aesthetics! Listen now: techinsights.com/podcast/ep45",
    date: "3d ago",
    metrics: {
      replies: 18,
      retweets: 42,
      likes: 136,
    },
    url: "#",
  },
  {
    id: "4",
    user: {
      name: "Alex Morgan",
      handle: "@alexmdev",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1170&auto=format&fit=crop",
      verified: true,
    },
    content:
      "Excited to announce that I'm joining @innovatetech as a Senior Frontend Developer next month! Looking forward to building amazing web experiences with this talented team. #careerchange #frontenddeveloper",
    date: "5d ago",
    metrics: {
      replies: 32,
      retweets: 18,
      likes: 215,
    },
    url: "#",
  },
  {
    id: "5",
    user: {
      name: "WebDevConf",
      handle: "@webdevconf",
      avatar:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop",
      verified: true,
    },
    content:
      "Thank you @alexmdev for your insightful presentation on 'Building Accessible Web Applications' at #WebDevConf2023! Attendees loved the practical demonstrations and code examples.",
    date: "1w ago",
    metrics: {
      replies: 8,
      retweets: 27,
      likes: 103,
    },
    url: "#",
  },
  {
    id: "6",
    user: {
      name: "CodeMentor",
      handle: "@codementor",
      avatar:
        "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=1123&auto=format&fit=crop",
      verified: false,
    },
    content:
      "Our latest 'Developer Spotlight' features @alexmdev and his journey from self-taught programmer to senior developer. Read about his learning strategies and career tips: codementor.io/spotlight/alex-morgan",
    date: "2w ago",
    metrics: {
      replies: 5,
      retweets: 14,
      likes: 76,
    },
    url: "#",
  },
];

export default function SocialCards() {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 2xl:max-w-[1400px]">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Twitter className="h-5 w-5 text-sky-500" />
            <Badge
              variant="outline"
              className="border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium tracking-wide text-sky-600 uppercase dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400"
            >
              Twitter
            </Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Latest Tweets
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
            Stay updated with my latest thoughts and interactions in the tech
            community
          </p>
        </div>

        {/* Tweet Carousel with Navigation */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent className="pt-2 pb-6">
              {tweets.map((tweet) => (
                <CarouselItem
                  key={tweet.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full border shadow-sm transition-all hover:shadow-md">
                    <CardContent className="flex h-full flex-col">
                      {/* Tweet Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Image
                              src={tweet.user.avatar}
                              alt={tweet.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold">
                                {tweet.user.name}
                              </span>
                              {tweet.user.verified && (
                                <VerifiedIcon
                                  className="h-3.5 w-3.5 text-sky-500"
                                  fill="#0ea5e9"
                                />
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {tweet.user.handle}
                            </div>
                          </div>
                        </div>
                        <Twitter className="h-5 w-5 text-sky-500" />
                      </div>

                      {/* Tweet Content */}
                      <p className="mb-4 grow text-sm">{tweet.content}</p>

                      {/* Tweet Date and Metrics */}
                      <div className="border-t pt-4">
                        <div className="text-muted-foreground mb-2 text-xs">
                          {tweet.date}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-muted-foreground flex items-center gap-1 hover:text-sky-500">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">
                                {tweet.metrics.replies}
                              </span>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1 hover:text-green-500">
                              <Repeat2 className="h-4 w-4" />
                              <span className="text-xs">
                                {tweet.metrics.retweets}
                              </span>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1 hover:text-red-500">
                              <Heart className="h-4 w-4" />
                              <span className="text-xs">
                                {tweet.metrics.likes}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/50"
                            asChild
                          >
                            <Link
                              href={tweet.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Footer with Mobile Navigation and Link */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-sky-200 hover:bg-sky-50 hover:text-sky-600 dark:border-sky-500/20 dark:hover:bg-sky-950/30 dark:hover:text-sky-400"
            asChild
          >
            <Link href="#" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4" />
              <span>Follow me on Twitter</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
