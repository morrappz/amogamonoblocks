import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function EmailSignUp() {
  return (
    <div className="w-full py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Card className="border-border mx-auto max-w-lg overflow-hidden pt-0">
          <div className="bg-primary/10 relative flex h-16 items-center justify-center">
            <div className="from-primary/20 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-60"></div>
            <Mail className="text-primary relative z-10 h-8 w-8" />
          </div>

          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">
              Get My Free UX Checklist
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join my newsletter and receive a comprehensive UX design checklist
              to ensure your projects cover all the essentials.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Weekly design tips & resources</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Project case studies & process insights</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Exclusive guides and templates</span>
                </div>
              </div>
            </div>

            <form>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>

                <Button type="submit" className="group w-full">
                  Send Me the Checklist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-muted-foreground w-full text-center text-xs">
              I send one newsletter per week. No spam, just valuable content.
              Unsubscribe anytime.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
