import * as FileSystem from 'expo-file-system';
import { database } from '@/database';

export async function getOrCacheAttachment(attachmentUrl: string | undefined, offline: boolean = true): Promise<string> {
    if (!offline) return attachmentUrl || '';
    if (!attachmentUrl) {
        // console.warn("No attachment URL provided");
        return '';
    }
    const fileName = attachmentUrl.split('/').pop();
    if (!fileName) {
        console.warn("Invalid attachment URL:", attachmentUrl);
        return '';
    }

    const localPath = `${FileSystem.documentDirectory}chat_attachments/${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(localPath);

    if (fileInfo.exists) {
        return localPath;
    }

    if (!attachmentUrl) {
        // throw new Error("No remote attachment URL");
        return ''
    }

    // Ensure folder exists
    const folder = `${FileSystem.documentDirectory}chat_attachments/`;
    const folderInfo = await FileSystem.getInfoAsync(folder);
    if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }

    try {
        const result = await FileSystem.downloadAsync(attachmentUrl, localPath);

        // // Update local DB
        // await database.write(async () => {
        //     await message.update(() => {
        //         message.attachmentLocalPath = result.uri;
        //     });
        // });

        return result.uri;
    } catch (err) {
        console.error("Failed to download attachment: ", attachmentUrl , " error:", err);
        return attachmentUrl;
    }
}
