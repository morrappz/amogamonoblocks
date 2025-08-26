import { View, Image, Platform, Linking, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "../elements/Text";
import { Button } from "../elements/Button";
import { Download, Eye } from "lucide-react-native";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";
import { AudioPlayer, useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { Message } from "@/database/model";
import { getOrCacheAttachment } from "@/lib/getOrCacheAttachment";
import LucideIcon from "../LucideIcon";

type FileAttachment = {
    attachmentName: string;
    attachmentType: string;
    attachmentUrl: string;
    attachmentLocalPath?: string;
};

type Props = {
    files: FileAttachment;
    offline: boolean
};


export default function MessageAttachmentPreview({ files, offline }: Props) {
    if (!files || files.length === 0) {
        return null;
    }
    return (
        <View className="w-full space-y-2">
            {files.map((file, index) => {
                const mimeType = file.attachmentType || '';

                // Render the correct preview based on the mime type
                if (mimeType === 'image') {
                    return <ImagePreview key={index} file={file} offline={offline} />;
                }

                if (mimeType === 'video') {
                    return <VideoPreview key={index} file={file} offline={offline} />;
                }

                // For audio and any other file type, use the generic preview
                // You can create a specific AudioPreview component if you want player controls
                return <GenericFilePreview key={index} file={file} offline={offline} />;
            })}
        </View>
    );
}

const useAttachmentUri = (file: FileAttachment, offline: boolean) => {
    const [uri, setUri] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        const resolveUri = async () => {
            setIsLoading(true);
            let finalUri: string | undefined = undefined;

            // On native, prioritize local path, then try to cache remote URL if offline mode is on
            if (Platform.OS !== 'web') {
                if (file.attachmentLocalPath) {
                    finalUri = file.attachmentLocalPath;
                } else if (offline && file.attachmentUrl) {
                    finalUri = await getOrCacheAttachment(file.attachmentUrl);
                } else {
                    finalUri = file.attachmentUrl; // Fallback for online mode without local path
                }
            } else {
                // On web, always use the remote URL as local paths aren't directly accessible
                finalUri = file.attachmentUrl || file.attachmentLocalPath; // localPath might be a blob URL
            }

            if (isActive) {
                setUri(finalUri);
                setIsLoading(false);
            }
        };

        resolveUri();
        return () => { isActive = false; };
    }, [file, offline]);

    return { uri, isLoading };
};

const AttachmentLoader = () => (
    <View className="flex-row items-center justify-center p-3 bg-gray-100 rounded-md">
        <ActivityIndicator size="small" color="#6b7280" />
        <Text className="ml-2 text-gray-500">Loading attachment...</Text>
    </View>
);

// --- Image Preview Component ---
const ImagePreview = ({ file, offline }: { file: FileAttachment, offline: boolean }) => {
    const { uri, isLoading } = useAttachmentUri(file, offline);
    if (isLoading) return <AttachmentLoader />;
    if (!uri) return null;
    return <Image source={{ uri }} className="w-full h-60 rounded-md object-cover mb-2" />;
};

// --- Video Preview Component ---
const VideoPreview = ({ file, offline }: { file: FileAttachment, offline: boolean }) => {
    const { uri, isLoading } = useAttachmentUri(file, offline);
    const player = useVideoPlayer(uri || '', player => {
        player.loop = false;
        player.pause();
        player.muted = true;
    });

    useEffect(() => {
        if (uri) {
            // player.replace(uri);
            // player.pause();
        }
    }, [uri]);

    if (isLoading) return <AttachmentLoader />;
    if (!uri) return null;
    return <>
        <VideoView style={{ width: "100%", minHeight: 250 }} player={player} className="w-full h-64 rounded-md mb-2 bg-black" />
    </>;
};

// --- NEW Audio Preview Component ---
const AudioPreview = ({ file, offline }: { file: FileAttachment, offline: boolean }) => {
    const { uri, isLoading } = useAttachmentUri(file, offline);
    const [isPlaying, setIsPlaying] = useState(false);
    const player = useAudioPlayer(uri, (status) => {
        if (status) setIsPlaying(status.isPlaying);
    });

    useEffect(() => {
        if (uri) player.replace(uri);
    }, [uri]);

    if (isLoading) return <AttachmentLoader />;
    if (!uri) return null;

    const togglePlay = () => {
        isPlaying ? player.pause() : player.play();
    };

    return (
        <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-md mb-2">
            <View className="flex-1 pr-3">
                <Text className="font-medium text-primary truncate">{file.attachmentName}</Text>
            </View>
            <Button onPress={togglePlay} variant="ghost" size="icon">
                <LucideIcon name={isPlaying ? "Pause" : "Play"} size={16} />
            </Button>
        </View>
    );
};

// --- Generic File Preview Component ---
const GenericFilePreview = ({ file, offline }: { file: FileAttachment, offline: boolean }) => {
    const { uri, isLoading } = useAttachmentUri(file, offline);

    const openFile = () => {
        if (uri) {
            if (Platform.OS === 'web') window.open(uri, '_blank');
            else Linking.openURL(uri).catch(err => console.error('Failed to open URL:', err));
        }
    };

    const downloadFile = () => {
        if (uri && Platform.OS === 'web') {
            const link = document.createElement("a");
            link.href = uri;
            link.download = file.attachmentName || "download";
            link.click();
        }
    };

    if (isLoading) return <AttachmentLoader />;
    if (!uri) return null;

    return (
        <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-md mb-2">
            <View className="flex-1 pr-3">
                <Text className="font-medium text-primary truncate">{file.attachmentName}</Text>
                <Text className="text-gray-500 text-xs">{file.attachmentType}</Text>
            </View>
            <View className="flex-row gap-2">
                <Button variant="ghost" size="icon" onPress={openFile}>
                    <LucideIcon name="Eye" size={16} />
                </Button>
                {Platform.OS === 'web' && (
                    <Button variant="ghost" size="icon" onPress={downloadFile}>
                        <LucideIcon name="Download" size={16} />
                    </Button>
                )}
            </View>
        </View>
    );
};
