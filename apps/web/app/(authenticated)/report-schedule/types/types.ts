export interface PromptsList {
  for_business_number: number | null;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp without time zone
  specific_dates: Record<string, any> | null; // jsonb
  delivery_options: Record<string, any> | null; // jsonb
  target_user_ids: Record<string, any> | null; // jsonb
  target_all_users: boolean | null;
  last_executed: string | null; // timestamp with time zone
  next_execution: string | null; // timestamp with time zone
  business_number: number | null;
  created_user_id: number | null;
  id: bigint; // or string if returned as text
  created_by: bigint | null; // or string if returned as text
  is_scheduled: boolean | null;
  schedule_time: string | null; // time without time zone (e.g. "14:30:00")
  start_date: string | null; // date (YYYY-MM-DD)
  end_date: string | null; // date (YYYY-MM-DD)
  hourly_interval: number | null;
  selected_weekdays: Record<string, any> | null; // jsonb
  day_of_month: number | null;
  start_month: number | null;
  end_month: number | null;
  selected_year: number | null;
  selected_month: number | null;
  selected_day: number | null;
  title: string | null;
  description: string | null;
  status: string | null;
  remarks: string | null;
  execution_status: string | null;
  timezone: string | null;
  frequency: string | null;
  prompt_group: string | null;
  created_user_name: string | null;
}
