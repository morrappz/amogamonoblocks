import React from 'react';
import { View } from 'react-native';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Text } from '../elements/Text';
import { Message } from '@/database/model';
import { Q } from '@nozbe/watermelondb';
import { Database } from '@nozbe/watermelondb';

interface Props {
    message?: Message;
}

const ReplyPreviewComponent = ({ message }: Props) => {
    if (!message) {
        return (
            <View className="p-2 border-l-4 border-blue-400 bg-blue-50/50">
                <Text className="font-bold text-gray-500 text-xs">Message not available</Text>
                <Text className="text-gray-400 text-xs italic">This message may have been deleted.</Text>
            </View>
        );
    }

    return (
        <View className="p-2 border-l-4 border-blue-400 bg-blue-50/50">
            <Text className="font-bold text-blue-600 text-xs">{message.senderName || 'Original Sender'}</Text>
            <Text className="text-gray-600 text-xs" numberOfLines={1} ellipsizeMode="tail">
                {message.content || 'Attachment'}
            </Text>
        </View>
    );
};

const enhance = withObservables(['messageId'], ({ database, messageId }: { database: Database, messageId: string }) => ({
    message: database.get<Message>('messages').findAndObserve(messageId),
}));

export default withDatabase(enhance(ReplyPreviewComponent));