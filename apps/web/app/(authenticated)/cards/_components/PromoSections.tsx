"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PromoSections() {
  return (
    <div className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Trending Now
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Upgrade Your Workspace
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Boost productivity and style with our curated selection of ergonomic
            chairs, standing desks, and premium accessories.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          <Link
            href="#"
            className="group relative block overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
          >
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
              alt="Premium Headphones"
              width={400}
              height={500}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-sm font-medium text-white">
                Premium Headphones
              </p>
              <p className="text-xs text-white/80">From $249</p>
            </div>
          </Link>

          <Link
            href="#"
            className="group relative block overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
          >
            <Image
              src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop"
              alt="Ergonomic Laptop Stand"
              width={400}
              height={500}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-sm font-medium text-white">Laptop Stand</p>
              <p className="text-xs text-white/80">From $79</p>
            </div>
          </Link>

          <Link
            href="#"
            className="group relative hidden overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md sm:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?q=80&w=600&auto=format&fit=crop"
              alt="Mechanical Keyboard"
              width={400}
              height={500}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-sm font-medium text-white">
                Mechanical Keyboard
              </p>
              <p className="text-xs text-white/80">$149</p>
            </div>
          </Link>

          <Link
            href="#"
            className="group relative hidden overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md lg:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=600&auto=format&fit=crop"
              alt="Desk Lamp with Wireless Charger"
              width={400}
              height={500}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-sm font-medium text-white">Smart Desk Lamp</p>
              <p className="text-xs text-white/80">$89</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="#">Shop All Workspace Essentials</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
