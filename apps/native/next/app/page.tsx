// next/app/page.tsx
"use client";

import { View, Text, Pressable } from "react-native";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();
	return (
		<View
			style={{
				flex: 1,
				minHeight: "100vh",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text style={{ fontSize: 24, marginBottom: 12 }}>
				Hello from Next + Expo (web)
			</Text>

			<Pressable onPress={() => router.push("/profile")}>
				<Text>Go to Profile</Text>
			</Pressable>
		</View>
	);
}
