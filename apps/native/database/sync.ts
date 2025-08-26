import { SyncDatabaseChangeSet, synchronize } from '@nozbe/watermelondb/sync';
import { database } from '.';
import { supabase } from '@/config/supabase';
import { uploadAttachmentToSupabase } from './chatService';
import { Database } from '@/types/supabase.types';
import { Message } from './model';

type SupabaseTable = keyof Database['public']['Tables'];

const LOCAL_FIELDS_PER_TABLE: Record<string, string[]> = {
    message: ['agentMsgId', '_status', '_changed', 'attachment_local_path', 'chat_identifier', 'file_meta', 'is_liked', 'timestamp'],
    user_catalog: ['_status', '_changed'],
    chat_group: ['_status', '_changed'],
};

function fixDates(record: any, dateFields: string[] = ['created_at', 'updated_at', 'deleted_at'], save: boolean = false) {
    const fixed = { ...record };
    for (const field of dateFields) {
        if (!fixed[field]) {
            continue;
        }

        if (save) {
            // Case 1: 'save' is true. Convert ISO string to UNIX milliseconds (number).
            // Check if the field is a string (ISO date) before attempting conversion.
            if (typeof fixed[field] === 'string') {
                const date = new Date(fixed[field]);
                // Ensure the date is valid before converting to milliseconds.
                if (!isNaN(date.getTime())) {
                    fixed[field] = date.getTime();
                }
            }
        } else {
            // Case 2: 'save' is false (default behavior). Convert UNIX milliseconds (number) to ISO string.
            // Check if the field is a number (UNIX milliseconds) before attempting conversion.
            if (typeof fixed[field] === 'number') {
                fixed[field] = new Date(fixed[field]).toISOString();
            }
        }
    }
    return fixed;
}

function cleanRecordForTable(table: string, record: Record<string, any>) {
    const exclude = LOCAL_FIELDS_PER_TABLE[table] ?? ['_status', '_changed'];
    const cleaned: Record<string, any> = {};
    for (const key in record) {
        if (!exclude.includes(key)) {
            cleaned[key] = record[key];
        }
    }
    return fixDates(cleaned);
}

async function fetchAllInChunks({
    table,
    filters,
    idField = 'id',
    chunkSize = 500
}: {
    table: SupabaseTable;
    filters: string;
    idField?: string;
    chunkSize?: number;
}) {
    let allRows: any[] = [];
    let from = 0;
    let to = chunkSize - 1;
    let keepFetching = true;

    while (keepFetching) {
        let query = supabase
            .from(table)
            .select('*')
            .or(filters)
            .range(from, to);

        if (table === "message") {
            query = query.in("chat_message_type",["file","text"])
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error fetching ${table}: ${error.message}`);
        }

        allRows = allRows.concat(data || []);

        if (!data || data.length < chunkSize) {
            keepFetching = false; // All data fetched
        } else {
            from += chunkSize;
            to += chunkSize;
        }
    }

    return { data: allRows, error: null };
}

export async function sync() {
    await synchronize({
        database,

        pullChanges: async ({ lastPulledAt }) => {
            const timestampNow = Date.now();
            console.log(`🍉 Pulling changes since: ${lastPulledAt ?? "unknow"}`);
            const since = new Date((lastPulledAt ?? 10000000000));
            const sinceIso = since.toISOString();

            // TODO: load data in chunks, lot data crach android app
            // const [messages, chatGroups, users] = await Promise.all([
            //     supabase.from('message').select('*').or(`created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}`),
            //     supabase.from('chat_group').select('*').or(`created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}`),
            //     supabase.from('user_catalog').select('*').or(`created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}`),
            // ])
            const [messages, chatGroups, users] = await Promise.all([
                fetchAllInChunks({ table: 'message', filters: `created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}` }),
                fetchAllInChunks({ table: 'chat_group', filters: `created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}` }),
                fetchAllInChunks({ table: 'user_catalog', filters: `created_at.gt.${sinceIso},updated_at.gt.${sinceIso},deleted_at.gt.${sinceIso}` }),
            ]);

            const formatChanges = (rows: { data: any[]; error: null; }, idField: string, table: string = "") => {
                const created: any[] = [];
                const updated: any[] = [];
                const deleted: string[] = [];

                if (rows.error) {
                    throw new Error(`🍉 Error fetching ${idField}: ${(rows.error as any).message}`);
                }

                for (const row of rows.data || []) {
                    const stringId = String(row[idField]);

                    const record = {
                        ...row,
                        id: stringId,
                        created_at: (new Date(row.created_at + 'Z').getTime() || 0), // ✅ required for sort
                        updated_at: (new Date(row.updated_at + 'Z').getTime() || 0),
                        ...(table === 'message' ? {
                            group_id: String(row.group_id),
                            created_user_id: String(row.created_user_id),
                            chat_message_type: row.chat_message_type || 'text', // <-- ensure consistency
                        } : {}),
                        ...(table === 'chat_group' ? {
                            chat_group_users_json: String(JSON.stringify(row.chat_group_users_json || [])),
                            last_message_created_at: row.last_message_created_at ? new Date(row.last_message_created_at + 'Z').getTime() : 0,
                        } : {}),
                    };

                    if (row.deleted_at) {
                        deleted.push(stringId);
                    } else if (new Date(row.created_at).getTime() > (lastPulledAt ?? 0)) {
                        // created.push({ ...row, id: stringId });
                        updated.push(record);
                    } else {
                        updated.push(record);
                    }
                }

                return { created, updated, deleted };
            };

            console.log("getted all data")

            const changes: SyncDatabaseChangeSet = {
                messages: formatChanges(messages, 'id', 'message'),
                chat_group: formatChanges(chatGroups, 'id', 'chat_group'),
                user_catalog: formatChanges(users, 'user_catalog_id', 'user_catalog'),
            };

            console.log(`🍉 Messages: ${changes.messages.created.length} created, ${changes.messages.updated.length} updated, ${changes.messages.deleted.length} deleted`);
            console.log(`🍉 Chat Groups: ${changes.chat_group.created.length} created, ${changes.chat_group.updated.length} updated, ${changes.chat_group.deleted.length} deleted`);
            console.log(`🍉 Users: ${changes.user_catalog.created.length} created, ${changes.user_catalog.updated.length} updated, ${changes.user_catalog.deleted.length} deleted`);
            // return { changes: {}, timestamp: timestampNow };
            return { changes, timestamp: timestampNow };
        },

        pushChanges: async ({ changes }) => {
            console.log('🍉 Pushing changes:', changes);

            const groupChanges = changes.chat_group ?? { created: [], updated: [], deleted: [] };
            const idMapping: Record<string, string> = {}; // map local_id => new server id

            // for (const localGroup of localGroups) {
            //     // Check if group already exists remotely using `chat_identifier`
            //     const { data: existing, error } = await supabase
            //         .from('chat_group')
            //         .select('id, chat_group_id')
            //         .eq('chat_identifier', localGroup.chat_identifier)
            //         .maybeSingle();

            //     if (error) {
            //         throw new Error(`❌ Error checking existing group: ${error.message}`);
            //     }

            //     if (existing) {
            //         // Group already exists -> map to existing ID
            //         idMapping[localGroup.id] = String(existing.id);
            //     } else {
            //         // Create new remote group
            //         const { data: newGroup, error: insertErr } = await supabase
            //             .from('chat_group')
            //             .insert({
            //                 ...localGroup,
            //                 id: undefined, // let Supabase generate ID
            //                 created_at: new Date(localGroup.created_at).toISOString(),
            //                 updated_at: new Date(localGroup.updated_at).toISOString()
            //             })
            //             .select('id, chat_group_id')
            //             .single();

            //         if (insertErr) {
            //             throw new Error(`❌ Error inserting new group: ${insertErr.message}`);
            //         }

            //         idMapping[localGroup.id] = String(newGroup.id);
            //     }
            // }

            const messageChanges = changes.messages ?? { created: [], updated: [], deleted: [] };

            // This array will hold all the local database updates we need to perform in a single batch
            const localDbUpdates: (() => Promise<void>)[] = [];

            for (const m of [...messageChanges.created, ...messageChanges.updated]) {
                if (idMapping[m.group_id]) {
                    m.group_id = idMapping[m.group_id];
                }

                // 🧩 Handle attachment upload
                // Check if fileUpload exists, is an array, and has items
                if (m.file_upload_json) {
                    const fileUploads = JSON.parse(m.file_upload_json || '[]');
                    if (fileUploads.length > 0) {
                        // This will hold the updated file info with remote URLs
                        let updatedFileUploads = [];
                        let hasChanges = false; // Flag to check if we need to update the local record

                        for (const file of fileUploads) {
                            // Check if this specific file needs to be uploaded
                            if (file.attachmentLocalPath && !file.attachmentUrl) {
                                console.log(`🍉 Processing file_upload_json for message ${m.id}`, fileUploads);

                                try {
                                    const fileName = file.attachmentName || `${m.id}-${Date.now()}`;
                                    const uploadedUrl = await uploadAttachmentToSupabase(
                                        file.attachmentLocalPath,
                                        fileName,
                                        file.attachmentMimeType || 'application/octet-stream'
                                    );

                                    console.log(`Uploaded ${fileName}, URL: ${uploadedUrl}`);

                                    delete file.attachmentLocalPath

                                    // Update the file object with the new remote URL
                                    updatedFileUploads.push({
                                        ...file,
                                        attachmentUrl: uploadedUrl,
                                        attachmentName: fileName
                                    });
                                    hasChanges = true;
                                } catch (uploadError) {
                                    console.error(`❌ Failed to upload attachment ${file.attachmentName}:`, uploadError);
                                    // Push the original file object back so we don't lose it
                                    updatedFileUploads.push(file);
                                }
                            } else {
                                // This file already has a URL or no local path, keep it as is
                                updatedFileUploads.push(file);
                            }
                        }

                        if (hasChanges) {

                            console.log("updatedFileUploads", updatedFileUploads)
                            // Replace the original file_upload_json with the new one containing remote URLs
                            m.file_upload_json = updatedFileUploads;

                            localDbUpdates.push(async () => {
                                try {
                                    const messageToUpdate = await database.get('messages').find(m.id);
                                    if (messageToUpdate) {
                                        await messageToUpdate.update((record: Message) => {
                                            // Update the local record with the new JSON containing remote URLs
                                            record.fileUpload = updatedFileUploads;
                                        });
                                    }
                                } catch (error) {
                                    console.error(`❌ Failed to find local message ${m.id} to update with new URLs`, error);
                                }
                            });
                        }
                    }
                }
            }

            // After the loop, perform all collected local updates in a single transaction
            if (localDbUpdates.length > 0) {
                console.log(`🍉 Applying ${localDbUpdates.length} local DB updates for attachment URLs.`);
                await database.write(async () => {
                    await Promise.all(localDbUpdates.map(updateFn => updateFn()));
                });
            }

            // 🧹 Delete local groups that were replaced
            // await database.write(async () => {
            //     for (const localId of Object.keys(idMapping)) {
            //         const localGroup = await database.get('chat_group').find(localId);
            //         if (localGroup) await localGroup.markAsDeleted();
            //     }
            // });

            // 🟩 Upsert messages & updated groups
            const upsertOrIgnoreDeleted = async (
                table: string,
                { created = [], updated = [], deleted = [] }: any
            ) => {
                const data = [...created, ...updated];
                const toUpsert = []

                for (const row of data || []) {
                    const record = cleanRecordForTable(table, row);
                    record.created_at = new Date(record.created_at).toISOString();
                    record.updated_at = new Date(record.updated_at).toISOString();

                    if (table === 'message') {
                        record.created_user_id = record.created_user_id ? Number(record.created_user_id) : undefined;
                        // record.group_id = record.group_id ? Number(record.group_id) : undefined;
                        record.chat_message_type = record.chat_message_type || 'text';
                    }
                    if (table === 'chat_group') {
                        record.chat_group_users_json = JSON.parse(record.chat_group_users_json || "[]");
                        record.created_user_id = record.created_user_id ? Number(record.created_user_id) : undefined;
                        record.last_message_created_at = record.last_message_created_at ? new Date(record.last_message_created_at).toISOString() : undefined;

                        // if (!record.chat_group_id || record.chat_group_id === 0) {
                        delete record.chat_group_id; // Avoid sending null
                        // }
                    }
                    toUpsert.push(record);
                }

                console.log("🧪 Final payload before upsert: ", toUpsert);

                if (toUpsert.length) {
                    const { error: upsertError } = await supabase.from(table).upsert(toUpsert, {
                        onConflict: table === 'chat_group' ? 'id' : 'id',
                    });
                    if (upsertError) throw new Error(`🍉 Upsert error for ${table}: ${upsertError.message}`);
                }

                if (deleted.length) {
                    const { error: deleteError } = await supabase
                        .from(table)
                        .update({ deleted_at: new Date().toISOString() })
                        .in('id', deleted);
                    if (deleteError) throw new Error(`🍉 Delete error for ${table}: ${deleteError.message}`);
                }
            };

            console.log("groupChanges.created", groupChanges.created.filter(g => !String(g.id).startsWith('local_') && g.chat_group_name && g.chat_group_users_json !== "[]"))
            console.log("groupChanges.updated", groupChanges.updated.filter(g => !String(g.id).startsWith('local_') && g.chat_group_name && g.chat_group_users_json !== "[]"))

            // 🔁 Now sync back non-local group updates and messages
            await upsertOrIgnoreDeleted('chat_group', {
                created: groupChanges.created.filter(g => !String(g.id).startsWith('local_') && g.chat_group_name && g.chat_group_users_json !== "[]"),
                updated: groupChanges.updated.filter(g => !String(g.id).startsWith('local_') && g.chat_group_name && g.chat_group_users_json !== "[]"),
                deleted: groupChanges.deleted,
            });

            await upsertOrIgnoreDeleted('message', messageChanges);


            console.log('🍉 Pushed changes successfully.');
        },
        // With this setting we expect from server that new rows
        // will return in 'updated' key along with updates.
        // So WatermelonDB will treat them as accordingly.
        sendCreatedAsUpdated: true,
    });

    console.log('🍉 Synchronization completed.');
}
