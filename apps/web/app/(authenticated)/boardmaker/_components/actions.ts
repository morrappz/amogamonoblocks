/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Config, configSchema, Result } from "@/types/agentmaker";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Client } from "pg";
import { z } from "zod";

export const generateQuery = async (
  input: string,
  session: any,
  dataFilter: string
) => {
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: `You are a SQL (Postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need based on the user's session details and dataFilter. The table schemas are as follows:

      user_catalog (
        user_catalog_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        user_mobile VARCHAR(255) NOT NULL UNIQUE
      );

      plan (
        content_json JSON,
        doc_json JSON,
        visits INTEGER,
        submissions INTEGER,
        plan_start_date DATE,
        plan_end_date DATE,
        actual_start_date DATE,
        actual_end_date DATE,
        plan_days INTEGER,
        actual_days INTEGER,
        chat_form BOOLEAN,
        tab_number INTEGER,
        tab_order INTEGER,
        tab_field_order JSON,
        plan_fields_json JSON,
        plan_fields_script JSON,
        version_no INTEGER,
        version_date TIMESTAMP WITHOUT TIME ZONE,
        updated_date TIMESTAMP WITHOUT TIME ZONE,
        plan_rasci JSON,
        plan_plancost JSON,
        plan_actualcost JSON,
        plan_workflow JSON,
        plan_phases JSON,
        plan_progress_track JSON,
        plan_gantt JSON,
        docs_list JSON,
        for_user_id INTEGER,
        plan_publish_date TIMESTAMP WITHOUT TIME ZONE,
        custom_no_one INTEGER,
        custom_no_two INTEGER,
        custom_json_one JSON,
        custom_json_two JSON,
        custom_json_three JSON,
        plan_form BOOLEAN,
        template BOOLEAN,
        created_date TIMESTAMP WITHOUT TIME ZONE,
        progress_percent INTEGER,
        plan_id INTEGER,
        shorturl VARCHAR,
        chatformshorturl VARCHAR,
        plan_iframe_code TEXT,
        chatform_iframe_code TEXT,
        no_of_tabs VARCHAR,
        tab_name VARCHAR,
        plan_api TEXT,
        custom_one VARCHAR,
        custom_two VARCHAR,
        plan_no TEXT,
        ref_plan TEXT,
        ref_plan_no TEXT,
        progress_note TEXT,
        status VARCHAR,
        progress_status VARCHAR,
        created_user_id VARCHAR,
        created_user_name VARCHAR,
        ref_user_id VARCHAR,
        ref_user_name VARCHAR,
        data_source_name VARCHAR,
        for_business_code VARCHAR,
        for_business_name VARCHAR,
        for_business_number VARCHAR,
        for_user_name VARCHAR,
        business_code VARCHAR,
        business_name VARCHAR,
        business_number VARCHAR,
        plan_group VARCHAR,
        plan_category VARCHAR,
        plan_name VARCHAR,
        plan_code VARCHAR,
        plan_description VARCHAR,
        template_name VARCHAR,
        chatform_name VARCHAR,
        chatform_url TEXT,
        app_name VARCHAR,
        app_code VARCHAR,
        page_name VARCHAR,
        database_name VARCHAR,
        data_table_name VARCHAR,
        data_api_name VARCHAR,
        data_api_url VARCHAR,
        data_api_key VARCHAR,
        plan_entries_table VARCHAR,
        plan_entries_table_api VARCHAR,
        plan_entries_api VARCHAR,
        publish_status VARCHAR,
        plan_publish_url VARCHAR,
        content TEXT,
        content_html TEXT,
        shareurl VARCHAR
      );

      plan_phase (
        docs_list JSON,
        plan_id INTEGER,
        created_date TIMESTAMP WITHOUT TIME ZONE,
        updated_date TIMESTAMP WITHOUT TIME ZONE,
        for_user_id INTEGER,
        plan_start_date DATE,
        plan_end_date DATE,
        actual_start_date DATE,
        actual_end_date DATE,
        plan_days INTEGER,
        actual_days INTEGER,
        phase_rasci JSON,
        phase_plancost JSON,
        phase_actualcost JSON,
        phase_workflow JSON,
        phase_tasks JSON,
        phase_progress_track JSON,
        phase_gantt JSON,
        plan_phase_id INTEGER,
        custom_no_one INTEGER,
        custom_no_two INTEGER,
        custom_json_one JSON,
        custom_json_two JSON,
        custom_json_three JSON,
        progress_percent INTEGER,
        custom_one VARCHAR,
        plan_name VARCHAR,
        status VARCHAR,
        progress_status VARCHAR,
        created_user_id VARCHAR,
        created_user_name VARCHAR,
        ref_user_id VARCHAR,
        ref_user_name VARCHAR,
        custom_two VARCHAR,
        progress_note TEXT,
        data_source_name VARCHAR,
        for_business_code VARCHAR,
        for_business_name VARCHAR,
        for_business_number VARCHAR,
        plan_phase_no TEXT,
        for_user_name VARCHAR,
        business_code VARCHAR,
        business_name VARCHAR,
        business_number VARCHAR,
        plan_phase_name VARCHAR,
        plan_phase_code VARCHAR,
        plan_phase_description VARCHAR,
        ref_plan_phase TEXT,
        ref_plan_phase_no TEXT
      );

      task (
        version_no INTEGER,
        plan_id INTEGER,
        plan_phase_id INTEGER,
        created_user_id INTEGER,
        created_date TIMESTAMP WITHOUT TIME ZONE,
        updated_date TIMESTAMP WITHOUT TIME ZONE,
        for_user_id INTEGER,
        task_form BOOLEAN,
        template BOOLEAN,
        plan_start_date DATE,
        plan_end_date DATE,
        actual_start_date DATE,
        actual_end_date DATE,
        plan_start_time TIMESTAMP WITHOUT TIME ZONE,
        actual_start_time TIMESTAMP WITHOUT TIME ZONE,
        plan_end_time TIMESTAMP WITHOUT TIME ZONE,
        actual_end_time TIMESTAMP WITHOUT TIME ZONE,
        plan_days INTEGER,
        actual_days INTEGER,
        plan_hrs INTEGER,
        actual_hrs INTEGER,
        chat_form BOOLEAN,
        task_publish_date TIMESTAMP WITHOUT TIME ZONE,
        content_json JSON,
        doc_json JSON,
        visits INTEGER,
        submissions INTEGER,
        tab_number INTEGER,
        tab_order INTEGER,
        tab_field_order JSON,
        plan_fields_json JSON,
        plan_fields_script JSON,
        task_id INTEGER,
        version_date TIMESTAMP WITHOUT TIME ZONE,
        task_rasci JSON,
        task_plancost JSON,
        task_actualcost JSON,
        task_workflow JSON,
        task_subtask JSON,
        task_progress_track JSON,
        task_gantt JSON,
        docs_list JSON,
        custom_no_one INTEGER,
        custom_no_two INTEGER,
        custom_json_one JSON,
        custom_json_two JSON,
        custom_json_three JSON,
        msg_id INTEGER,
        ref_task_id INTEGER,
        progress_percent INTEGER,
        data_table_name VARCHAR,
        data_api_name VARCHAR,
        data_api_url VARCHAR,
        data_api_key VARCHAR,
        task_entries_table VARCHAR,
        task_entries_table_api VARCHAR,
        task_entries_api VARCHAR,
        publish_status VARCHAR,
        plan_name VARCHAR,
        plan_phase_name VARCHAR,
        status VARCHAR,
        progress_status VARCHAR,
        progress_note TEXT,
        created_user_name VARCHAR,
        ref_user_id VARCHAR,
        ref_user_name VARCHAR,
        task_publish_url VARCHAR,
        content TEXT,
        data_source_name VARCHAR,
        for_business_code VARCHAR,
        for_business_name VARCHAR,
        for_business_number VARCHAR,
        content_html TEXT,
        for_user_name VARCHAR,
        business_code VARCHAR,
        business_name VARCHAR,
        business_number VARCHAR,
        task_group VARCHAR,
        task_category VARCHAR,
        task_title VARCHAR,
        task_code VARCHAR,
        task_description VARCHAR,
        task_short_decription VARCHAR,
        ref_task_name TEXT,
        task_no TEXT,
        template_name VARCHAR,
        task_api TEXT,
        custom_one VARCHAR,
        shareurl VARCHAR,
        shorturl VARCHAR,
        chatformshorturl VARCHAR,
        task_iframe_code TEXT,
        chatform_iframe_code TEXT,
        no_of_tabs VARCHAR,
        tab_name VARCHAR,
        custom_two VARCHAR,
        ref_task TEXT,
        ref_task_no TEXT,
        ref_task_code TEXT,
        chatform_name VARCHAR,
        chatform_url TEXT,
        app_name VARCHAR,
        app_code VARCHAR,
        page_name VARCHAR,
        database_name VARCHAR
      );

      order_sample (
        order_id INTEGER,
        created_date TIMESTAMP,
        product_id INTEGER,
        product_name VARCHAR(255),
        sku VARCHAR(50),
        product_quantity INTEGER,
        product_base_price VARCHAR(50),
        product_total VARCHAR(50),
        partial_refund_amount TEXT,
        transaction_id TEXT,
        customer_id INTEGER,
        order_paid_date TIMESTAMP,
        order_notes TEXT,
        order_status VARCHAR(50),
        currency VARCHAR(3),
        tax_total VARCHAR(50),
        order_total VARCHAR(50),
        payment_method VARCHAR(100),
        billing_postcode VARCHAR(20),
        shipping_country VARCHAR(2),
        shipping_company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        customer VARCHAR(255),
        user_name VARCHAR(255)
      );

      The queries should be dynamic and retrieve data based on the user's request and user session details. Here are the session details:
      - User ID: ${session.user.id}
      - Business Name: ${session.user.business_name} 
      - User Name: ${session.user.name}
      - User Email: ${session.user.email}
      - User Mobile: ${session.user.mobile}
      - Business Number: ${session.user.business_number}
      - First Name: ${session.user.first_name}
      - Last Name: ${session.user.last_name}

      If the user asks about projects/plans, use these example queries:
      - For project timeline:
        SELECT plan_id, plan_name, plan_start_date, plan_end_date, actual_start_date, actual_end_date 
        FROM plan 
        ;

      - For project progress:
        SELECT plan_id, plan_name, progress_percent, status, plan_progress_track
        FROM plan
        ;

      - For project phases:
        SELECT p.plan_id, p.plan_name, ph.plan_phase_id, ph.plan_phase_name, ph.progress_percent, ph.status
        FROM plan p
        JOIN plan_phase ph ON p.plan_id = ph.plan_id
        ;

      If the user asks about tasks, use these example queries:
      - For task details:
        SELECT task_id, plan_id, plan_phase_id, plan_start_date, plan_end_date, progress_percent, status
        FROM task
        ;

      - For task progress:
        SELECT t.task_id, t.plan_id, p.plan_name, t.progress_percent, t.status
        FROM task t
        JOIN plan p ON t.plan_id = p.plan_id
        ;

      When querying for order-related data, filter results based on the dataFilter value:
      - If the dataFilter is 'get-all', return all data with no filtering.
      - If the dataFilter is 'get-business-data', filter the results by the session's business_name (mapped to the "customer" field in order_sample).
      - If the dataFilter is 'get-user-data', filter the results by the session's user_email and compare with the user_name field in the order_sample table.

      Ensure all queries are meaningful, error-free, and suitable for chart visualization.

      When querying numeric fields like 'product_total' and 'order_total', clean them using REGEXP_REPLACE and cast to DECIMAL:
      Example: CAST(NULLIF(REGEXP_REPLACE(product_total, '[^0-9.]+', '', 'g'), '') AS DECIMAL).

      When querying by string fields (like user_name or product_name), use LOWER() with ILIKE for case-insensitive search.

      Example Queries:
      - get-all: SELECT * FROM order_sample;
      - get-business-data: SELECT * FROM order_sample WHERE LOWER(customer) = LOWER('${session.user.business_name}');
      - get-user-data: SELECT * FROM order_sample WHERE LOWER(user_name) = LOWER('${session.user.email}');`,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input} based on the dataFilter: ${dataFilter}`,
      schema: z.object({
        query: z.string(),
      }),
    });

    // Base query generated by the model
    let query = result.object.query.trim();

    // Applying filters based on the dataFilter value
    if (dataFilter === "get-all") {
      // No additional filtering needed
      console.log("get-all: No filtering applied");
    } else if (dataFilter === "get-business-data") {
      // Filter by business_name
      if (query.toUpperCase().includes("WHERE")) {
        query = query.replace(
          "WHERE",
          `WHERE LOWER(customer) = LOWER('${session.user.business_name}') AND`
        );
      } else {
        query += ` WHERE LOWER(customer) = LOWER('${session.user.business_name}')`;
      }
    } else if (dataFilter === "get-user-data") {
      // Filter by user_email matching user_name
      if (query.toUpperCase().includes("WHERE")) {
        query = query.replace(
          "WHERE",
          `WHERE LOWER(user_name) = LOWER('${session.user.email}') AND`
        );
      } else {
        query += ` WHERE LOWER(user_name) = LOWER('${session.user.email}')`;
      }
    }

    console.log("Generated Query:", query);
    return query;
  } catch (e) {
    console.error("Error generating query:", e);
    throw new Error("Failed to generate query");
  }
};

export const runGenerateSQLQuery = async (query: string) => {
  "use server";
  // Basic SQL injection prevention with better whitespace handling
  const sanitizedQuery = query.replace(/\s+/g, " ").trim().toLowerCase();
  console.log("Sanitized query:", sanitizedQuery);

  // Improved validation
  if (!sanitizedQuery.split(" ")[0].includes("select")) {
    throw new Error("Query must start with SELECT");
  }

  // Check for dangerous keywords with word boundaries
  const dangerousKeywords = [
    "drop",
    "delete",
    "insert",
    "update",
    "alter",
    "truncate",
    "create",
    "grant",
    "revoke",
  ];
  const containsDangerousKeywords = dangerousKeywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(sanitizedQuery);
  });

  if (containsDangerousKeywords) {
    throw new Error("Query contains unauthorized operations");
  }

  let data: any;
  try {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();

    // Handle date-based queries
    let processedQuery = query;
    if (
      sanitizedQuery.includes("created_date") ||
      sanitizedQuery.includes("order_paid_date")
    ) {
      console.log("Date-based query detected");

      // Try both EXTRACT and TO_CHAR formats
      try {
        if (sanitizedQuery.includes("to_char")) {
          processedQuery = query.replace(
            /TO_CHAR\(\s*(created_date|order_paid_date)\s*,\s*'YYYY'\s*\)\s*=\s*'(\d{4})'/gi,
            "EXTRACT(YEAR FROM $1)::INTEGER = $2"
          );
        }
        console.log("Processed query:", processedQuery);
      } catch (e) {
        console.error("Error processing date query:", e);
        // Continue with original query if conversion fails
        processedQuery = query;
      }
    }

    data = await client.query(processedQuery);
    console.log("Query executed successfully");
    await client.end();
  } catch (e: any) {
    console.error("Database error:", e.message);
    if (e.message.includes('relation "order_sample" does not exist')) {
      throw new Error("Table does not exist");
    }
    throw new Error(`Database error: ${e.message}`);
  }

  return data.rows as Result[];
};

export const generateChartConfig = async (
  results: Result[],
  userQuery: string
) => {
  "use server";
  const system = `You are a data visualization expert.`;

  try {
    const { object: config } = await generateObject({
      model: openai("gpt-4o"),
      system,
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualizes the data and answers the user's query.
      Use appropriate chart types such as bar, line, bar horizontal, or pie or
    "Data Card Line Chart",
    "Data Card Bar Chart",
    "Data Card Bar Chart Horizontal",
    "Data Card Donut Chart", depending on the data.

      Here is an example complete config:
      export const chartConfig = {
       
        xKey: "country",
        yKeys: ["user_count"],
        colors: {
          user_count: "#4CAF50"
        },
        
        legend: true
      }

      User Query:
      ${userQuery}

      Data:
      ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    });

    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    const updatedConfig: Config = { ...config };
    return { config: updatedConfig };
  } catch (e) {
    console.error((e as Error).message);
    throw new Error("Failed to generate chart suggestion");
  }
};
