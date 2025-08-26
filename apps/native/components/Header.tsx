import { View, Image } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "./elements/Text";
import { useHeader } from "@/context/header-context";
import { Pressable } from "react-native";
import { useAuth } from "@/context/supabase-provider";
import { useRouter } from "expo-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./elements/DropdownMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LucideIcon from "./LucideIcon";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeOutUp,
} from "react-native-reanimated";
import { BellIcon } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "./elements/Avatar";
import { useTheme } from "@/context/theme-context";

export function Header() {
	const router = useRouter();
	const { title, showBack, show } = useHeader();
	const { userCatalog, signOut } = useAuth();
	const { setOpenModel, openModel } = useTheme();

	// Ensure names are strings and encode for URL
	const firstName = (userCatalog?.first_name || "f").toString();
	const lastName = (userCatalog?.last_name || "l").toString();
	const avatarUrl = `https://ui-avatars.com/api/?name=k${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=0D8ABC&color=fff`;
	const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
	const [imageError, setImageError] = React.useState(false);

	const triggerRef =
		React.useRef<React.ElementRef<typeof DropdownMenuTrigger>>(null);
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	if (!show) {
		return <></>;
	}

	return (
		<Animated.View
			entering={FadeInDown.duration(250)}
			exiting={FadeOutUp.duration(200)}
			style={{ backgroundColor: "transparent" }}
		>
			<View className="flex-row items-center justify-between px-4 pt-4 pb-4 bg-background">
				<View className="flex-row items-center gap-x-2">
					{showBack && (
						<Pressable
							onPress={() => {
								/* TODO: navigation.goBack() */
							}}
							className="flex mr-1"
						>
							<Text className="flex">
								<MaterialIcons name="arrow-back" size={16} />
							</Text>
						</Pressable>
					)}
					{imageError ? (
						<View
							style={{
								width: 36,
								height: 36,
								borderRadius: 18,
								backgroundColor: "#0D8ABC",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
								{initials}
							</Text>
						</View>
					) : (
						<Image
							source={{ uri: avatarUrl }}
							style={{ width: 36, height: 36, borderRadius: 18 }}
							onError={() => setImageError(true)}
						/>
					)}
					<View>
						<Text className="font-semibold text-md">
							{title || "AI Assistant"}
						</Text>
						{/* <Text className="text-xs text-green-400">Online</Text> */}
					</View>
				</View>
				<View className="flex-row items-center gap-x-4 max-h-7">
					<Pressable onPress={() => router.push("/(protected)/notifications")}>
						<Text>
							{" "}
							<LucideIcon name="Bell" size={16} className="text-primary" />{" "}
						</Text>
					</Pressable>
					{/* <Pressable
                    className="absolute top-0 right-0 active:bg-primary/5"
                    onPress={() => {
                        triggerRef.current?.open();
                    }}
                /> */}
					<DropdownMenu>
						<DropdownMenuTrigger ref={triggerRef} asChild>
							<Text className=" native:mb-1">
								<LucideIcon
									name="Menu"
									size={16}
									className="mb-1 text-primary"
								/>
							</Text>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							insets={contentInsets}
							className="w-64 native:w-72"
						>
							<DropdownMenuLabel className="p-1 font-normal">
								<View className="flex flex-row items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar
										className="h-8 w-8 rounded-lg"
										alt={userCatalog?.username}
									>
										<AvatarImage src={userCatalog?.image_url} />
										<AvatarFallback className="rounded-lg">
											<Text>{initials}</Text>
										</AvatarFallback>
									</Avatar>
									<View className="grid flex-1 text-left text-sm leading-tight">
										<View className="truncate font-semibold">
											<Text>
												{userCatalog?.first_name} {userCatalog?.last_name}
											</Text>
										</View>
										<View className="truncate text-xs">
											<Text>{userCatalog?.user_email}</Text>
										</View>
									</View>
								</View>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuItem
								onPress={() => router.push("/(protected)/chats")}
							>
								<Text>
									<LucideIcon name="Users" size={16} className="text-primary" />
								</Text>
								<Text>Chats</Text>
							</DropdownMenuItem>

							<DropdownMenuItem onPress={() => router.push("/")}>
								<Text>
									<LucideIcon name="Menu" size={16} className="text-primary" />
								</Text>
								<Text>Role Menu</Text>
							</DropdownMenuItem>
							{/* <DropdownMenuItem onPress={() => router.push("/server")}>
                            <Text><LucideIcon name="Menu" size={16} className="text-primary" /></Text>
                            <Text>server</Text>
                        </DropdownMenuItem> */}
							<DropdownMenuItem
								onPress={() => router.push("/analyticassistant/new")}
							>
								<Text>
									<LucideIcon name="Bot" size={16} className="text-primary" />
								</Text>
								<Text>Analytic Assistant</Text>
							</DropdownMenuItem>

							<DropdownMenuItem onPress={() => router.push("/token-usage")}>
								<Text>
									<LucideIcon name="Coins" size={16} className="text-primary" />
								</Text>
								<Text>Token Usage</Text>
							</DropdownMenuItem>

							<DropdownMenuSeparator />
							<DropdownMenuItem onPress={signOut}>
								<Text>
									<LucideIcon
										name="LogOut"
										size={16}
										className="text-primary"
									/>
								</Text>
								<Text>Log out</Text>
							</DropdownMenuItem>
							<DropdownMenuItem onPress={() => setOpenModel(!openModel)}>
								<Text>
									<LucideIcon
										name="Palette"
										size={16}
										className="text-primary"
									/>
								</Text>
								<Text>Theme Settings</Text>
								<DropdownMenuShortcut>
									<Text className="text-xs">Ctrl+T</Text>
								</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuItem
								onPress={() => router.push("/(protected)/store-settings-next")}
							>
								<Text>
									<LucideIcon
										name="Palette"
										size={16}
										className="text-primary"
									/>
								</Text>
								<Text>Store Settings</Text>
								<DropdownMenuShortcut>
									<Text className="text-xs">Ctrl+T</Text>
								</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuItem
								onPress={() => router.push("/(protected)/langchain-chat")}
							>
								<Text>
									<LucideIcon
										name="Palette"
										size={16}
										className="text-primary"
									/>
								</Text>
								<Text>Langchain chat</Text>
								<DropdownMenuShortcut>
									<Text className="text-xs">Ctrl+T</Text>
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</View>
			</View>
		</Animated.View>
	);
}
