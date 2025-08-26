/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Actionables() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Suggested Actions:</h4>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Investigate the significant revenue increase in August to identify
            contributing factors and potentially replicate the success.
          </p>
        </li>
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Analyze the slight dip in revenue during April and May to understand
            any seasonal trends or external factors affecting sales.
          </p>
        </li>
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Consider implementing strategies to stabilize revenue fluctuations
            and maintain consistent growth month-over-month.
          </p>
        </li>
      </ul>
    </div>
  );
}

const AnalyticCard = ({ field }: any) => {
  console.log("field----", field);
  const card_json = field?.media_card_data?.card_json;
  const columns = card_json.length > 0 ? Object.keys(card_json[0]) : [];
  console.log("columns----", columns);
  console.log("card_json----", card_json[0]);
  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(" ");
  };

  const formatCellValue = (column: string, value: any) => {
    if (column.toLowerCase().includes("valuation")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, "");
      return `$${trimmedValue}B`;
    }
    if (column.toLowerCase().includes("rate")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };
  return (
    <div>
      <Card className="p-2.5">
        <Tabs className="w-full" defaultValue="data">
          <TabsList defaultValue={"data"} className="grid grid-cols-3">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="actionables">Actionables</TabsTrigger>
          </TabsList>
          <TabsContent value="data">
            <Table className="min-w-full divide-y divide-border">
              <TableHeader className="bg-secondary sticky top-0 shadow-sm">
                <TableRow>
                  {columns?.map(
                    (column: any, index: Key | null | undefined) => (
                      <TableHead
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {formatColumnTitle(column)}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-y divide-border">
                {card_json.map(
                  (company: any, index: Key | null | undefined) => (
                    <TableRow key={index} className="hover:bg-muted">
                      {columns?.map((column: any, cellIndex: any) => (
                        <TableCell
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                        >
                          {formatCellValue(column, company[column])}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="chart">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={card_json}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toFixed(2)}`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="actionables">
            <Actionables />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AnalyticCard;
