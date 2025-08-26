import { ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  id: number;
  title: string;
  count: string;
  percent?: string;
}

export default function Dashboard({ data }: { data: Props[] }) {
  return (
    <div className="container mx-auto px-4 py-10 md:px-6 2xl:max-w-[1400px]">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {data.map((item) => (
          <Card className="pt-0" key={item.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {item.title}
                </p>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl font-medium sm:text-2xl">
                    {item.count}%
                  </h3>
                  <span className="flex items-center gap-x-1 text-green-700 dark:text-green-400">
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-sm">{item.percent}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
