"use server";

import { postgrest } from "@/lib/postgrest";
import { Pool } from "pg";

// Function to get the database schema
export async function getDatabaseSchema(
  connectionString: string,
  allowedTables: string[] = []
) {
  try {
    const pool = new Pool({
      connectionString,
    });

    const client = await pool.connect();

    try {
      // Query to get tables and columns
      const query = `
        SELECT 
          t.table_name, 
          c.column_name, 
          c.data_type,
          c.is_nullable,
          c.column_default,
          tc.constraint_type
        FROM 
          information_schema.tables t
        JOIN 
          information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN 
          information_schema.key_column_usage kcu ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
        LEFT JOIN 
          information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
        WHERE 
          t.table_schema = 'public'
        ORDER BY 
          t.table_name, 
          c.ordinal_position;
      `;

      const result = await client.query(query);

      // Transform the result into a more usable format
      const tables: Record<
        string,
        {
          name: string;
          columns: {
            name: string;
            type: string;
            nullable: boolean;
            default: string;
            isPrimaryKey: boolean;
          }[];
        }
      > = {};

      result.rows.forEach((row) => {
        const {
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default,
          constraint_type,
        } = row;

        if (!tables[table_name]) {
          tables[table_name] = {
            name: table_name,
            columns: [],
          };
        }

        tables[table_name].columns.push({
          name: column_name,
          type: data_type,
          nullable: is_nullable === "YES",
          default: column_default,
          isPrimaryKey: constraint_type === "PRIMARY KEY",
        });
      });

      return {
        success: true,
        tables: Object.values(tables).filter((t: { name: string }) =>
          allowedTables.includes(t.name)
        ),
      };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error getting database schema:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get database schema",
    };
  }
}

// Function to execute SQL queries
export async function executeSql(connectionString: string, sql: string) {
  try {
    const pool = new Pool({
      connectionString,
    });

    const client = await pool.connect();

    try {
      // Execute the query
      const result = await client.query(sql);

      // Format the result
      return {
        success: true,
        queryResults: [
          {
            rows: result.rows.slice(0, 100), // Limit to 100 rows
            fields: result.fields.map((field) => ({
              name: field.name,
              dataTypeID: field.dataTypeID,
            })),
          },
        ],
      };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error executing SQL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to execute SQL query",
    };
  }
}

// Function to test database connection
export async function testConnection(connectionString: string) {
  try {
    const pool = new Pool({
      connectionString,
    });

    const client = await pool.connect();
    client.release();
    await pool.end();

    return { success: true, message: "Connection successful" };
  } catch (error) {
    console.error("Error testing connection:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
    };
  }
}

export async function createChat(id: string, userId: string) {
  try {
    const { data: chat, error } = await postgrest
      .asAdmin("chat_db")
      .from("Chat")
      .insert({
        id,
        createdAt: new Date().toISOString(),
        user_id: userId,
        title: "New Chat",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      throw new Error("Failed to create chat");
    }

    return chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function saveMessage(message: {
    id: string;
    chatId: string;
    content: string;
    role: "user" | "assistant";
    userId: string;
    toolInvocations?: Array<{
        toolName: string;
        args: Record<string, unknown>;
        result: unknown;
    }>;
    parts?: Array<{
        type: "text" | "tool_call" | "tool_result";
        content: string;
    }>;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}) {
    try {
        const { data, error } = await postgrest
            .asAdmin("chat_db")
            .from("Message")
            .insert({
                id: message.id,
                chatId: message.chatId,
                content: message.content,
                role: message.role,
                createdAt: new Date().toISOString(),
                user_id: message.userId,
                toolInvocations: message.toolInvocations || null,
                parts: message.parts || null,
                usage: message.usage || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving message:", error);
            throw new Error("Failed to save message");
        }

        return data;
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

export async function getChatHistory(userId: string) {
  try {
    const { data, error } = await postgrest
      .asAdmin("chat_db")
      .from("Chat")
      .select("*")
      .eq("user_id", userId)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new Error("Failed to fetch chat history");
    }

    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
}

export async function deleteChat(id: string) {
  try {
    const { error } = await postgrest
      .asAdmin("chat_db")
      .from("Chat")
      .update({ status: "delete" })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to delete chat");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

export async function updateMessageFavorite(messageId: string, favorite: boolean) {
  try {
    const { data, error } = await postgrest
      .asAdmin("chat_db")
      .from("Message")
      .update({ favorite })
      .eq("id", messageId)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update message favorite");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating message favorite:", error);
    throw error;
  }
}

export async function updateMessageFeedback(messageId: string, isLike: boolean | null) {
  try {
    const { data, error } = await postgrest
      .asAdmin("chat_db")
      .from("Message")
      .update({ isLike })
      .eq("id", messageId)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update message feedback");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating message feedback:", error);
    throw error;
  }
}

export async function updateChatBookmark(chatId: string, bookmark: boolean) {
  try {
    const { data, error } = await postgrest
      .asAdmin("chat_db")
      .from("Chat")
      .update({ bookmark })
      .eq("id", chatId)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update chat bookmark");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating chat bookmark:", error);
    throw error;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { error } = await postgrest
      .asAdmin("chat_db")
      .from("Message")
      .delete()
      .eq("id", messageId);

    if (error) {
      throw new Error("Failed to delete message");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

export async function deleteMessagesAfter(chatId: string, timestamp: string) {
  try {
    const { data, error } = await postgrest
      .asAdmin("chat_db")
      .from("Message")
      .delete()
      .eq("chatId", chatId)
      .gt("createdAt", timestamp);

    if (error) {
      throw new Error("Failed to delete messages");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting messages:", error);
    throw error;
  }
}

export async function deleteMessagesByIds(messageIds: string[]) {
  try {
    const { error } = await postgrest
      .asAdmin("chat_db")
      .from("Message")
      .delete()
      .in("id", messageIds);

    if (error) {
      throw new Error("Failed to delete messages");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting messages:", error);
    throw error;
  }
}
