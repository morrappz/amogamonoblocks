import "server-only";
import { postgrest } from "@/lib/postgrest";
import type { GetContactsSchema } from "./validations";
import { filterSupabase } from "@/lib/filter-columns";
import { contactStatuses } from "../type";

function applyFilters(
  query: any,
  input: GetContactsSchema,
  advancedTable: boolean
) {
  if (advancedTable) {
    const { filters, joinOperator } = filterSupabase({
      filters: input.filters,
      joinOperator: input.joinOperator,
    });

    if (joinOperator === "and") {
      filters.forEach((filter) => {
        query = query.filter(filter.column, filter.operator, filter.value);
      });
    } else {
      const orConditions = filters
        .map((f) => `${f.column}.${f.operator}.${f.value}`)
        .join(",");
      query = query.or(orConditions);
    }
  } else {
    if (input.query) {
      query = query.or(
        `content.ilike.%${input.query}%,role.ilike.%${input.query}%,chat_group.ilike.${input.query}`
      );
    }
    if (input.from) {
      query = query.gte("createdAt", new Date(input.from).toISOString());
    }
    if (input.to) {
      query = query.lte("createdAt", new Date(input.to).toISOString());
    }
    if (input?.status?.length > 0) {
      query = query.in("status", input.status);
    }
  }
  return query;
}

export async function getRecords(input: GetContactsSchema) {
  try {
    const { page, perPage, sort, flags } = input;

    const offset = (page - 1) * perPage;
    const advancedTable = flags.includes("advancedTable");

    let query = postgrest
      .asAdmin()
      .from("message")
      .select(
        "role,content,createdAt,prompt_tokens,chat_group,completion_tokens,total_tokens"
      )
      .eq("chat_group", "LangStarter");
    query = applyFilters(query, input, advancedTable);

    // Sorting
    if (sort?.length > 0) {
      sort.forEach((sort) => {
        query = query.order(sort.id, { ascending: !sort.desc });
      });
    } else {
      query = query.order("updated_date", { ascending: true });
    }

    // Pagination
    query = query.range(offset, offset + perPage - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Get total count
    let countQuery = postgrest
      .asAdmin()
      .from("message")
      .select(
        "role,createdAt,prompt_tokens,chat_group,completion_tokens,total_tokens",
        { count: "exact", head: true }
      )
      .eq("chat_group", "LangStarter");
    countQuery = applyFilters(countQuery, input, advancedTable);

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const pageCount = Math.ceil((count || 0) / perPage);
    return { data: data, pageCount };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { data: [], pageCount: 0 };
  }
}

export async function getDocumentCountByField(
  field: string,
  fieldValues?: string[]
) {
  try {
    const values = fieldValues
      ? fieldValues
      : field === "status"
      ? contactStatuses
      : [];
    if (!values.length) return {} as Record<string, number>;

    const counts = await Promise.all(
      values.map(async (v) => {
        const { count } = await postgrest
          .from("user_catalog")
          .select("*", { count: "exact" })
          .eq(field, v);
        return { v, count: count || 0 };
      })
    );
    return counts.reduce((acc, { v, count }) => {
      acc[v] = count;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error(`Error fetching document counts by ${field}:`, error);
    return {} as Record<string, number>;
  }
}
