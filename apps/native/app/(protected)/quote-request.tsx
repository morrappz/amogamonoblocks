import React, { useState, useEffect, useCallback, useMemo, use } from 'react';
import {
	View,
	FlatList,
	Image,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
	SafeAreaView,
	Alert,
	BackHandler,
} from 'react-native';
import { Search, Plus, Minus, Trash2 } from 'lucide-react-native';
import { wooApiFetch } from '@/lib/woocommerce';
import { Input } from '@/components/elements/Input';
import { useFocusEffect } from 'expo-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/elements/Tabs';
import { Card, CardContent } from '@/components/elements/Card';
import { Button } from '@/components/elements/Button';
import { Text } from '@/components/elements/Text';
import LucideIcon from '@/components/LucideIcon';
import { useAuth } from '@/context/supabase-provider';
import { toast } from 'sonner-native';
import { useHeader } from '@/context/header-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/elements/DropdownMenu';
import { Select } from '@/components/elements/Select';
import { P } from '@/components/elements/Typography';
import RenderHTML from 'react-native-render-html';

// --- TYPES (Mostly the same, Order is now a Quote) ---
type Product = { id: number; name: string; price: string; on_sale: boolean; stock_status: 'instock' | 'outofstock'; images: { src: string }[]; short_description?: string; sku?: string };
type QuoteItem = { product_id: number; quantity: number; product_image?: string; product_name?: string; };
type Customer = { id: number; first_name: string; last_name: string; email: string; user_mobile?: string };
type Quote = { quote_id: number; created_at: string; line_items: { product_name: string; quantity: number; product_id: number; product_image: string }[]; quote_status: string; supplier_name?: string; };
type StatusHistoryItem = {
	note: string;
	created_at: string;
	quote_status: string;
	changed_by_name: string;
};

const PER_PAGE = 20;

const RequestTab = ({ products, onAddItem, loadMore, isLoading, onFilterChange, onSearch }: {
	products: Product[];
	onAddItem: any;
	loadMore: any;
	isLoading: any;
	onFilterChange: any;
	onSearch: any
}) => {
	// This component is essentially the same as OrderingTab, just renamed props for clarity
	const [searchQueryRaw, setSearchQueryRaw] = useState("");
	useEffect(() => {
		const delay = setTimeout(() => onSearch(searchQueryRaw.trim()), 500);
		return () => clearTimeout(delay);
	}, [searchQueryRaw]);

	return (
		<View className="flex-1">
			<View className="p-4 border-b border-primary/15">
				<View className="relative">
					<Input placeholder="Search products..." value={searchQueryRaw} onChangeText={setSearchQueryRaw} className={`pl-8 pr-8 h-12 text-base`} />
					<View className="absolute right-2 top-1/2 transform -translate-y-1/2"><Search size={16} color="#6b7280" /></View>
				</View>
			</View>
			<FlatList
				data={products}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => (
					<Card className='rounded-lg m-4 mt-0 overflow-hidden'>
						<CardContent className='p-0'>
							<Image source={{ uri: item.images[0]?.src }} className="w-full h-48" />
							<View className="p-4 flex-row justify-between items-center">
								<View className="flex-1 mr-4">
									<Text className="text-lg font-bold" numberOfLines={1}>{item.name}</Text>
									{item.short_description && <P>
										<RenderHTML
											source={{ html: item.short_description || "" }}
											tagsStyles={htmlTagsStyles}
										/>
									</P>}
									{item.sku && <P>Units : {item.sku}</P>}

									{/* Price is removed from main view for a "quote" context, but can be kept if needed */}
								</View>
								<TouchableOpacity className="bg-gray-800 rounded-full p-3" onPress={() => onAddItem(item)}>
									<Plus size={16} color="#fff" />
								</TouchableOpacity>
							</View>
						</CardContent>
					</Card>
				)}
				onEndReached={loadMore}
				onEndReachedThreshold={0.7}
				ListFooterComponent={isLoading ? <ActivityIndicator size="large" className="my-8" /> : null}
				ListEmptyComponent={() => !isLoading && <Text className="text-center text-gray-500 mt-20">No products found.</Text>}
			/>
		</View>
	);
};

const ItemsTab = ({ quoteItems, products, updateQuantity, removeItem, onRequestQuote, onCancel, isLoading, storeSettings }:
	{
		quoteItems: any;
		products: any;
		updateQuantity: any;
		removeItem: any;
		onRequestQuote: any;
		onCancel: any;
		isLoading: any;
		storeSettings: any
	}
) => {
	const [customerSearchQuery, setCustomerSearchQuery] = useState('');
	const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [customerError, setCustomerError] = useState(false);

	const [isSearching, setIsSearching] = useState(false);

	const itemDetails = useMemo(() => quoteItems.map((item: any) => ({ ...item, product: products.find((p: Product) => p.id === item.product_id) })).filter((item: any) => item.product), [quoteItems, products]);

	useEffect(() => {
		if (customerSearchQuery.length < 2) {
			setFoundCustomers([]);
			return;
		}

		const handler = setTimeout(async () => {
			setIsSearching(true);
			try {
				const results = await wooApiFetch('users', { params: { search: customerSearchQuery, role: "customer" } }, "/ffintegration/v1", storeSettings?.woocommerce);
				setFoundCustomers(results || []);
			} catch (error) {
				console.error("Failed to search customers:", error);
				setFoundCustomers([]);
			} finally {
				setIsSearching(false);
			}
		}, 500); // 500ms delay

		return () => {
			clearTimeout(handler);
		};
	}, [customerSearchQuery]);

	const selectCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setCustomerSearchQuery(`${customer.first_name} ${customer.last_name}`);
		setFoundCustomers([]);
	};

	const handleRequestQuoteClick = () => {
		// Reset error state on each click attempt
		setCustomerError(false);

		if (!selectedCustomer) {
			toast.error("Please select a supplier.");
			setCustomerError(true); // Set error state to true
			return; // Stop execution
		}

		if (itemDetails.length === 0) {
			toast.error("Please add items to the quote request.");
			return; // Stop execution
		}

		onRequestQuote(selectedCustomer);
	};

	return (
		<ScrollView className="p-4">
			<Text className="text-3xl font-extrabold mb-6">Quote Items</Text>
			<View className="mb-6">
				<Text className="text-sm font-medium mb-2">Supplier *</Text>
				<View className="relative">
					<TextInput
						placeholder="Search for a supplier..."
						value={customerSearchQuery}
						onChangeText={(text) => {
							setCustomerSearchQuery(text);
							setSelectedCustomer(null);
							setCustomerError(false);
						}}
						className={`border rounded-lg p-3 text-base pr-10 ${customerError ? 'border-destructive' : 'border-gray-300'}`}
					/>
					{isSearching && (
						<View className="absolute right-3 top-1/2 -translate-y-1/2">
							<ActivityIndicator size="small" />
						</View>
					)}
				</View>
				{foundCustomers.length > 0 && (
					<View className="border border-gray-200 rounded-lg mt-1">
						{foundCustomers.map(cust => (
							<TouchableOpacity key={cust.id} className="p-3 border-b border-gray-100" onPress={() => selectCustomer(cust)}>
								<Text className="font-semibold">{cust.first_name} {cust.last_name}</Text>
								<Text className="text-sm">{cust.email}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>

			<View>
				{itemDetails.length > 0 ? (
					itemDetails.map((item: any) => (
						<Card key={item.product_id} className='mt-2'>
							<CardContent className='p-3 flex-row items-center justify-between'>
								<Image source={{ uri: item.product.images[0]?.src }} className="w-16 h-16 rounded-md" />
								<View className="flex-1 mx-3">
									<Text className="text-base font-bold">{item.product.name}</Text>
									{/* Price removed, only quantity shown */}
									<Text className="text-sm mt-1">Quantity: {item.quantity}</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<Button size="icon" variant="ghost" onPress={() => updateQuantity(item.product_id, -1)}><LucideIcon name='Minus' size={16} className='text-primary/40' /></Button>
									<Text className="text-lg font-bold w-8 text-center">{item.quantity}</Text>
									<Button size="icon" variant="ghost" onPress={() => updateQuantity(item.product_id, 1)}><LucideIcon name='Plus' size={16} className='text-primary/40' /></Button>
								</View>
								<Button size="icon" variant="ghost" onPress={() => removeItem(item.product_id)}><LucideIcon name="Trash2" size={16} className="text-destructive" /></Button>
							</CardContent>
						</Card>
					))
				) : (
					<View className="flex mt-6 mb-4 justify-center items-center">
						<Button variant="ghost" className="border-primary/40 border h-24 w-36" onPress={onCancel} > <LucideIcon name="PackagePlus" size={48} className="flex" /> Add Items</Button>
						<Text className="text-center text-gray-500 mt-1">No items added to the quote request.</Text>
					</View>
				)}
			</View>

			<View className="flex-row gap-3 mt-8 mb-8">
				<Button variant="secondary" onPress={onCancel} className="flex-1 py-3.5"><Text className="text-base font-bold">Cancel</Text></Button>
				<Button onPress={handleRequestQuoteClick} className="flex-1 py-3.5 flex-row">
					<Text className="text-base font-bold flex">Send</Text>
				</Button>
			</View>
		</ScrollView>
	);
};

const QuoteConfirmationScreen = ({ quote, onNewRequest, supplier, track }:
	{
		quote: Quote;
		onNewRequest: any;
		supplier: Customer | null;
		track: any
	}
) => {
	return (
		<ScrollView className="flex-1 bg-background p-6">
			<View>
				<Text className="text-4xl font-extrabold">Thanks for your Quote Request!</Text>
				<Text className="text-lg mt-2">Quote sent to supplier and you can view this on track tab.</Text>
				<View className="p-5 rounded-xl mt-8 border border-gray-200">
					<Text className="text-2xl font-bold mb-4">Request Summary</Text>
					<View className="space-y-2">
						<View className="flex-row justify-between"><Text className="text-base">Date</Text><Text className="font-semibold text-base">{new Date(quote.created_at).toDateString()}</Text></View>
						<View className="flex-row justify-between"><Text className="text-base">Quote Number</Text><Text className="font-semibold text-base">#{quote.quote_id}</Text></View>
						<View className="flex-row justify-between"><Text className="text-base">Status</Text><Text className="font-semibold text-base capitalize">{quote.quote_status.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())}</Text></View>
						<View className="flex-row justify-between"><Text className="text-base">Supplier Name</Text><Text className="font-semibold text-base capitalize">{supplier?.first_name} {supplier?.last_name}</Text></View>
					</View>
					<View className="border-t border-gray-200 my-4" />
					<Text className="text-lg font-bold mb-2">Requested Items</Text>
					<View className="space-y-3">
						{quote.line_items.map(item => (
							<View key={item.product_id} className="flex-row items-center">
								<Image source={{ uri: item.product_image }} className="w-16 h-16 rounded-md mr-2" />
								<View className="flex-1">
									<Text className="font-bold text-base">{item.product_name}</Text>
								</View>
								<Text className="text-base">{item.quantity} Nos</Text>
							</View>
						))}
					</View>
				</View>
			</View>
			<Button variant="default" onPress={() => track(quote)} className="mt-8 py-4"><Text className="text-lg font-bold">Track Button</Text></Button>
			<Button variant="secondary" onPress={onNewRequest} className="mt-2 py-4"><Text className="text-lg font-bold">New Quote Request</Text></Button>
		</ScrollView>
	)
};

const TrackTab = ({ onQuoteSelect, storeSettings }: { onQuoteSelect: any; storeSettings: any }) => {
	const { userCatalog: userSession } = useAuth();
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	const fetchQuotes = useCallback(async () => {
		if (isLoading || !hasMore) return;
		if (!userSession?.user_catalog_id) return;

		setIsLoading(true);

		try {
			const userQuotes = await wooApiFetch('quotes', {
				params: {
					created_by: userSession.user_catalog_id,
					page: page,
					per_page: PER_PAGE
				}
			},
				"/woomorrintegration/v1",
				storeSettings?.woocommerce
			);

			if (userQuotes && userQuotes.length > 0) {
				setQuotes(prev => [...prev, ...userQuotes]);
				setPage(prev => prev + 1);
			} else {
				setHasMore(false);
			}

			if (userQuotes.length < PER_PAGE) {
				setHasMore(false);
			}

		} catch (error) {
			toast.error("Failed to fetch quote history.");
		} finally {
			setIsLoading(false);
		}
	}, [isLoading, hasMore, page, userSession]);

	useEffect(() => {
		setQuotes([]);
		setPage(1);
		setHasMore(true);
		fetchQuotes();
	}, [userSession]);

	if (isLoading && quotes.length === 0) {
		return <ActivityIndicator size="large" className="mt-20" />;
	}

	return (
		<FlatList
			data={quotes}
			keyExtractor={item => item.quote_id.toString()}
			className="p-4"
			renderItem={({ item }) => (
				<TouchableOpacity onPress={() => onQuoteSelect(item)}>
					<Card className="mb-4 relative">
						<CardContent className="p-4">
							<View className="flex-row justify-between items-start mb-3">
								<View>
									<Text className="text-lg font-bold">Quote #{item.quote_id}</Text>
									<Text className="text-sm text-gray-500">Supplier: {item.supplier_name || 'N/A'}</Text>
								</View>
								<View className={`px-2 py-1 rounded-full ${item.quote_status === 'waiting-for-approval' ? 'bg-yellow-100' : 'bg-green-100'}`}>
									<Text className={`text-xs font-bold ${item.quote_status === 'waiting-for-approval' ? 'text-yellow-800' : 'text-green-800'}`}>{item.quote_status.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())}</Text>
								</View>
							</View>
							<View className="border-t border-gray-100 pt-3 space-y-2">
								<View className="flex-row items-center">
									<LucideIcon name="Calendar" size={16} className="text-gray-500 mr-2" />
									<Text className="text-gray-600">Date: {new Date(item.created_at).toLocaleDateString()}</Text>
								</View>
								<View className="flex-row items-center">
									<LucideIcon name="Package" size={16} className="text-gray-500 mr-2" />
									<Text className="text-gray-600">No. of Items: {item?.line_items?.length || 0}</Text>
								</View>
							</View>
							<Button onPress={() => onQuoteSelect(item)} variant="ghost" size="icon" className="absolute right-1 bottom-1">
								<LucideIcon className="size-5 " name="Pencil" />
							</Button>
						</CardContent>
					</Card>
				</TouchableOpacity>
			)}
			ListEmptyComponent={!isLoading ? <Text className="text-center text-gray-500 mt-20">No quote requests found.</Text> : null}
			onEndReached={fetchQuotes}
			onEndReachedThreshold={0.7}
			ListFooterComponent={isLoading && quotes.length > 0 ? <ActivityIndicator size="large" className="my-8" /> : null}
		/>
	);
};

const QuoteDetailScreen = ({ quote, onBack, onStatusUpdate }: { quote: any; onBack: any; onStatusUpdate: any; }) => {
	const [newStatus, setNewStatus] = useState(quote.quote_status);
	const [isUpdating, setIsUpdating] = useState(false);
	const { setShow } = useHeader()

	useEffect(() => {
		setShow(false);
		return () => setShow(true);
	}, [setShow]);

	const handleUpdate = async () => {
		setIsUpdating(true);
		try {
			await onStatusUpdate(quote.quote_id, newStatus);
			toast.success("Status updated successfully!");
		} catch (error) {
			toast.error("Failed to update status.");
		} finally {
			setIsUpdating(false);
		}
	};

	const TimelineItem = ({ item, isFirst, isLast }: { item: StatusHistoryItem, isFirst: boolean, isLast: boolean }) => {

		// Helper to format the date string
		const formattedDate = new Date(item.created_at).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});

		const statusText = item.quote_status.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase());

		return (
			<View className="flex-row">
				{/* Left side: The vertical track and circle icon */}
				<View className="items-center w-10">
					{/* Top part of the line (hidden for the first item) */}
					<View className={`flex-1 w-px ${isFirst ? 'bg-transparent' : 'bg-gray-300'}`} />

					{/* The circle icon */}
					<View className={`w-5 h-5 rounded-full justify-center items-center ${isFirst ? 'bg-blue-500' : 'bg-gray-300'}`}>
						{isFirst && <View className="w-2 h-2 bg-white rounded-full" />}
					</View>

					{/* Bottom part of the line (hidden for the last item) */}
					<View className={`flex-1 w-px ${isLast ? 'bg-transparent' : 'bg-gray-300'}`} />
				</View>

				{/* Right side: The content */}
				<View className="flex-1 pb-4 pt-1">
					<Text className="text-base font-bold text-gray-800">{statusText} - {formattedDate}</Text>
					<Text className="text-sm text-gray-500 mt-1">{item.note} (by {item.changed_by_name})</Text>
				</View>
			</View>
		);
	};

	const StatusTimeline = ({ history }: { history: StatusHistoryItem[] }) => {
		if (!history || history.length === 0) {
			return <Text className="text-center text-gray-500 my-4">No status history available.</Text>;
		}

		// Ensure the latest status is at the top
		const sortedHistory = [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

		return (
			<Card className="mt-6">
				<CardContent className="p-4">
					<Text className="text-2xl font-bold mb-4">Status History</Text>
					{sortedHistory.map((item, index) => (
						<TimelineItem
							key={index}
							item={item}
							isFirst={index === 0}
							isLast={index === sortedHistory.length - 1}
						/>
					))}
				</CardContent>
			</Card>
		);
	};

	return (
		<ScrollView className="flex-1 bg-background p-6 h-screen">
			<TouchableOpacity onPress={onBack} className="mb-4">
				<LucideIcon name="ArrowLeft" size={16} />
			</TouchableOpacity>
			<View>
				<Text className="text-4xl font-extrabold">Quote #{quote.quote_id}</Text>
				<View className="p-5 rounded-xl mt-6 border border-gray-200">
					<Text className="text-2xl font-bold mb-4">Request Details</Text>

					<View className="space-y-2">
						<View className="flex-row justify-between"><Text>Date</Text><Text className="font-semibold">{new Date(quote.created_at).toDateString()} at {new Date(quote.created_at).toTimeString().split(" ")[0]}</Text></View>
						<View className="flex-row justify-between"><Text>Current Status</Text><Text className="font-semibold capitalize">{quote.quote_status.replaceAll('-', ' ').replaceAll(/\b\w/g, (l: string) => l.toUpperCase())}</Text></View>
					</View>
					<View className="border-t border-gray-200 my-4" />
					<Text className="text-lg font-bold mb-2">Requested Items</Text>
					<View className="space-y-3">
						{(quote.line_items || []).map((item: QuoteItem, index: number) => (
							<View key={index} className="flex-row items-center">
								<Image source={{ uri: item.product_image }} className="w-16 h-16 rounded-md mr-2" />
								<View className="flex-1"><Text className="font-bold">{item.product_name}</Text></View>
								<Text>{item.quantity} Nos</Text>
							</View>
						))}
					</View>
				</View>
			</View>
			<View className="mt-4" />
			<Select
				label="Choose a status"
				options={[
					{ id: "waiting-for-approval", name: 'Waiting for approval' },
					{ id: "accepted", name: 'Accepted' },
					{ id: "denied", name: 'Denied' },
					{ id: "cancel", name: 'Cancel' },
				]}
				labelKey="name"
				valueKey="id"
				selectedValue={newStatus}
				onSelect={value => setNewStatus(value)}
			/>
			<Button variant="default" onPress={handleUpdate} className="mt-8 py-4 flex-row">{isUpdating && <ActivityIndicator color="#fff" className="mr-1" />}<Text className="text-lg font-bold">Update Quote Request</Text></Button>

			<StatusTimeline history={quote.status_history} />
		</ScrollView>
	);
};

export default function RequestQuotePage() {
	const { session, userCatalog: userSession, storeSettings } = useAuth();
	const [activeScreen, setActiveScreen] = useState<'requesting' | 'submitted' | 'detail'>('requesting');
	const [activeTab, setActiveTab] = useState<'request' | 'items' | 'track'>('request');

	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const [filters, setFilters] = useState<Record<string, any>>({});
	const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
	const [sendedCustomer, setSendedCustomer] = useState<Customer | null>(null)
	const [lastQuote, setLastQuote] = useState<Quote | null>(null);
	const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
	const { setTitle, setShowBack } = useHeader()
	useEffect(() => {
		setTitle("Quote Request");
		setShowBack(false);
		return () => {
			setTitle("");
			setShowBack(false);
		};
	}, [setTitle, setShowBack]);

	// The BackHandler logic from your code
	useFocusEffect(
		React.useCallback(() => {
			const onBackPress = () => {
				if (activeTab === 'items' || activeTab === 'track') {
					setActiveTab('request');
					return true;
				}
				if (activeScreen === 'submitted') {
					setActiveScreen('requesting');
					setActiveTab('request');
					return true;
				}
				return false;
			};
			const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
			return () => subscription.remove();
		}, [activeTab, activeScreen])
	);

	const loadProducts = useCallback(async (isNewFilter = false) => {
		if (isLoading || isRefreshing) return;
		if (!isNewFilter && !hasMore) return;

		isNewFilter ? setIsRefreshing(true) : setIsLoading(true);
		const currentPage = isNewFilter ? 1 : page;

		try {
			const params = { ...filters, page: currentPage, per_page: PER_PAGE };
			const newProducts = await wooApiFetch('products', { params }, undefined, storeSettings?.woocommerce);
			setProducts(prev => isNewFilter ? newProducts : [...prev, ...newProducts]);
			setPage(currentPage + 1);
			setHasMore(newProducts && newProducts.length === PER_PAGE);
		} catch (error) {
			Alert.alert("Error", "Could not fetch products.");
		} finally {
			isNewFilter ? setIsRefreshing(false) : setIsLoading(false);
		}
	}, [isLoading, isRefreshing, page, hasMore, filters]);

	useEffect(() => {
		loadProducts(true);
	}, [filters]);


	const handleFilterChange = (key: string, value?: any) => {
		setFilters(prev => {
			const newFilters = { ...prev };
			if (key === 'clear') return {};
			if (key === 'search') {
				if (value) newFilters.search = value; else delete newFilters.search;
			} else {
				if (newFilters[key] === value) delete newFilters[key]; else newFilters[key] = value;
			}
			return newFilters;
		});
	};

	const handleAddItem = (product: any) => {
		const productId = typeof product === 'object' ? product.id : product;
		setQuoteItems(prev => {
			const existing = prev.find(item => item.product_id === productId);
			if (existing) {
				return prev.map(item => item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item);
			}
			return [...prev, { ...product, product_id: productId, quantity: 1 }];
		});
	};

	const handleUpdateQuantity = (productId: number, amount: number) => {
		setQuoteItems(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item).filter(item => item.quantity > 0));
	};

	const handleRemoveItem = (productId: number) => setQuoteItems(prev => prev.filter(item => item.product_id !== productId));

	const handleRequestQuote = async (customer: Customer) => {
		const customerId = typeof customer === 'object' ? customer.id : customer;
		if (quoteItems.length === 0) return Alert.alert("No Items", "Please add items to your request.");
		if (!customerId) return Alert.alert("No Customer", "Please select a customer.");

		setSendedCustomer(customer)
		setIsLoading(true);
		try {
			const quoteData = {
				quote_status: "waiting-for-approval",
				supplier_id: customerId,
				supplier_key: customer?.user_mobile,
				customer_id: userSession?.user_catalog_id,
				customer_key: userSession?.user_mobile,
				line_items: quoteItems.map(item => ({ product_id: item.product_id, quantity: item.quantity, product_name: (item as any).name, product_image: (item as any)?.images?.[0]?.src || null })),
				for_business_number: userSession?.for_business_number || userSession?.business_number || "",
				for_business_name: userSession?.for_business_name || userSession?.business_name || "",
				created_by: userSession?.user_catalog_id || "",
				from_user_id: userSession?.user_catalog_id || "",
				from_user_mobile: userSession?.user_mobile || "",
				to_user_id: customerId,
				to_user_mobile: customer?.user_mobile,
			};
			const newQuote: Quote = await wooApiFetch('quotes', { method: 'POST', body: quoteData }, "/woomorrintegration/v1", storeSettings?.woocommerce);
			setLastQuote(newQuote);
			setQuoteItems([]);
			setActiveScreen('submitted');
			await fetch("/api/quote-notify", {
				method: "POST",
				body: JSON.stringify({ quote_id: newQuote.quote_id, quote: newQuote })
			})
		} catch (error) {
			toast.error("Failed to request quote. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectQuote = (quote: Quote) => {
		setSelectedQuote(quote);
		setActiveScreen('detail');
	};

	const handleUpdateQuoteStatus = async (quoteId: number, newStatus: string) => {
		// This makes an API call to update the order/quote status
		await wooApiFetch(`quotes/${quoteId}`, {
			method: 'PUT',
			body: { quote_status: newStatus }
		},
			"/woomorrintegration/v1",
			storeSettings?.woocommerce
		);

		// Refresh the selected quote to show the updated status
		const updatedQuote = await wooApiFetch(`quotes/${quoteId}`, {}, "/woomorrintegration/v1", storeSettings?.woocommerce);
		setSelectedQuote(updatedQuote);
	};


	if (activeScreen === 'submitted' && lastQuote) {
		return <QuoteConfirmationScreen quote={lastQuote} onNewRequest={() => { setActiveScreen('requesting'); setActiveTab('request'); }} supplier={sendedCustomer} track={handleSelectQuote} />;
	}

	if (activeScreen === 'detail' && selectedQuote) {
		return <QuoteDetailScreen
			quote={selectedQuote}
			onBack={() => {
				setActiveScreen('requesting');
				setActiveTab('track');
				setSelectedQuote(null);
			}}
			onStatusUpdate={handleUpdateQuoteStatus}
		/>;
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Tabs value={activeTab} onValueChange={setActiveTab as any} className='w-full max-w-[400px] mx-auto flex-col gap-1.5'>
				<TabsList className='flex-row'>
					<TabsTrigger value='request' className='flex-1'><Text>Request</Text></TabsTrigger>
					<TabsTrigger value='items' className='flex-1'><Text>Items <Text className="font-extrabold">({quoteItems.reduce((sum, item) => sum + item.quantity, 0)})</Text></Text></TabsTrigger>
					<TabsTrigger value='track' className='flex-1'><Text>Track</Text></TabsTrigger>
				</TabsList>
			</Tabs>

			{activeTab === 'request' && (
				<RequestTab
					products={products} onAddItem={handleAddItem} loadMore={() => loadProducts(false)}
					isLoading={isLoading || isRefreshing}
					onSearch={(query: string) => handleFilterChange('search', query)}
					onFilterChange={handleFilterChange}
				/>
			)}
			{activeTab === 'items' && (
				<ItemsTab
					quoteItems={quoteItems} products={products} updateQuantity={handleUpdateQuantity}
					isLoading={isLoading || isRefreshing}
					removeItem={handleRemoveItem} onRequestQuote={handleRequestQuote}
					onCancel={() => setActiveTab('request')}
					storeSettings={storeSettings}
				/>
			)}

			{activeTab === 'track' && (
				<TrackTab onQuoteSelect={handleSelectQuote} storeSettings={storeSettings} />
			)}

		</SafeAreaView>
	);
}

const htmlTagsStyles = {
	p: {
		marginTop: 0,
		marginBottom: 0,
	},
	div: {
		marginTop: 0,
		marginBottom: 0,
	},
	body: {
		margin: 0,
		padding: 0,
	},
};