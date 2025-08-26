import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function ProductFeatures() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Product Highlights
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why customers love our product
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Crafted with premium materials and impeccable attention to detail,
              our products are designed to elevate your everyday experience.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              <li>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Premium Materials</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Crafted with sustainably sourced, high-quality materials
                    that ensure durability and comfort.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Thoughtful Design</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Every detail has been carefully considered to enhance both
                    functionality and aesthetic appeal.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">2-Year Warranty</h3>
                  </div>
                  <p className="text-muted-foreground">
                    We stand behind our craftsmanship with a comprehensive
                    warranty for your peace of mind.
                  </p>
                </div>
              </li>
            </ul>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg">Shop Now</Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-background/50"></div>
            <img
              src="https://images.unsplash.com/photo-1519735777090-ec97162dc266?q=80&w=2070&auto=format&fit=crop"
              alt="Handcrafted leather goods showcase"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
