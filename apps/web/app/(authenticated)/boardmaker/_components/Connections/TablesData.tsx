import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save } from "lucide-react";

interface TableData {
  id: string;
  table_name: string;
}

interface TablesDataProps {
  tables: TableData[];
  selectedTables: string[];
  setSelectedTables: (tables: string[]) => void;
  onClose: () => void;
}

const TablesData = ({
  tables,
  selectedTables,
  setSelectedTables,
  onClose,
}: TablesDataProps) => {
  const handleSave = () => {
    onClose();
  };

  const handleCancel = () => {
    setSelectedTables([]);
    onClose();
  };

  return (
    <div className="overflow-y-auto max-h-[500px]">
      <Table className="border border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Table Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => (
            <TableRow key={table.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTables.includes(table.table_name)}
                  onCheckedChange={(checked) => {
                    setSelectedTables(
                      checked
                        ? [...selectedTables, table.table_name]
                        : selectedTables.filter((t) => t !== table.table_name)
                    );
                  }}
                />
              </TableCell>
              <TableCell>{table.table_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          disabled={selectedTables.length === 0}
          onClick={handleSave}
          type="button"
        >
          <Save className="h-5 w-5 mr-2" /> Save
        </Button>
      </div>
    </div>
  );
};

export default TablesData;
