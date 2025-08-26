export interface AssistantData {
  form_name: string;
  form_id: string | number;
  content: Content[];
  data_api_url: string;
  api_connection_json: string;
  db_connection_json: string;
  story_api: string;
}

export interface Content {
  name: string;
  type: string;
  queries: Query[];
  description: string;
}

export interface Query {
  id: number;
  api: string;
  name: string;
  type: string;
  field?: string;
  description: string;
  story?: string;
  chartType?: string;
  table_columns?: string[];
  chart?: ChartData;
}

export interface ChartData {
  type: string;
  title: string;
  xaxis: string;
  yaxis: string;
}

export interface AISettings {
  provider: string;
  model: string;
  tokens_used: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive";
  id: string;
  tokens_limit: string;
  default: boolean;
}
