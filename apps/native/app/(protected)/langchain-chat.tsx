import { useAuth } from "@/context/supabase-provider";
import { View, Platform } from "react-native";
import { WebView } from "react-native-webview";

const LangchainChat = ({ userId }: { userId: string }) => {
	const { session } = useAuth();
	const nextUrl = `http://localhost:3000/api/expo-login?email=${session?.user.email}&callbackUrl=/langchain-chat/chat`;

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

export default LangchainChat;
