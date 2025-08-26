"use server";

import { postgrest } from "@/lib/postgrest";
import { revalidateTag, unstable_noStore } from "next/cache";
import { UploadAttachment } from "@/lib/minio";
import { getErrorMessage } from "@/lib/handle-error";

export async function createMessage(payload) {
  try {
    const { data, error } = await postgrest.from("message").insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMessageForPreview(msgId: string) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .select("*")
      .eq("id", msgId);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateMessageIcon(
  messageId: string,
  icon: string,
  currentValue: boolean
) {
  try {
    const updateData =
      icon === "important"
        ? { important: !currentValue }
        : { favorite: !currentValue };

    const { data, error } = await postgrest
      .from("message")
      .update(updateData)
      .eq("id", messageId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating message icon:", error);
    throw error;
  }
}

export async function getMessages(id: string) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .select("*")
      .eq("soc_room_id", id);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchMessages() {
  try {
    const { data, error } = await postgrest.from("message").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMessagesByAgentId(id: number) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .select("*")
      .eq("agentMsgId", id);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getLatestMessages() {
  try {
    const { data, error } = await postgrest.from("latest_message").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function addLatestMessage(payload) {
  try {
    const { data, error } = await postgrest
      .from("latest_message")
      .insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateLatestMessage(payload, id) {
  try {
    const data = postgrest.from("latest_message").insert(payload).eq("id", id);

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getReceiverUserData(id: number) {
  try {
    const data = postgrest
      .from("user_catalog")
      .select("*")
      .eq("user_catalog_id", id);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createGroup(payload) {
  try {
    const { data, error } = await postgrest.from("chat_group").insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getGroupData(chat_group_id) {
  try {
    const { data, error } = await postgrest
      .from("chat_group")
      .select("*")
      .eq("chat_group_id", chat_group_id);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateGroupData(chat_group_id, payload) {
  try {
    const { data, error } = await postgrest
      .from("chat_group")
      .update(payload)
      .eq("chat_group_id", chat_group_id);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createUser(payload) {
  try {
    const { data, error } = await postgrest
      .from("user_catalog")
      .insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(payload, id: number) {
  try {
    const { data, error } = await postgrest
      .from("user_catalog")
      .update(payload)
      .eq("user_catalog_id", id);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function uploadFile(
  file: File,
  fileName: string,
  filePath: string,
  fileType: string,
  folderGroup: string
) {
  unstable_noStore();
  try {
    let file_publish_url;
    if (file) {
      const result = await UploadAttachment({
        file: file,
        fileName: fileName,
        folderName: filePath,
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      file_publish_url = result.url;
    }

    const { data, error } = await postgrest
      .from("file_upload")
      .insert([
        {
          file_publish_url: file_publish_url,
          file_type: fileType,
          folder_name: fileType,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          folder_group: folderGroup,
          file_name: fileName,
          status: "active",
        },
      ])
      .select("file_upload_id")
      .single();

    if (error) throw error;

    revalidateTag("file_upload");
    revalidateTag("file_upload-status-counts");

    return {
      data,
      error: null,
      url: file_publish_url,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function fetchFormSetupData(agentUuid: string) {
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("")
      .eq("agent_uuid", agentUuid);
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}
