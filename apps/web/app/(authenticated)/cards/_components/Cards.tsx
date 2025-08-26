import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  data: {
    id: number;
    title: string;
    description: string;
    content: string;
  }[];
}

export default function Cards({ data }: PageProps) {
  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="relative">
        {data.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Deploy</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
