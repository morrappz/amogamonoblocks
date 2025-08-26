

import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, ScrollView, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Text } from '@/components/elements/Text';

import { wooApiFetch } from '@/lib/woocommerce';

import { Card, CardContent, CardHeader } from '@/components/elements/Card';
import { Button } from '@/components/elements/Button';
import { Input } from '@/components/elements/Input';
import { Label } from '@/components/elements/Label';
import { Textarea } from '@/components/elements/Textarea';
import { Badge } from '@/components/elements/Badge';
import LucideIcon from '@/components/LucideIcon';
import { toast } from 'sonner-native';
import { DatePicker } from '@/components/elements/DatePicker';
import { P } from '@/components/elements/Typography';
import { z } from 'zod';
import { Select } from '@/components/elements/Select';
import { CheckCircle2 } from 'lucide-react-native';

// Schema for a single product line item being quoted
export const lineItemSchema = z.object({
    product_id: z.string(),
    name: z.string(),
    product_image: z.string().optional(),
    quantity: z.string(),
    price: z.number().min(0, "Price must be positive").optional(),
    tax: z.number().min(0, "Tax must be positive").optional(),
});

// Main schema for the supplier's quotation form
export const supplierQuoteSchema = z.object({
    line_items: z.array(lineItemSchema),

    // Supplier Info
    supplier_name: z.string().min(1, "Your name is required"),
    supplier_email: z.string().email("Invalid email address"),
    supplier_company: z.string().optional(),
    supplier_mobile: z.string().optional(),

    // Terms
    payment_terms: z.string().optional(),
    delivery_terms: z.string().optional(),
    valid_until: z.string().min(1, "Valid until date is required"), // Store as ISO string
    additional_terms: z.string().optional(),

    // Delivery Address
    shipping: z.object({
        address_1: z.string().min(1, "Address is required"),
        address_2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        postcode: z.string().min(1, "Zipcode is required"),
        country: z.string().optional(),
        phone: z.string().optional(),
    }),

    billing: z.object({
        address_1: z.string().optional(),
        address_2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
    }),
});

// Infer the TypeScript type from the schema
export type SupplierQuoteFormData = z.infer<typeof supplierQuoteSchema>;

// --- TYPES for this page ---
type Product = { quote_product_id: string; product_name: string; product_image?: string; images?: { src: string }[]; quantity: number }; // Made images optional
type QuoteRequest = { quote_id: number; created_at: string; quote_status: string; line_items: Product[]; customer_note: string; customer_id: number; customer_key: string; supplier_key: string; meta_data: { key: string, value: any }[]; currency?: any };
type Customer = { first_name?: string; last_name?: string; email?: string; billing?: any; shipping?: any; user_mobile?: string; business_name?: string; }; // Made properties optional


// --- The Main Page Component ---
export default function ProvideQuotePage() {
    const { id: quoteId } = useLocalSearchParams<{ id: string }>();
    const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [supplier, setSupplier] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thankYouPage, setThankYouPage] = useState(false)
    const router = useRouter();

    // --- React Hook Form Setup ---
    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SupplierQuoteFormData>({
        resolver: zodResolver(supplierQuoteSchema),
        defaultValues: {
            line_items: [],
            shipping: { country: 'US' }
        }
    });

    const { fields } = useFieldArray({ control, name: "line_items" });

    const lineItemsValues = watch("line_items");
    const totals = useMemo(() => {
        const subtotal = lineItemsValues.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);

        const totalTax = lineItemsValues.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const tax = Number(item.tax) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + ((tax / 100) * price * quantity);
        }, 0);

        return { subtotal, totalTax, grandTotal: subtotal + totalTax };
    }, [JSON.stringify(lineItemsValues)]);

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!quoteId) return;
        const fetchQuoteDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const quote: QuoteRequest = await wooApiFetch(`quotes/${quoteId}`, {}, "/woomorrintegration/v1");
                let customerData: Customer = { billing: {}, shipping: {} };
                let supplierData: Customer = { billing: {}, shipping: {} };

                if (quote.customer_key) {
                    try {
                        customerData = await wooApiFetch(`users`, { params: { user_mobile: quote.customer_key } }, "/ffintegration/v1").then((r) => r[0]);
                    } catch (customerError) {
                        console.warn(`Could not fetch customer ${quote.customer_key}, proceeding without customer data.`);
                    }
                }

                if (quote.supplier_key) {
                    try {
                        supplierData = await wooApiFetch(`users`, { params: { user_mobile: quote.supplier_key } }, "/ffintegration/v1").then((r) => r[0]);
                    } catch (customerError) {
                        console.warn(`Could not fetch supplier ${quote.supplier_key}, proceeding without supplier data.`);
                    }
                }

                setQuoteRequest(quote);
                setCustomer(customerData);
                setSupplier(supplierData)

                setValue("line_items", (quote.line_items || []).map(p => ({
                    product_id: p.quote_product_id,
                    name: p.product_name,
                    quantity: p.quantity.toString(),
                    product_image: p.product_image,
                    price: 0,
                    tax: 0,
                })));
                setValue("shipping", {
                    ...(customerData?.shipping || {})
                });
                setValue("billing", {
                    ...(customerData?.billing || {})
                });

                setValue("supplier_name", `${supplierData?.first_name || ""} ${supplierData?.last_name || ""}`.trim())
                setValue("supplier_email", supplierData?.email || "")
                setValue("supplier_mobile", supplierData?.user_mobile)
                setValue("supplier_company", supplierData?.business_name)

                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 30);
                setValue("valid_until", futureDate.toISOString().split('T')[0]);

            } catch (err) {
                setError("Failed to load quote request. Please try again.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuoteDetails();
    }, [quoteId, setValue]);

    // --- Form Submission Handler ---
    const onSubmit = async (data: SupplierQuoteFormData) => {
        if (!quoteRequest || quoteRequest.quote_status !== "waiting-for-approval") {
            toast.error("the quote status is not waiting for approval")
            return
        }

        const apiData = {
            ...quoteRequest,
            ...data,
            quote_status: 'quoted',
            line_items: data.line_items.map(item => ({
                ...item,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: (item.price || 0).toString(),
                line_subtotal: ((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2).toString(),
                line_tax: (((item.tax || 0) / 100) * (item.price || 0) * Number(item.quantity)).toFixed(2).toString(),
                line_total: (((Number(item.price) || 0) * (Number(item.quantity) || 0)) + (((item.tax || 0) / 100) * (item.price || 0) * Number(item.quantity))).toFixed(2).toString()
            })),
            subtotal: totals.subtotal.toFixed(2).toString(),
            tax_total: totals.totalTax.toFixed(2).toString(),
            grand_total: totals.grandTotal.toFixed(2).toString()
        };

        try {
            setIsSubmitting(true)
            const updatedQuote = await wooApiFetch(`quotes/${quoteId}`, {
                method: 'PUT',
                body: apiData
            }, "/woomorrintegration/v1");
            toast.success("Quotation submitted successfully!");
            setThankYouPage(true)
            await fetch("/api/quote-notify", {
				method: "POST",
				body: JSON.stringify({ quote_id: quoteId, quote: apiData })
			})
        } catch (error) {
            console.error("Error submiting quote :", error)
            toast.error("Error submiting quote")
        } finally {
            setIsSubmitting(false);
        }
    };

    const created_at = quoteRequest?.created_at ? new Date(quoteRequest.created_at) : undefined

    const decodeHtmlEntity = (str: string) => {
        return str.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
    };

    if (thankYouPage) {
        return (<View className="flex-1 justify-center items-center bg-background p-8">
            <Card className="w-full max-w-md items-center">
                <CardContent className="p-8 items-center">
                    <CheckCircle2 size={64} className="text-green-500" />
                    <Text className="text-3xl font-extrabold mt-6 text-foreground">
                        Success!
                    </Text>
                    <Text className="text-lg text-muted-foreground mt-2 text-center">
                        Your quotation has been submitted successfully.
                    </Text>
                    <Button
                        onPress={() => router.push("/")} // Navigate back to the previous screen
                        className="mt-8 w-full"
                    >
                        <Text>Done</Text>
                    </Button>
                </CardContent>
            </Card>
        </View>)
    }
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-muted-foreground">Loading Quote Request...</Text>
            </View>
        );
    }

    if (error || !quoteRequest || !customer) {
        return (
            <View className="flex-1 justify-center items-center bg-background p-4">
                <Text className="text-destructive-foreground font-bold text-lg">Error</Text>
                <Text className="text-center text-foreground mt-2">{error || "Could not find the requested quote."}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerClassName="p-4 space-y-4">
                {/* Header Card */}
                <Card className="mt-2">
                    <CardContent className="p-4">
                        <View className="md:flex-row justify-between">
                            <View className="md:w-1/2">
                                <Text className="text-xl font-bold mb-2 text-card-foreground">Quote Request From:</Text>
                                <Text className="font-semibold text-foreground">Customer: {customer.first_name || 'Guest'} {customer.last_name || ''}</Text>
                                <Text className="text-foreground">Email: {customer.email}</Text>
                                <Text className="text-foreground">Mobile: {customer.user_mobile}</Text>
                                <Text className="text-foreground">Address 1: {customer?.billing?.address_1}</Text>
                                <Text className="text-foreground">Address 2: {customer?.billing?.address_2}</Text>
                                <Text className="text-foreground">City: {customer?.billing?.city} {customer?.billing?.postcode}</Text>
                            </View>
                            <View className="mt-3 md:mt-0 md:w-1/2">
                                <Text className="text-xl font-bold mb-2 text-card-foreground">Quote Details:</Text>
                                <Text className="text-foreground">#{quoteRequest.quote_id}</Text>
                                <Text className="text-foreground">Date: {created_at && created_at.toDateString()} at {created_at && created_at.toTimeString()?.split(" ")[0]}</Text>
                                <Text className="text-foreground">Items: {quoteRequest.line_items ? quoteRequest.line_items.length : ""}</Text>
                                <Text className="text-foreground">Status: {quoteRequest.quote_status.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())}</Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* <Card className="mt-2">
                    <CardContent className="p-4">
                        <View className="md:flex-row justify-between">
                            <P>{quoteRequest.customer_note}</P>
                        </View>
                    </CardContent>
                </Card> */}

                {/* Items to Quote */}
                <Card className="mt-2">
                    <CardHeader className="p-4 pt-4">
                        <Text className="font-semibold text-card-foreground flex flex-row"><LucideIcon name="Package" /> Items to Quote</Text>
                    </CardHeader>
                    <CardContent className="p-0">
                        {(fields || []).map((field, index) => {
                            const product = (quoteRequest.line_items || []).find(p => p.quote_product_id === field.product_id);
                            const imageUrl = product?.product_image;
                            return (
                                <View key={field.id} className="p-4 border-b border-border">
                                    <View className="flex-row gap-3">
                                        <Image
                                            source={imageUrl ? { uri: imageUrl } : undefined}
                                            className="w-16 h-16 rounded-lg bg-muted"
                                        />
                                        <View className="flex-1">
                                            <Text className="font-bold text-foreground">{field.name}</Text>
                                            <Badge variant="secondary" className="mt-2 self-start"><Text>Qty: {field.quantity}</Text></Badge>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-3 mt-3">
                                        <Controller control={control} name={`line_items.${index}.price`} render={({ field: { onChange, onBlur, value } }) => (
                                            <View className="flex-1">
                                                <Label>Unit Price ({decodeHtmlEntity(quoteRequest?.currency?.symbol)})</Label>
                                                <Input onBlur={onBlur} onChangeText={(text) => onChange(parseFloat(text) || 0)} value={value?.toString()} keyboardType="numeric" placeholder="0.00" />
                                                {errors.line_items?.[index]?.price && <Text className="text-destructive text-xs mt-1">{errors.line_items[index].price.message}</Text>}
                                            </View>
                                        )} />
                                        <Controller control={control} name={`line_items.${index}.tax`} render={({ field: { onChange, onBlur, value } }) => (
                                            <View className="flex-1">
                                                <Label>Tax Rate (%)</Label>
                                                <Input onBlur={onBlur} onChangeText={(text) => onChange(parseFloat(text) || 0)} value={value?.toString()} keyboardType="numeric" placeholder="0.00" />
                                            </View>
                                        )} />
                                    </View>
                                </View>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Quote Summary */}
                <Card className="mt-2">
                    <CardContent className="p-4 space-y-2">
                        <Text className="font-bold text-lg text-card-foreground">Quote Summary</Text>
                        <View className="flex-row justify-between"><Text className="text-muted-foreground">Subtotal:</Text><Text className="font-semibold text-foreground">{decodeHtmlEntity(quoteRequest?.currency?.symbol)}{totals.subtotal.toFixed(2)}</Text></View>
                        <View className="flex-row justify-between"><Text className="text-muted-foreground">Total Tax:</Text><Text className="font-semibold text-foreground">{decodeHtmlEntity(quoteRequest?.currency?.symbol)}{totals.totalTax.toFixed(2)}</Text></View>
                        <View className="border-t border-border pt-2 mt-2 flex-row justify-between"><Text className="font-bold text-xl text-foreground">Grand Total:</Text><Text className="font-bold text-xl text-foreground">{decodeHtmlEntity(quoteRequest?.currency?.symbol)}{totals.grandTotal.toFixed(2)}</Text></View>
                    </CardContent>
                </Card>

                {/* Supplier & Terms Form */}
                <Card className="mt-2">
                    <CardContent className="p-4 space-y-4">
                        <Text className="font-bold text-lg text-card-foreground">Your Information & Terms</Text>

                        <Controller control={control} name="supplier_name" render={({ field: { onChange, onBlur, value } }) => (
                            <View><Label>Your Name *</Label><Input onBlur={onBlur} readOnly value={value} /><Text className="text-destructive text-xs mt-1">{errors.supplier_name?.message}</Text></View>
                        )} />
                        <Controller control={control} name="supplier_email" render={({ field: { onChange, onBlur, value } }) => (
                            <View><Label>Your Email *</Label><Input onBlur={onBlur} readOnly value={value} keyboardType="email-address" autoCapitalize="none" /><Text className="text-destructive text-xs mt-1">{errors.supplier_email?.message}</Text></View>
                        )} />
                        <Controller control={control} name="supplier_company" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Company Name</Label><Input onBlur={onBlur} value={value} autoCapitalize="none" readOnly />
                                <Text className="text-destructive text-xs mt-1">{errors.supplier_company?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="supplier_mobile" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Mobile Number</Label><Input onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="none" keyboardType="phone-pad" />
                                <Text className="text-destructive text-xs mt-1">{errors.supplier_mobile?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="payment_terms" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Payment Terms</Label>
                                <Select
                                    // label="Choose a status"
                                    options={[
                                        { id: "net-15", name: 'Net 15 Days' },
                                        { id: "net-30", name: 'Net 30 Days' },
                                        { id: "net-45", name: 'Net 45 Days' },
                                        { id: "net-60", name: 'Net 60 Days' },
                                        { id: "cod", name: 'Cash on Delivery' },
                                        { id: "advance", name: '50% Advance' },
                                        { id: "custom", name: 'Custom Terms' },
                                    ]}
                                    labelKey="name"
                                    valueKey="id"
                                    selectedValue={value}
                                    onSelect={onChange}
                                />
                                <Text className="text-destructive text-xs mt-1">{errors.payment_terms?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="valid_until" render={({ field: { onChange, value } }) => (
                            <View>
                                <Label>Quote Valid Until *</Label>
                                <DatePicker value={value} onSelect={onChange}>
                                    <View className="border border-input rounded-lg p-3 flex-row justify-between items-center bg-background">
                                        <Text className="text-foreground">{value || "Select a date"}</Text>
                                        <LucideIcon name="Calendar" size={16} className="text-muted-foreground" />
                                    </View>
                                </DatePicker>
                                <Text className="text-destructive text-xs mt-1">{errors.valid_until?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="delivery_terms" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Delivery Terms</Label>
                                <Select
                                    // label="Choose a status"
                                    options={[
                                        { id: "1-3-days", name: '1-3 Business Days' },
                                        { id: "1-week", name: '1 Week' },
                                        { id: "2-week", name: '2 Week' },
                                        { id: "3-week", name: '3 Week' },
                                        { id: "1-month", name: '1 Month' },
                                        { id: "custom", name: 'Custom Terms' },
                                    ]}
                                    labelKey="name"
                                    valueKey="id"
                                    selectedValue={value}
                                    onSelect={onChange}
                                />
                                <Text className="text-destructive text-xs mt-1">{errors.delivery_terms?.message}</Text>
                            </View>
                        )} />

                        <Text className="my-2">Shipping Address</Text>
                        <Controller control={control} name="shipping.address_1" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Address 1</Label><Input onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="none" />
                                <Text className="text-destructive text-xs mt-1">{errors.shipping?.address_1?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="shipping.address_2" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>Address 2</Label><Input onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="none" />
                                <Text className="text-destructive text-xs mt-1">{errors.shipping?.address_2?.message}</Text>
                            </View>
                        )} />
                        <Controller control={control} name="shipping.state" render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Label>State</Label><Input onBlur={onBlur} value={value} onChangeText={onChange} autoCapitalize="none" />
                                <Text className="text-destructive text-xs mt-1">{errors.shipping?.state?.message}</Text>
                            </View>
                        )} />
                        <View className="flex flex-row">
                            <Controller control={control} name="shipping.city" render={({ field: { onChange, onBlur, value } }) => (
                                <View className="w-1/2 pr-1">
                                    <Label>City</Label><Input onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="none" />
                                    <Text className="text-destructive text-xs mt-1">{errors.shipping?.city?.message}</Text>
                                </View>
                            )} />
                            <Controller control={control} name="shipping.postcode" render={({ field: { onChange, onBlur, value } }) => (
                                <View className="w-1/2 pl-1">
                                    <Label>ZipCode</Label><Input onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="none" />
                                    <Text className="text-destructive text-xs mt-1">{errors.shipping?.postcode?.message}</Text>
                                </View>
                            )} />
                        </View>
                        <Controller control={control} name="additional_terms" render={({ field: { onChange, onBlur, value } }) => (
                            <View><Label>Terms & Conditions</Label><Textarea onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Enter any additional terms..." /></View>
                        )} />
                    </CardContent>
                </Card>
            </ScrollView>
            <View className="p-4 bg-card border-t border-border">
                <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="font-bold text-primary-foreground text-lg">Submit Quotation</Text>}
                </Button>
            </View>
        </SafeAreaView>
    );
}