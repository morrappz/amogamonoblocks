import { useAuth } from "@/context/supabase-provider";
import { View, Platform } from "react-native";
import { WebView } from "react-native-webview";

const StoreSettings = ({ userId }: { userId: string }) => {
	const { session } = useAuth();
	console.log("session-----", session);
	const nextUrl = `http://localhost:3000/api/expo-login?email=${session?.user.email}&callbackUrl=/store-settings`;

	return (
		<View className="w-full h-full">
			{Platform.OS === "web" ? (
				<iframe className="w-full h-full" src={nextUrl} />
			) : (
				<WebView
					source={{ uri: nextUrl }}
					style={{ width: "100%", height: "100%" }}
				/>
			)}
		</View>
	);
};

export default StoreSettings;
