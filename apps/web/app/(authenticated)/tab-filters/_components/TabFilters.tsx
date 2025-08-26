import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";

interface Props {
  name: string;
  category: string;
  description: string;
  logo: string;
  rating: number;
  popular: boolean;
  verified: boolean;
}

export default function TabFilters({
  data,
  categories,
}: {
  data: Props[];
  categories: string[];
}) {
  return (
    <>
      {/* Integrations Section */}
      <div className="py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Integrations
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Connect with the tools you already use and love. Build powerful
              workflows with our extensive integration library.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((integration) => (
              <Card
                key={integration.name}
                className="relative overflow-hidden transition-all hover:shadow-lg"
              >
                <CardContent>
                  {/* Popular Badge */}
                  {integration.popular && (
                    <Badge
                      className="absolute top-4 right-4"
                      variant="secondary"
                    >
                      Popular
                    </Badge>
                  )}

                  {/* Logo and Name */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                      <Image
                        src={integration.logo}
                        alt={`${integration.name} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {integration.category}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mt-4 text-sm">
                    {integration.description}
                  </p>

                  {/* Rating and Actions */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {integration.rating}
                      </span>
                      {integration.verified && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline">
              View All Integrations
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* End Integrations Section */}
    </>
  );
}
