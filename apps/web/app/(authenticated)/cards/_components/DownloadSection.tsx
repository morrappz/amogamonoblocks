import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DownloadSection() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          {/* Image column */}
          <div className="relative h-full min-h-[300px] md:min-h-0">
            <div className="absolute inset-0 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                alt="UX Design Checklist preview"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Decorative pattern overlay */}
              <div className="from-primary/40 absolute inset-0 bg-gradient-to-tr to-transparent opacity-60 mix-blend-overlay"></div>
            </div>

            {/* Resource type badge */}
            <Badge className="absolute top-4 left-4">PDF Guide</Badge>
          </div>

          {/* Content column */}
          <div className="flex flex-col p-6 md:p-8 lg:p-10">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                The Complete UX Design Checklist
              </h2>

              <p className="text-muted-foreground mt-3 md:text-lg">
                A comprehensive, 35-point checklist to ensure your design
                projects cover all essential UX principles. Perfect for
                freelancers and design teams.
              </p>

              <ul className="mt-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2 text-lg">•</span>
                  <span>35 actionable UX checkpoints</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 text-lg">•</span>
                  <span>Project planning templates included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 text-lg">•</span>
                  <span>Based on industry best practices</span>
                </li>
              </ul>

              <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
                <Link href="#">
                  <Download className="mr-2 h-4 w-4" />
                  Download Free Guide
                </Link>
              </Button>

              <p className="text-muted-foreground mt-4 text-sm">
                No email required. Instant download.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
