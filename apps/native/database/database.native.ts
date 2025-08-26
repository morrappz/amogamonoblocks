import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { UserCatalog, ChatGroup, Message } from "./model";
import { schema } from './schema';
import { Platform } from 'react-native';

const dbName = 'amoga_mobile_27'

const adapter = new SQLiteAdapter({
    schema,
    jsi: Platform.OS === 'ios' ? true : false, // Enable JSI for iOS, disable for Android
    dbName: dbName,
    onSetUpError: (error) => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error("Database setup error:", error);
    }
});

export const database = new Database({
    adapter: adapter,
    modelClasses: [UserCatalog, ChatGroup, Message],
});
