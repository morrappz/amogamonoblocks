import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { UpdateFinalBomSchema } from "../../_lib/validations";
import useSWR from "swr";
import { Loader } from "lucide-react";

type Template = {
  data_group_id: number;
  data_upload_id: number;
  model_name: string;
  data_combination_json: Record<string, string>;
  file_name: string;
};

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) throw res.error;
      return res.data;
    });

export default function Step1({
  form,
  selectedTemplate,
  setSelectedTemplate,
}: {
  form: UseFormReturn<UpdateFinalBomSchema>;
  selectedTemplate: Template | undefined;
  setSelectedTemplate: React.Dispatch<
    React.SetStateAction<Template | undefined>
  >;
}) {
  const {
    data: models,
    error: modelError,
    isLoading: modelLoading
  } = useSWR<Template[]>("/api/final-bom-data/masterdata?type=Model&alias=model_name", fetcher);

  const {
    data: rawBomFiles,
    error,
    isLoading,
  } = useSWR<Template[]>("/api/final-bom-data/templates", fetcher);

  const handleModelChange = (value: string) => {
    form.setValue("model", value);
  
    const currentTemplate: Template = selectedTemplate ?? {
      data_group_id: 0,
      data_upload_id: 0,
      model_name: "",
      data_combination_json: {},
      file_name: ""
    };

    const selectedModel = models?.find(
      (item) => item.model_name === value
    );

    setSelectedTemplate({
      ...currentTemplate,
      data_group_id: selectedModel?.data_group_id ?? 0,
      model_name: value,
      data_combination_json: selectedModel?.data_combination_json ?? {},
    });
  };
  
  const handleTemplateChange = (value: string) => {
    const file = rawBomFiles?.find(t => t.data_upload_id.toString() === value);
    if (!file) return;
    
    const currentTemplate: Template = selectedTemplate ?? {
      data_group_id: 0,
      data_upload_id: 0,
      model_name: "",
      data_combination_json: {},
      file_name: ""
    };
    
    setSelectedTemplate({
      ...currentTemplate,
      file_name: file.file_name,
      data_upload_id: file.data_upload_id
    });
  };
  

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>
                    Select Model{" "}
                  </span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleModelChange(value);
                    }}
                    defaultValue={field.value ?? ""}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select a Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                      {modelLoading && (
                        <Loader
                          className="mr-2 size-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      {modelError && modelError}
                      {(models ?? []).map((item) => (
                        <SelectItem
                          key={item.model_name}
                          value={item.model_name}
                          className="capitalize"
                        >
                          {item.model_name}
                        </SelectItem>
                      ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="file_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Raw BOM Data</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleTemplateChange(value);
                  }}
                  defaultValue={field.value ?? ""}
                >
                  <SelectTrigger>
                      <SelectValue placeholder="Select a Raw BOM dataset" />
                    </SelectTrigger>
                  <FormControl>
                    
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {isLoading && (
                        <Loader
                          className="mr-2 size-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      {error && error}
                      {(rawBomFiles ?? []).map((item) => (
                        <SelectItem
                          key={item.data_upload_id}
                          value={item.data_upload_id.toString()}
                          className="capitalize"
                        >
                          {item.file_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>
      </div>
    </div>
  );
}
