// next/app/profile/page.tsx
"use client";

import { View, Text, Pressable } from "react-native";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
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
			<Text style={{ fontSize: 24, marginBottom: 12 }}>Profile Page (web)</Text>
			<Pressable onPress={() => router.back()}>
				<Text>Go back</Text>
			</Pressable>
		</View>
	);
}
