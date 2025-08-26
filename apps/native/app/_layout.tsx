import "../global.css";
import '@/lib/polyfills';
import { Stack } from "expo-router";

import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/context/theme-context";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationProvider } from "@/context/notification-context";
import { GlobalDialog } from "@/components/GlobalDialog";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
	BACKGROUND_NOTIFICATION_TASK,
	async ({ data, error, executionInfo }) => {
		console.log("✅ Received a notification in the background!", {
			data,
			error,
			executionInfo,
		});
		// Do something with the notification data
	}
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<>
			<GestureHandlerRootView className={`flex flex-col h-full w-full`}>
				<AuthProvider>
					<NotificationProvider>
						<ThemeProvider>
							<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
								<Stack.Screen name="(protected)" />
								<Stack.Screen name="welcome" />
								<Stack.Screen
									name="sign-up"
									options={{
										presentation: "modal",
										headerShown: true,
										headerTitle: "Sign Up",
										headerStyle: {
											backgroundColor:
												colorScheme === "dark"
													? colors.dark.background
													: colors.light.background,
										},
										headerTintColor:
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground,
										gestureEnabled: true,
									}}
								/>
								<Stack.Screen
									name="sign-in"
									options={{
										presentation: "modal",
										headerShown: true,
										headerTitle: "Sign In",
										headerStyle: {
											backgroundColor:
												colorScheme === "dark"
													? colors.dark.background
													: colors.light.background,
										},
										headerTintColor:
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground,
										gestureEnabled: true,
									}}
								/>
							</Stack>
							<PortalHost />
							<Toaster />
							<GlobalDialog />
						</ThemeProvider>
					</NotificationProvider>
				</AuthProvider>
			</GestureHandlerRootView>
		</>
	);
}
