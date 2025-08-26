import { View, ScrollView, RefreshControl, Modal, Text as DText, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { useHeader } from "@/context/header-context";
import { useAuth } from "@/context/supabase-provider";
import { Button } from "@/components/elements/Button";
import { H3, P } from "@/components/elements/Typography";
import { Input } from "@/components/elements/Input";
import { Label } from "@/components/elements/Label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/elements/DropdownMenu";
import { Switch } from "@/components/elements/Switch";
import { Skeleton } from "@/components/elements/Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/elements/Avatar";
import LucideIcon from "@/components/LucideIcon";
import { Text } from "@/components/elements/Text";
import { cn } from "@/lib/utils";
import { supabase } from "@/config/supabase";
import Animated, { FadeIn } from "react-native-reanimated";
import { CardContent, PressableCard } from "@/components/elements/Card";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Contact {
	user_catalog_id: string;
	status?: string;
	first_name: string;
	last_name: string;
	user_email: string;
	user_mobile: string;
	user_name: string;
	profile_pic_url?: string;
	business_name?: string;
	business_number?: string;
	for_business_name?: string;
	for_business_number?: string;
	business_city?: string;
	business?: string;
}

const contactSchema = z.object({
	first_name: z.string().min(1, { message: "First Name is required" }),
	last_name: z.string().min(1, { message: "Last Name is required" }),
	user_email: z.string().email({ message: "Valid email required" }),
	user_mobile: z.string().min(1, { message: "User Mobile is required" }),
	business: z.string().optional(),
	business_roles: z.string().optional(),
	business_address_1: z.string().optional(),
	business_address_2: z.string().optional(),
	business_country: z.string().optional(),
	business_state: z.string().optional(),
	business_city: z.string().optional(),
	business_postcode: z.string().optional(),
	profile_pic_url: z.string().optional(),
	status: z.string().min(1, { message: "Status is required" }),
});

function DebugBox({ label, zIndex, elevation, top, left }) {
	return (
		<View
			style={{
				position: 'absolute',
				top,
				left,
				padding: 12,
				backgroundColor: 'white',
				borderColor: 'black',
				borderWidth: 2,
				zIndex,
				elevation,
				shadowColor: '#000',
				shadowOpacity: 0.2,
				shadowOffset: { width: 0, height: 4 },
				shadowRadius: 4,
				maxHeight: 40
			}}
		>
			<Text>{`${label} (z:${zIndex}, e:${elevation})`}</Text>
		</View>
	);
}


// Contact Form Modal Component
function ContactFormModal({ visible, onClose, onSubmit, initialData, loading }: {
	visible: boolean;
	onClose: () => void;
	onSubmit: (data: any) => void;
	initialData?: Partial<Contact>;
	loading?: boolean;
}) {
	const triggerRef =
		React.useRef<React.ElementRef<typeof DropdownMenuTrigger>>(null);
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};


	type ContactFormType = z.infer<typeof contactSchema>;

	const defaultValues: Partial<ContactFormType> = {
		first_name: "",
		last_name: "",
		user_email: "",
		user_mobile: "",
		business: "",
		business_roles: "",
		business_address_1: "",
		business_address_2: "",
		business_country: "",
		business_state: "",
		business_city: "",
		business_postcode: "",
		profile_pic_url: "",
		status: "",
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue
	} = useForm<ContactFormType>({
		resolver: zodResolver(contactSchema),
		defaultValues: { ...defaultValues, ...initialData },
	});

	useEffect(() => {
		if (visible) {
			reset({ ...defaultValues, ...initialData });
		}
	}, [visible, initialData, reset]);

	return (
		<View>
			<Modal presentationStyle="overFullScreen" className=" z-10" style={{ zIndex: 5 }} visible={visible} animationType="slide" onRequestClose={onClose} transparent>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
					<View style={{ backgroundColor: 'white', borderRadius: 12, padding: 0, width: '92%', maxHeight: '85%' }}>
						<ScrollView
							style={{ padding: 20 }}
							contentContainerStyle={{ paddingBottom: 24 }}
							showsVerticalScrollIndicator={true}
						// keyboardDismissMode="on-drag"
						>
							<H3>{initialData?.user_catalog_id ? 'Edit Contact' : 'Add Contact'}</H3>

							{/* First Name */}
							<Controller
								control={control}
								name="first_name"
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View className="space-y-2 my-2">
										<Label>First Name</Label>
										<Input
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="First Name"
										/>
										{error && <Text className="text-red-500 text-xs">{error.message}</Text>}
									</View>
								)}
							/>
							{/* Last Name */}
							<Controller
								control={control}
								name="last_name"
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View className="space-y-2 my-2">
										<Label>Last Name</Label>
										<Input
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Last Name"
										/>
										{error && <Text className="text-red-500 text-xs">{error.message}</Text>}
									</View>
								)}
							/>

							{/* User Email */}
							<Controller
								control={control}
								name="user_email"
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View className="space-y-2 my-2">
										<Label>User Email</Label>
										<Input
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="User Email"
											autoCapitalize="none"
										/>
										{error && <Text className="text-red-500 text-xs">{error.message}</Text>}
									</View>
								)}
							/>
							{/* User Mobile */}
							<Controller
								control={control}
								name="user_mobile"
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View className="space-y-2 my-2">
										<Label>User Mobile</Label>
										<Input
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="User Mobile"
										/>
										{error && <Text className="text-red-500 text-xs">{error.message}</Text>}
									</View>
								)}
							/>
							{/* Status Dropdown */}
							<Controller
								control={control}
								name="status"
								render={({ field: { value, onChange }, fieldState: { error } }) => (
									<View className="space-y-2 my-2 z-[9999999]">
										<Label>Status</Label>
										<DropdownMenu >
											<DropdownMenuTrigger asChild>
												<Button variant="outline" className="w-full justify-between">
													<Text>{value || 'Select Status'}</Text>
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												insets={contentInsets}
												className=" min-w-40 "
												nestedContent={true}
											>
												{['Active', 'Inactive', 'Draft'].map(status => (
													<DropdownMenuItem key={status} onPress={() => onChange(status)}>
														<Text>{status}</Text>
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
										{error && <Text className="text-red-500 text-xs">{error.message}</Text>}
									</View>
								)}
							/>
							{/* Business */}
							<Controller
								control={control}
								name="business"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business"
										/>
									</View>
								)}
							/>
							{/* Business Roles */}
							<Controller
								control={control}
								name="business_roles"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business Roles</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business Roles"
										/>
									</View>
								)}
							/>
							{/* Address 1 */}
							<Controller
								control={control}
								name="business_address_1"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Address 1</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Address 1"
										/>
									</View>
								)}
							/>
							{/* Address 2 */}
							<Controller
								control={control}
								name="business_address_2"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Address 2</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Address 2"
										/>
									</View>
								)}
							/>
							{/* Business Country */}
							<Controller
								control={control}
								name="business_country"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business Country</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business Country"
										/>
									</View>
								)}
							/>
							{/* Business State */}
							<Controller
								control={control}
								name="business_state"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business State</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business State"
										/>
									</View>
								)}
							/>
							{/* Business City */}
							<Controller
								control={control}
								name="business_city"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business City</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business City"
										/>
									</View>
								)}
							/>
							{/* Business Postcode */}
							<Controller
								control={control}
								name="business_postcode"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Business Postcode</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Business Postcode"
										/>
									</View>
								)}
							/>
							{/* Profile Picture URL */}
							<Controller
								control={control}
								name="profile_pic_url"
								render={({ field: { onChange, onBlur, value } }) => (
									<View className="space-y-2 my-2">
										<Label>Profile Picture URL</Label>
										<Input
											value={value || ''}
											onChangeText={onChange}
											onBlur={onBlur}
											placeholder="Profile Picture URL"
										/>
									</View>
								)}
							/>
							<View className="flex flex-row justify-end gap-2 mt-4 mb-2">
								<Button variant="ghost" onPress={onClose} disabled={loading}><Text>Cancel</Text></Button>
								<Button onPress={handleSubmit(onSubmit)} disabled={loading}>
									<Text>{initialData?.user_catalog_id ? 'Update' : 'Create'}</Text>
								</Button>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export default function ContactsPage() {
	const { userCatalog, session } = useAuth();
	const { setTitle, setShowBack } = useHeader();

	const PAGE_SIZE = 10;
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const offsetRef = useRef(0);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
	// Add or Update Contact
	const handleAddContact = () => {
		setEditingContact(null);
		setModalVisible(true);
	};

	const handleEditContact = (contact: Contact) => {
		setEditingContact(contact);
		setModalVisible(true);
	};

	const handleSubmitContact = async (form: any) => {
		setModalLoading(true);
		try {
			let result;
			if (editingContact && editingContact.user_catalog_id) {
				// Update
				result = await supabase
					.from('user_catalog')
					.update({
						first_name: form.first_name,
						last_name: form.last_name,
						user_email: form.user_email,
						user_mobile: form.user_mobile,
						business: form.business,
						business_roles: form.business_roles,
						business_address_1: form.business_address_1,
						business_address_2: form.business_address_2,
						business_country: form.business_country,
						business_state: form.business_state,
						business_city: form.business_city,
						business_postcode: form.business_postcode,
						profile_pic_url: form.profile_pic_url,
						status: form.status,
						// for_business_name: form.for_business_name,
						// for_business_number: form.for_business_number,
						business_name: form.business_name,
					})
					.eq('user_catalog_id', editingContact.user_catalog_id)
					.select()
					.single();
				if (!result.error && result.data) {
					setContacts(prev => prev.map(c => c.user_catalog_id === result.data.user_catalog_id ? { ...c, ...result.data } : c));
				}
			} else {
				// Create
				result = await supabase
					.from('user_catalog')
					.insert({
						first_name: form.first_name,
						last_name: form.last_name,
						user_email: form.user_email,
						user_mobile: form.user_mobile,
						business: form.business,
						business_roles: form.business_roles,
						business_address_1: form.business_address_1,
						business_address_2: form.business_address_2,
						business_country: form.business_country,
						business_state: form.business_state,
						business_city: form.business_city,
						business_postcode: form.business_postcode,
						profile_pic_url: form.profile_pic_url,
						status: form.status,
						for_business_name: userCatalog.business_name,
						for_business_number: userCatalog.business_number,
						business_name: form.business_name,
					})
					.select()
					.single();
				if (!result.error && result.data) {
					setContacts(prev => [result.data, ...prev]);
				}
			}
			setModalVisible(false);
			setEditingContact(null);
		} finally {
			setModalLoading(false);
		}
	};

	const fetchContacts = useCallback(async (opts?: { reset?: boolean, search?: string }) => {
		if (loading) return;
		setLoading(true);
		if (opts?.reset) setContacts([]);

		const search = opts?.search ?? searchQuery;
		const reset = opts?.reset ?? false;
		const from = reset ? 0 : offsetRef.current;
		const to = from + PAGE_SIZE - 1;

		let query = supabase
			.from("user_catalog")
			.select("user_catalog_id, user_id, status, first_name, last_name, user_email, user_mobile, user_name, profile_pic_url, business_name, business_number, business_city, for_business_name, for_business_number").order("created_at")
			.neq("user_catalog_id", userCatalog?.user_catalog_id)

		if (search && search.trim().length > 0) {
			query = query.or([
				`first_name.ilike.%${search}%`,
				`last_name.ilike.%${search}%`,
				`user_email.ilike.%${search}%`,
				`user_mobile.ilike.%${search}%`,
				`business_name.ilike.%${search}%`
			].join(","));
		}

		query = query.order("first_name", { ascending: true }).range(from, to);

		const { data, error } = await query;
		if (error) {
			setLoading(false);
			return;
		}

		if (reset) {
			setContacts((data || []) as any);
			offsetRef.current = (data || []).length;
		} else {
			setContacts(prev => [...prev, ...(data || [])] as any);
			offsetRef.current += (data || []).length;
		}
		setHasMore((data || []).length === PAGE_SIZE);
		setLoading(false);
	}, [ searchQuery, loading]);

	useEffect(() => {
		setTitle("Contacts");
		setShowBack(false);
		fetchContacts({ reset: true });
		return () => {
			setTitle("");
			setShowBack(false);
		};
		// eslint-disable-next-line
	}, [setTitle, setShowBack]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		offsetRef.current = 0;
		fetchContacts({ reset: true }).then(() => setRefreshing(false));
	}, [fetchContacts]);

	const onEndReached = useCallback(() => {
		if (!loading && hasMore) {
			fetchContacts();
		}
	}, [loading, hasMore, fetchContacts]);

	// Prevent multiple triggers during momentum scroll
	const isFetchingMore = useRef(false);

	const handleScroll = ({ nativeEvent }: any) => {
		const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
		// Increase threshold for better triggering
		if (
			layoutMeasurement.height + contentOffset.y >= contentSize.height - 200 &&
			!loading &&
			hasMore &&
			!isFetchingMore.current
		) {
			isFetchingMore.current = true;
			fetchContacts().finally(() => {
				isFetchingMore.current = false;
			});
		}
	};

	const handleSearch = (v: string) => {
		setSearchQuery(v);
		offsetRef.current = 0;
		fetchContacts({ reset: true, search: v });
	};

	return (
		<>
			<ContactFormModal
				visible={modalVisible}
				onClose={() => { setModalVisible(false); setEditingContact(null); }}
				onSubmit={handleSubmitContact}
				initialData={editingContact || undefined}
				loading={modalLoading}
			/>
			<ScrollView
				className="bg-background"
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				onScroll={handleScroll}
				scrollEventThrottle={32}
			>
				<View className="flex flex-1 size-full justify-center bg-background p-4">
					<View className="flex flex-1 flex-col h-full">
						<View className="flex flex-col h-full">
							<View className="flex-1">
								{/* Search Bar and Add Button */}
								<View className="p-4 pb-3 flex flex-row items-center gap-2">
									<View className="flex-1 relative">
										<Input
											placeholder="Search contacts..."
											value={searchQuery}
											onChangeText={handleSearch}
											className={`pl-8 pr-8 h-12 text-base `}
										/>
										<View className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8">
											<Text>
												<LucideIcon name="Search" size={22} />
											</Text>
										</View>
									</View>
									<Button variant="default" onPress={handleAddContact} className="size-12 m-auto" size="icon">
										<LucideIcon name="Plus" size={16} className="flex text-primary-foreground" />
									</Button>
								</View>
								<View className="px-2">
									{loading && contacts.length === 0
										? Array.from({ length: 4 }).map((_, i) => (
											<Skeleton key={i} className="px-2 rounded-xl h-32 mb-2" />
										))
										: null}
								</View>
								{/* Contacts List */}
								<View className="px-2 h-full">
									{contacts.length === 0 && !loading ? (
										<View className="items-center py-8 h-full">
											<LucideIcon name="Users" size={32} className="mb-2 opacity-50" />
											<Text className="text-sm text-muted-foreground">
												{searchQuery
													? "No contacts found"
													: "No contacts"}
											</Text>
										</View>
									) : (
										contacts.map((contact) => (
											<PressableCard
												key={String(contact.user_catalog_id)}
												className="relative rounded-md p-4 hover:bg-background/60 cursor-pointer transition-colors mb-2"
											>
												<CardContent className="p-0">
													{/* Avatar - Top Right */}
													<View className="absolute top-0 right-0">
														<View className="relative">
															<Avatar className="h-14 w-14" alt={contact.first_name + " " + contact.last_name}>
																<AvatarImage src={contact.profile_pic_url || ""} />
																<AvatarFallback className="text-sm font-medium">
																	<Text>
																		{(contact.first_name?.[0] || "") + (contact.last_name?.[0] || "")}
																	</Text>
																</AvatarFallback>
															</Avatar>
															<View
																className={cn(
																	"absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
																	contact.status === "active" ? "bg-green-500" : "bg-gray-300"
																)}
															/>
														</View>
													</View>
													{/* Content - Left Aligned */}
													<View className="pr-16 pb-8">
														<View className="flex items-start gap-2 mb-2">
															<H3 className="font-medium text-base">
																{contact.first_name} {contact.last_name}
															</H3>
														</View>
														<P className="text-sm text-primary/85 mb-1 flex items-center gap-1">
															<LucideIcon className="w-6 text-primary" name="Building" size={12} />
															{contact.business_name || "-"}
														</P>
														<P className="text-sm text-primary/85 mb-1 flex items-center gap-1">
															<LucideIcon className="w-6 text-primary" name="Phone" size={12} />
															{contact.user_mobile || contact.business_number || "-"}
														</P>
														<P className="text-sm text-primary/85 mb-1 flex items-center gap-1">
															<LucideIcon className="w-6 text-primary" name="Mail" size={12} />
															{contact.user_email || "-"}
														</P>
														<P className="text-sm text-primary/85 mb-1 flex items-center gap-1">
															<LucideIcon className="w-6 text-primary" name="MapPin" size={12} />
															{contact.business_city || "-"}
														</P>
													</View>
													{/* 3 Dots - Bottom Right */}
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button size="icon" variant="ghost" className="absolute bottom-0 right-0 h-8 w-8 hover:bg-gray-100">
																<LucideIcon name="EllipsisVertical" className=" text-primary" size={16} />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent className="w-64 native:w-72">
															<DropdownMenuItem onPress={() => handleEditContact(contact)}>
																<Text>Edit</Text>
															</DropdownMenuItem>
															{/* ...existing code... */}
														</DropdownMenuContent>
													</DropdownMenu>
												</CardContent>
											</PressableCard>
										))
									)}
									{loading && contacts.length > 0 && (
										<Skeleton className="px-2 rounded-xl h-24 mb-2" />
									)}
								</View>
								{/* Bottom Spacing */}
								<View className="h-6"></View>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</>
	);
}
