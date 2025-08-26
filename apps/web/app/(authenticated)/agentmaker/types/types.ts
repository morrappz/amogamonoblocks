export type Connection = {
  id: number;
  status: string;
  formconnection_id: string;
  created_date: string;
  updated_date: string;
  form_id: string;
  form_name: string;
  form_code: string;
  connection_name: string;
  label: string;
  connection_type: string;
  options: string;
  api_url: string;
  key: string;
  secret: string;
  test_status: string;
  remarks: string;
  api_method: string;
  connection_scope: string;
  agent_name: string;
  agent_number: string;
  ref_agent_name: string;
  ref_agent_number: string;
  agent_uuid: string;
  ref_agent_uuid: string;
  agent_session: string;
  created_user_id: number;
  created_user_name: string;
  ref_user_id: string;
  ref_user_name: string;
  data_source_name: string;
  for_business_code: string;
  for_business_name: string;
  for_business_number: string;
  for_user_id: string;
  for_user_name: string;
  business_code: string;
  business_name: string;
  business_number: number;
  ref_business_code: string;
  ref_business_name: string;
  ref_business_number: string;
  doc_name: string;
  doc_code: string;
  doc_description: string;
  connection_group: string;
  custom_one: string;
  custom_two: string;
  custom_no_one: string;
  custom_no_two: string;
  custom_json_one: string;
  custom_json_two: string;
  custom_json_three: string;
  file_one: string;
  file_two: string;
  file_url: string;
  file_json: string;
  flow_json: string;
  progress_json: string;
  status_log_json: string;
  share_to_user_json: string;
  users_json: string;
  user_log_json: string;
  chat_log_json: string;
  business_log_json: string;
  agent_json: string;
  agent_content_json: string;
  message_content_json: string;
  prompt_json: string;
  response_json: string;
  timeline_json: string;
  email_content_json: string;
  email_doc_json: string;
  database_connection_json: string;
  data_connection_json: string;
  document_connection_json: string;
  api_connection_json: string;
  data_source_json: string;
  connection_logs: string;
  connection_success: string;
  source_connection_json: string;
  target_connection_json: string;
  automation_json: string;
  datafield_scope_json: string;
  sessions_scope_json: string;
  custom_prompts_json: string;
  prompt_suggestions_json: string;
  agents_connection_scope: string;
  table_connection_scope: string;
};

export type form_json_list = form_json[];

export interface form_json {
  name: string;
  type: string;
  label: string;
  value: string;
  checked: boolean;
  variant: string;
  disabled: boolean;
  required: boolean;
  rowIndex: number;
  description: string;
  placeholder: string;
  variant_code: string;
  validation_message: string;
  options?: string[];
  combobox?: string[];
  radiogroup?: string[];
  multiselect?: string[];
  chat_with_data?: ChatWithData;
  media_card_data?: MediaCardData;
  use_settings_upload?: boolean;
  placeholder_file_url?: string;
  placeholder_video_url?: string;
  placeholder_pdf_file_url?: string;
  placeholder_file_upload_url?: string;
}

export interface ChatWithData {
  buttons: Button[];
}

export interface Button {
  prompt: string;
  metricApi: string;
  storyCode: string;
  storyName: string;
  enable_api: boolean;
  button_text: string;
  api_response: string[];
  apiDataFilter: string;
  enable_prompt: boolean;
  component_name: string;
  enable_dataApi: boolean;
  storyApiEnabled: boolean;
  dataApi_response: string[];
  metricApiEnabled: boolean;
  promptDataFilter: string;
}

export interface MediaCardData {
  card_json: string[];
  card_type: string;
  media_url: string;
  use_upload: boolean;
  action_urls: ActionUrls;
  custom_html: string;
  component_name: string;
}

export interface ActionUrls {
  chat: string;
  like: string;
  task: string;
  share: string;
  favorite: string;
}
