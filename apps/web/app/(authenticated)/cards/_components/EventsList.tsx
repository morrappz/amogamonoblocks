import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// Sample events data
const events = [
  {
    id: 1,
    title: "Responsive Design in 2024",
    event: "FrontEnd Summit",
    role: "Keynote Speaker",
    date: "March 15, 2024",
    location: "San Francisco, CA",
    summary:
      "Discussed emerging trends in responsive design and how AI is changing the way we build adaptable interfaces.",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 2,
    title: "UX Workshop: User Research Techniques",
    event: "DesignMatters Conference",
    role: "Workshop Leader",
    date: "January 28, 2024",
    location: "Virtual Event",
    summary:
      "Hands-on workshop teaching practical user research methods that can be implemented on any budget.",
    image:
      "https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=2070&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 3,
    title: "Building Accessible Web Applications",
    event: "A11y Summit",
    role: "Panel Moderator",
    date: "November 12, 2023",
    location: "Chicago, IL",
    summary:
      "Led a panel discussion on best practices for building truly accessible digital products from the ground up.",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2112&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 4,
    title: "From Freelancer to Agency Owner",
    event: "Freelance Business Forum",
    role: "Featured Speaker",
    date: "October 5, 2023",
    location: "Austin, TX",
    summary:
      "Shared my journey and practical advice for freelancers looking to scale their business and build a team.",
    image:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 5,
    title: "Design Systems at Scale",
    event: "DesignOps Global",
    role: "Workshop Leader",
    date: "September 18, 2023",
    location: "Berlin, Germany",
    summary:
      "A full-day workshop on creating, implementing, and maintaining design systems for enterprise organizations.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 6,
    title: "Conversion-Focused Web Design",
    event: "Marketing Innovation Summit",
    role: "Speaker",
    date: "July 22, 2023",
    location: "New York, NY",
    summary:
      "Presented strategies for creating websites that balance exceptional user experience with business conversion goals.",
    image:
      "https://images.unsplash.com/photo-1540304453527-62f979142a17?q=80&w=2070&auto=format&fit=crop",
    link: "#",
  },
];

export default function EventsList() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 2xl:max-w-[1400px]">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <Badge className="mb-4" variant="outline">
            Speaking & Workshops
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Speaking Engagements & Workshops
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            I regularly speak at conferences and lead workshops on design,
            development, and digital strategy
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col overflow-hidden pt-0 transition-all duration-300 hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <Badge className="absolute bottom-4 left-4" variant="secondary">
                  {event.role}
                </Badge>
              </div>

              <CardHeader>
                <h3 className="line-clamp-2 text-xl font-semibold">
                  {event.title}
                </h3>
                <p className="text-primary font-medium">{event.event}</p>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="mb-4 flex flex-col space-y-2">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {event.summary}
                </p>
              </CardContent>

              <CardFooter className="pt-0">
                <Button variant="ghost" asChild className="group">
                  <Link
                    href={event.link}
                    className="text-primary flex items-center"
                  >
                    <span className="mr-2">Event details</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild>
            <Link href="#" className="inline-flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>View all speaking engagements</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
