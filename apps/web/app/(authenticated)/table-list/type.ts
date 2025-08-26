export const contactStatuses = ["active", "inactive", "draft"] as const;

export type ContactStatus = (typeof contactStatuses)[number];

export type Contact = {
  user_catalog_id: number;
  first_name: string;
  last_name: string;
  user_email: string;
  user_mobile: string;
  status: ContactStatus;
  created_datetime: string;
  // Add more fields as needed for the table
};
