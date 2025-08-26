import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Banner() {
  return (
    <div className="bg-primary w-full py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-primary-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Ready to Transform Your Vision into Reality?
        </h2>

        <p className="text-primary-foreground/90 mx-auto mt-3 max-w-2xl text-lg">
          Let&apos;s collaborate and create something exceptional together.
        </p>

        <Button
          asChild
          size="lg"
          variant="secondary"
          className="group mt-8 font-medium"
        >
          <Link href="#">
            Contact Me
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
