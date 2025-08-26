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
import { Search, Plus, Minus, Trash2, Check, ChevronsUpDown } from 'lucide-react-native';
import { wooApiFetch } from '@/lib/woocommerce';
import { Input } from '@/components/elements/Input';
import { useFocusEffect } from 'expo-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/elements/Tabs';
import { Card, CardContent } from '@/components/elements/Card';
import { Button } from '@/components/elements/Button';
import { Text } from '@/components/elements/Text';
import LucideIcon from '@/components/LucideIcon';
import { useAuth } from '@/context/supabase-provider';
// --- TYPES ---

type Product = {
	id: number;
	name: string;
	price: string;
	on_sale: boolean;
	stock_status: 'instock' | 'outofstock';
	images: { src: string }[];
};

type CartItem = {
	product_id: number;
	quantity: number;
};

type Customer = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
};

type Order = {
	id: number;
	total: string;
	date_created: string;
	line_items: { name: string; quantity: number, price: string, product_id: number }[];
	payment_method_title: string;
};

const PER_PAGE = 20;

const OrderingTab = ({ products, onAddToCart, loadMore, isLoading, onFilterChange, onSearch, filters }: {
	products: Product[];
	onAddToCart: (productId: number) => void;
	loadMore: () => void;
	isLoading: boolean;
	onFilterChange: (key: string, value?: any) => void;
	onSearch: (query: string) => void;
	filters: Record<string, any>;
}) => {
	const [searchQueryRaw, setSearchQueryRaw] = useState("");
	const [searchQuery, setSearchQuery] = useState("")

	useEffect(() => {
		const delay = setTimeout(() => {
			setSearchQuery(searchQueryRaw.trim());
			onSearch(searchQueryRaw.trim());
		}, 500); // adjust this delay as needed
		return () => clearTimeout(delay);
	}, [searchQueryRaw]);

	return (
		<View className="flex-1">
			<View className="p-4 border-b border-primary/15">
				<View className="relative">
					<Input
						placeholder="Search notifications..."
						value={searchQueryRaw}
						onChangeText={setSearchQueryRaw}
						className={`pl-8 pr-8 h-12 text-base `}
					/>
					<View className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-8">
						<Text>
							<Search size={16} />
						</Text>
					</View>
				</View>
				{/* <View className="flex-row gap-2 mt-3">
					<Button variant="secondary" onPress={() => onFilterChange('on_sale')} className="rounded-full flex-row items-center" >
						{filters.on_sale ? <Check size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
						<Text className="font-semibold ">On Sale</Text>
					</Button>
					<Button variant="secondary" onPress={() => onFilterChange('status', 'instock')} className="rounded-full flex-row items-center">
						{filters.on_sale ? <Check size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
						<Text className="font-semibold">In Stock</Text>
					</Button>
					<Button variant="default" onPress={() => onFilterChange('clear')} className="rounded-full">
						<Text className="font-semibold">Clear</Text>
					</Button>
				</View> */}
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
									<Text className="text-base font-semibold mt-1">$ {item.price}</Text>
								</View>
								<TouchableOpacity
									className="bg-gray-800 rounded-full p-3"
									onPress={() => onAddToCart(item.id)}
								>
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

const CartTab = ({ cart, products, updateQuantity, removeFromCart, onPlaceOrder, onCancel, storeSettings }: {
	cart: CartItem[];
	products: Product[];
	updateQuantity: (productId: number, amount: number) => void;
	removeFromCart: (productId: number) => void;
	onPlaceOrder: (customerId?: number) => void;
	onCancel: () => void;
	storeSettings: any
}
) => {
	const [customerSearch, setCustomerSearch] = useState('');
	const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

	const cartDetails = useMemo(() => cart.map(item => ({ ...item, product: products.find(p => p.id === item.product_id) })).filter(item => item.product), [cart, products]);
	const summary = useMemo(() => {
		const subTotal = cartDetails.reduce((acc, item: any) => acc + (parseFloat(item.product.price) * item.quantity), 0);
		return { subTotal, tax: 0, total: subTotal };
	}, [cartDetails]);

	const handleSearchCustomers = async (query: string) => {
		setCustomerSearch(query);
		if (query.length < 2) { setFoundCustomers([]); return; }
		const results = await wooApiFetch('customers', { params: { search: query } }, undefined, storeSettings?.woocommerce);
		setFoundCustomers(results);
	};

	const selectCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
		setFoundCustomers([]);
	};

	return (
		<ScrollView className="p-4">
			<Text className="text-3xl font-extrabold mb-6">Your Cart</Text>
			<View className="mb-6">
				<Text className="text-sm font-medium mb-2">Customer</Text>
				<TextInput
					placeholder="Search for a customer..."
					value={customerSearch}
					onChangeText={handleSearchCustomers}
					className=" border border-gray-300 rounded-lg p-3 text-base"
				/>
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

			<View className="">
				{cartDetails.map((item: any) => (
					<Card key={item.product_id} className='mt-2' >
						<CardContent className='p-3 flex-row items-center justify-between'>
							<Image source={{ uri: item.product.images[0]?.src }} className="w-16 h-16 rounded-md" />
							<View className="flex-1 mx-3">
								<Text className="text-base font-bold">{item.product.name}</Text>
								<Text className="text-sm mt-1">$ {item.product.price} × {item.quantity}</Text>
							</View>
							<View className="flex-row items-center gap-3">
								<Button size="icon" variant="ghost" onPress={() => updateQuantity(item.product_id, -1)}><LucideIcon name='Minus' size={16} className='text-primary/40' /></Button>
								<Text className="text-lg font-bold w-8 text-center">{item.quantity}</Text>
								<Button size="icon" variant="ghost" onPress={() => updateQuantity(item.product_id, 1)}><LucideIcon name='Plus' size={16} className='text-primary/40' /></Button>
							</View>
							<Button size="icon" variant="ghost" onPress={() => removeFromCart(item.product_id)}><LucideIcon name="Trash2" size={16} className="text-destructive" /></Button>
						</CardContent>
					</Card>
				))}
			</View>

			<Card className='mt-8'>
				<CardContent className="pt-3 rounded-lg space-y-2">
					<Text className="text-xl font-bold mb-2">Summary</Text>
					<View className="flex-row justify-between"><Text className="text-base">Subtotal</Text><Text className="text-base font-semibold">$ {summary.subTotal.toFixed(2)}</Text></View>
					<View className="flex-row justify-between"><Text className="text-base">Tax</Text><Text className="text-base font-semibold">$ {summary.tax.toFixed(2)}</Text></View>
					<View className="border-t border-primary/5 mt-2 pt-2 flex-row justify-between"><Text className="text-xl font-extrabold">Total</Text><Text className="text-xl font-extrabold">$ {summary.total.toFixed(2)}</Text></View>
				</CardContent>
			</Card>
			<View className="flex-row gap-3 mt-8 mb-8">
				<Button variant="secondary" onPress={onCancel} className="flex-1 py-3.5 items-center justify-center">
					<Text className="text-base font-bold ">Cancel</Text>
				</Button>
				<Button onPress={() => onPlaceOrder(selectedCustomer?.id)} disabled={!selectedCustomer} className={`flex-1 py-3.5 rounded-lg items-center justify-center`}>
					<Text className="text-base font-bold ">Order</Text>
				</Button>
			</View>
		</ScrollView>
	);
};

const ThankYouScreen = ({ order, onNewOrder, products }: {
	order: Order;
	onNewOrder: () => void;
	products: Product[];
}
) => (
	<ScrollView className="flex-1 bg-background p-6">
		<View>
			<Text className="text-4xl font-extrabold">Thank you for your purchase!</Text>
			<Text className="text-lg mt-2">Your order will be processed</Text>
			<View className="p-5 rounded-xl mt-8 border border-gray-200">
				<Text className="text-2xl font-bold mb-4">Order Summary</Text>
				<View className="space-y-2">
					<View className="flex-row justify-between"><Text className="text-base">Date</Text><Text className="font-semibold text-base">{new Date(order.date_created).toDateString()}</Text></View>
					<View className="flex-row justify-between"><Text className="text-base">Order Number</Text><Text className="font-semibold text-base">#{order.id}</Text></View>
					<View className="flex-row justify-between"><Text className="text-base">Payment Method</Text><Text className="font-semibold text-base">{order.payment_method_title}</Text></View>
				</View>
				<View className="border-t border-gray-200 my-4" />
				<View className="space-y-3">
					{order.line_items.map(item => {
						const product = products.find(p => p.id === item.product_id);
						return (
							<View key={item.product_id} className="flex-row items-center">
								<Image source={{ uri: product?.images[0]?.src || 'https://placehold.co/100' }} className="w-12 h-12 rounded-lg" />
								<View className="flex-1 mx-3">
									<Text className="font-bold text-base">{item.name}</Text>
									<Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
								</View>
								<Text className="font-semibold text-base">$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
							</View>
						)
					})}
				</View>
				<View className="border-t border-gray-200 my-4" />
				<View className="space-y-2">
					<View className="flex-row justify-between"><Text className="text-base">Subtotal</Text><Text className="text-base font-semibold">$ {order.total}</Text></View>
					<View className="flex-row justify-between"><Text className="text-base">Shipping</Text><Text className="text-base font-semibold">$ 0.00</Text></View>
					<View className="flex-row justify-between"><Text className="text-xl font-extrabold mt-2">Order Total</Text><Text className="text-xl font-extrabold mt-2">$ {order.total}</Text></View>
				</View>
			</View>
		</View>
		<Button variant="default" onPress={onNewOrder} className="mt-4 py-4 rounded-lg items-center justify-center"><Text className="text-lg font-bold">Add New Order</Text></Button>
	</ScrollView>
);

export default function OrderPage() {
	const { session, userCatalog: userSession, storeSettings } = useAuth();

	const [activeScreen, setActiveScreen] = useState<'ordering' | 'thankyou'>('ordering');
	const [activeTab, setActiveTab] = useState<'ordering' | 'cart'>('ordering');

	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isRefreshPending, setIsRefreshPending] = useState(false);

	const [filters, setFilters] = useState<Record<string, any>>({});

	const [cart, setCart] = useState<CartItem[]>([]);
	const [lastOrder, setLastOrder] = useState<Order | null>(null);

	useFocusEffect(
		React.useCallback(() => {
			const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
				if (activeTab === 'cart') {
					setActiveTab('ordering');
					return true; // block default back behavior
				}
				if (activeScreen === 'thankyou') {
					setActiveScreen('ordering');
					setActiveTab('ordering');
					return true; // block default back behavior
				}
				return false;
			});

			return () => subscription.remove();
		}, [activeTab, activeScreen])
	);

	useEffect(() => { /* Load/Save cart with AsyncStorage */ }, [cart]);

	const loadProducts = useCallback(async (isNewFilter = false) => {
		// Bug 2 Fix: Prevent multiple loads while one is in progress
		// if (isLoading) return;

		// Bug 2 Fix: If it's not a new filter/refresh and there are no more pages, do nothing.
		if (!isNewFilter && !hasMore) {
			console.log("No more products to load.");
			return;
		}

		setIsLoading(true);
		// If it's a new filter, we are also "refreshing" the list.
		if (isNewFilter) setIsRefreshing(true);

		const currentPage = isNewFilter ? 1 : page;

		try {
			const params = { ...filters, page: currentPage, per_page: PER_PAGE };

			const newProducts = await wooApiFetch('products', { params }, undefined, storeSettings?.woocommerce);

			// Check if the API returned fewer items than requested, meaning we've reached the end.
			if (!newProducts || newProducts.length < PER_PAGE) {
				setHasMore(false);
			} else {
				setHasMore(true);
			}

			setProducts(prev => isNewFilter ? newProducts : [...prev, ...newProducts]);
			setPage(currentPage + 1);

		} catch (error) {
			Alert.alert("Error", "Could not fetch products.");
		} finally {
			setIsLoading(false);
			if (isNewFilter) setIsRefreshing(false);
		}
	}, [isLoading, page, filters, hasMore]);

	useEffect(() => {
		loadProducts(true);
		setHasMore(true);
		loadProducts(true);
	}, [filters]);

	const handleFilterChange = (key: string, value?: any) => {
		setFilters(prev => {
			const newFilters = { ...prev };

			if (key === 'clear') {
				return {}; // Bug 1 Fix: Return a new, empty object to guarantee a state change.
			}

			if (key === 'search') {
				if (value) {
					newFilters.search = value;
				} else {
					delete newFilters.search; // Remove search key if query is empty
				}
			} else {
				// Toggle logic for other filters like 'on_sale'
				if (newFilters[key] === value) {
					delete newFilters[key]; // Toggle off
				} else {
					newFilters[key] = value; // Toggle on
				}
			}
			return newFilters;
		});
	};

	const handleAddToCart = (productId: number) => {
		setCart(prev => {
			const existing = prev.find(item => item.product_id === productId);
			if (existing) {
				return prev.map(item => item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item);
			}
			return [...prev, { product_id: productId, quantity: 1 }];
		});
	};

	const handleUpdateQuantity = (productId: number, amount: number) => {
		setCart(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
	};

	const handleRemoveFromCart = (productId: number) => setCart(prev => prev.filter(item => item.product_id !== productId));

	const handlePlaceOrder = async (customerId: number) => {
		if (cart.length === 0) return Alert.alert("Empty Cart", "Please add items to your cart.");
		setIsLoading(true);
		try {
			const orderData = {
				payment_method: "cod",
				payment_method_title: "Cash on Delivery",
				set_paid: false,
				customer_id: customerId,
				billing: { /* Get from customer if needed */ },
				shipping: { /* Get from customer if needed */ },
				line_items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
				meta_data: [
					{ key: "pos_source", value: "React Native App" },
				],
				for_business_number: userSession?.for_business_number || userSession?.business_number || "",
				for_business_name: userSession?.for_business_name || userSession?.business_name || "",
			};
			const newOrder: Order = await wooApiFetch('orders', { method: 'POST', body: orderData }, undefined, storeSettings?.woocommerce);
			setLastOrder(newOrder);
			setCart([]);
			setActiveScreen('thankyou');
		} catch (error) {
			Alert.alert("Order Failed", "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (activeScreen === 'thankyou' && lastOrder) {
		return <ThankYouScreen order={lastOrder} onNewOrder={() => { setActiveScreen('ordering'); setActiveTab('ordering'); }} products={products} />;
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab as any}
				className='w-full max-w-[400px] mx-auto flex-col gap-1.5'
			>
				<TabsList className='flex-row'>
					<TabsTrigger value='ordering' className='flex-1'>
						<Text>Ordering</Text>
					</TabsTrigger>
					<TabsTrigger value='cart' className='flex-1'>
						<Text>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</Text>
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{activeTab === 'ordering' ? (
				<OrderingTab
					products={products} onAddToCart={handleAddToCart} loadMore={() => loadProducts()}
					isLoading={isLoading}
					onSearch={(query) => handleFilterChange('search', query)}
					onFilterChange={handleFilterChange}
					filters={filters}
				/>
			) : (
				<CartTab
					cart={cart} products={products} updateQuantity={handleUpdateQuantity}
					removeFromCart={handleRemoveFromCart} onPlaceOrder={handlePlaceOrder as any}
					onCancel={() => setActiveTab('ordering')}
					storeSettings={storeSettings}
				/>
			)}
		</SafeAreaView>
	);
}