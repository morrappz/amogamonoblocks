import React from "react"
import { useState, useRef, useEffect } from "react"
import {
    Search,
    MoreVertical,
    ArrowLeft,
    Paperclip,
    Smile,
    Mic,
    ImageIcon,
    Eye,
    Download,
    Users,
    User,
    Star,
    UserPlus,
    UsersIcon,
    Edit,
} from "lucide-react-native"
import { Button } from "@/components/elements/Button"
import { Input } from "@/components/elements/Input"
import { View, Image, ScrollView, BackHandler } from "react-native"
import { H2, P } from "@/components/elements/Typography"
import { Text } from "@/components/elements/Text"
import { PressableCard } from "@/components/elements/Card"
import Svg, { Path } from "react-native-svg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/elements/Avatar"
import LucideIcon from "@/components/LucideIcon"
import { Label } from "@/components/elements/Label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/elements/DropdownMenu"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { sync } from "@/database/sync"
import { database } from "@/database"
import ChatList from "@/components/chat/ChatList"
import { DatabaseProvider } from "@nozbe/watermelondb/react"
import ChatScreen from "@/components/chat/ChatScreen"
import { useAuth } from "@/context/supabase-provider"
import { useHeader } from "@/context/header-context"
import { useFocusEffect } from "expo-router"
import GroupEditor from "@/components/chat/GroupEditor"
import MessageForwarder from "@/components/chat/MessageForwarder"
// import ConversationalForm from "@/components/chat-form"
// import ProductCard from "@/components/product-card"

interface Chat {
    id: string
    name: string
    lastMessage: string
    timestamp: string
    avatar: string
    isGroup?: boolean
    memberCount?: number
    members?: { name: string; avatar: string }[]
    isFavorite?: boolean
    isImportant?: boolean
}

interface Message {
    id: string
    content: string
    timestamp: string
    sender: string
    avatar: string
    fileUrl?: string
    fileName?: string
    fileType?: string
    fileSize?: number
    isFavorite?: boolean
    isImportant?: boolean
    products?: any[]
    messageType?: string
}

interface Contact {
    id: string
    name: string
    avatar: string
    type: "contact"
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    company?: string
    mobile?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
}

interface Group {
    id: string
    name: string
    avatar: string
    memberCount: number
    type: "group"
}

type SelectableItem = Contact | Group

interface ChatBot {
    id: string
    name: string
    avatar: string
    description: string
    capabilities: string[]
}

interface FormField {
    id: string
    type: "text" | "email" | "phone" | "select" | "textarea"
    label: string
    placeholder?: string
    required: boolean
    options?: string[]
    question?: string
}

interface ChatForm {
    id: string
    title: string
    description: string
    fields: FormField[]
    isActive: boolean
}

interface BotResponse {
    type: "text" | "form" | "quick_replies"
    content: string
    form?: ChatForm
    quickReplies?: string[]
    products?: any[]
}

export default function ChatApp() {
    const { userCatalog } = useAuth()
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
    const [selectedScreen, setSelectedScreen] = useState<string | null>(null)
    const [messageToForward, setMessageToForward] = useState<Message | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

    const [searchQuery, setSearchQuery] = useState("")
    const [contactSearchQuery, setContactSearchQuery] = useState("")
    const [showContacts, setShowContacts] = useState(false)
    const [contactViewType, setContactViewType] = useState<"contacts" | "groups">("contacts")
    const [actionType, setActionType] = useState<"reply" | "forward" | "add" | null>(null)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [selectedItems, setSelectedItems] = useState<SelectableItem[]>([])
    const [showMenu, setShowMenu] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [showEditForm, setShowEditForm] = useState(false)
    const messagesEndRef = useRef(null)
    const scrollViewRef = useRef(null);
    const [stagedFiles, setStagedFiles] = useState<File[]>([])
    const [conversationalForms, setConversationalForms] = useState<{
        [key: string]: { form: ChatForm; currentFieldIndex: number; responses: { [key: string]: string } }
    }>({})

    const [showAddContactForm, setShowAddContactForm] = useState(false)
    const [showAddGroupForm, setShowAddGroupForm] = useState(false)

    const [showEditGroupForm, setShowEditGroupForm] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<Contact[]>([])

    const { setShow } = useHeader()
    useEffect(() => {
        if (selectedChat) {
            setShow(false);
        } else {
            setShow(true);
        }
        return () => {
            setShow(true)
        };
        // eslint-disable-next-line
    }, [selectedChat]);

    useFocusEffect(
        React.useCallback(() => {
            const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
                if (selectedChat) {
                    setSelectedChat(null);
                    return true; // block default back behavior
                }
                return false;
            });

            return () => subscription.remove(); // ✅ this is the correct way now
        }, [selectedChat])
    );

    const [chats, setChats] = useState<Chat[]>([
        {
            id: "19",
            name: "John Doe",
            lastMessage: "Hey, how are you doing?",
            timestamp: "2:30 PM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=JD",
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "16",
            name: "Design Team",
            lastMessage: "Sarah: The mockups are ready",
            timestamp: "1:45 PM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=DT",
            isGroup: true,
            memberCount: 5,
            members: [
                { name: "Sarah", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=S" },
                { name: "Mike", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=M" },
                { name: "Alex", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=A" },
                { name: "Emma", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=E" },
                { name: "You", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y" },
            ],
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "17",
            name: "Mom",
            lastMessage: "Don't forget dinner tonight",
            timestamp: "12:15 PM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=M",
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "18",
            name: "AI Support Group",
            lastMessage: "Support Assistant: How can I help you today?",
            timestamp: "11:30 AM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=AI",
            isGroup: true,
            memberCount: 4,
            members: [
                { name: "Support Assistant", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=SA" },
                { name: "Form Helper", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=FH" },
                { name: "FAQ Bot", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=FB" },
                { name: "You", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y" },
            ],
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "3",
            name: "Shop Assistant",
            lastMessage: "Shopping Bot: Looking for something specific? I can help!",
            timestamp: "10:15 AM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=🛍️",
            isGroup: true,
            memberCount: 3,
            members: [
                { name: "Shopping Bot", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️" },
                { name: "Style Assistant", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=👗" },
                { name: "You", avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y" },
            ],
            isFavorite: false,
            isImportant: false,
        },
    ])

    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
        "1": [
            {
                id: "1",
                content: "Hey, how are you doing?",
                timestamp: "2:30 PM",
                sender: "John Doe",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=JD",
                isFavorite: false,
                isImportant: false,
            },
            {
                id: "2",
                content: "I'm doing great! Just working on some new projects.",
                timestamp: "2:32 PM",
                sender: "You",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
                isFavorite: false,
                isImportant: false,
            },
        ],
        "2": [
            {
                id: "1",
                content: "The mockups are ready for review",
                timestamp: "1:45 PM",
                sender: "Sarah",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=S",
                isFavorite: false,
                isImportant: false,
            },
            {
                id: "2",
                content: "Great work everyone!",
                timestamp: "1:46 PM",
                sender: "You",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
                isFavorite: false,
                isImportant: false,
            },
        ],
        "4": [
            {
                id: "1",
                content:
                    "Welcome to AI Support Group! I'm here to help you with questions and forms. Type 'help' to see what I can do.",
                timestamp: "11:30 AM",
                sender: "Support Assistant",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=SA",
                isFavorite: false,
                isImportant: false,
            },
        ],
        "5": [
            {
                id: "1",
                content: "Welcome to our shop! I'm here to help you find the perfect products. What are you looking for today?",
                timestamp: "10:15 AM",
                sender: "Shopping Bot",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                isFavorite: false,
                isImportant: false,
            },
        ],
    })

    const [newMessage, setNewMessage] = useState("")

    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: "1",
            name: "John Doe",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=JD",
            type: "contact",
            email: "john.doe@email.com",
            phone: "+1 (555) 123-4567",
            firstName: "John",
            lastName: "Doe",
            company: "Tech Corp",
            mobile: "+1 (555) 123-4567",
            address1: "123 Main St",
            address2: "Apt 4B",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA",
        },
        {
            id: "2",
            name: "Sarah Wilson",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=SW",
            type: "contact",
            email: "sarah.wilson@email.com",
            phone: "+1 (555) 234-5678",
            firstName: "Sarah",
            lastName: "Wilson",
            company: "Design Studio",
            mobile: "+1 (555) 234-5678",
            address1: "456 Oak Ave",
            address2: "",
            city: "Los Angeles",
            state: "CA",
            zip: "90210",
            country: "USA",
        },
        {
            id: "3",
            name: "Mike Johnson",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=MJ",
            type: "contact",
            email: "mike.johnson@email.com",
            phone: "+1 (555) 345-6789",
            firstName: "Mike",
            lastName: "Johnson",
            company: "Marketing Inc",
            mobile: "+1 (555) 345-6789",
            address1: "789 Pine St",
            address2: "Suite 200",
            city: "Chicago",
            state: "IL",
            zip: "60601",
            country: "USA",
        },
        {
            id: "4",
            name: "Emma Davis",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=ED",
            type: "contact",
            email: "emma.davis@email.com",
            phone: "+1 (555) 456-7890",
            firstName: "Emma",
            lastName: "Davis",
            company: "Creative Agency",
            mobile: "+1 (555) 456-7890",
            address1: "321 Elm St",
            address2: "",
            city: "Miami",
            state: "FL",
            zip: "33101",
            country: "USA",
        },
        {
            id: "5",
            name: "Alex Brown",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=AB",
            type: "contact",
            email: "alex.brown@email.com",
            phone: "+1 (555) 567-8901",
            firstName: "Alex",
            lastName: "Brown",
            company: "Startup Hub",
            mobile: "+1 (555) 567-8901",
            address1: "654 Maple Dr",
            address2: "Unit 5",
            city: "Austin",
            state: "TX",
            zip: "73301",
            country: "USA",
        },
        {
            id: "6",
            name: "Lisa Garcia",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=LG",
            type: "contact",
            email: "lisa.garcia@email.com",
            phone: "+1 (555) 678-9012",
            firstName: "Lisa",
            lastName: "Garcia",
            company: "Consulting Group",
            mobile: "+1 (555) 678-9012",
            address1: "987 Cedar Ln",
            address2: "",
            city: "Seattle",
            state: "WA",
            zip: "98101",
            country: "USA",
        },
    ])

    const [groups, setGroups] = useState<Group[]>([
        {
            id: "g1",
            name: "Design Team",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=DT",
            memberCount: 5,
            type: "group",
        },
        {
            id: "g2",
            name: "Marketing Squad",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=MS",
            memberCount: 8,
            type: "group",
        },
        {
            id: "g3",
            name: "Family Group",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=FG",
            memberCount: 6,
            type: "group",
        },
        {
            id: "g4",
            name: "Project Alpha",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=PA",
            memberCount: 12,
            type: "group",
        },
    ])

    const [chatBots] = useState<ChatBot[]>([
        {
            id: "bot1",
            name: "Support Assistant",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=SA",
            description: "I can help with general questions and support",
            capabilities: ["QnA", "Support", "Forms"],
        },
        {
            id: "bot2",
            name: "Form Helper",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=FH",
            description: "I help you fill out forms and collect information",
            capabilities: ["Forms", "Data Collection"],
        },
        {
            id: "bot3",
            name: "FAQ Bot",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=FB",
            description: "I answer frequently asked questions",
            capabilities: ["QnA", "Knowledge Base"],
        },
    ])

    const [activeForms, setActiveForms] = useState<{ [key: string]: ChatForm }>({})
    const [formResponses, setFormResponses] = useState<{ [key: string]: { [key: string]: string } }>({})

    const [products] = useState([
        {
            id: "p1",
            name: "Premium Wireless Headphones",
            price: 199,
            originalPrice: 249,
            image: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=200&width=200&text=Headphones",
            rating: 4.5,
            reviews: 128,
            description: "High-quality wireless headphones with noise cancellation",
            inStock: true,
            category: "Electronics",
            brand: "AudioTech",
            colors: ["Black", "White", "Blue"],
        },
        {
            id: "p2",
            name: "Stylish Running Shoes",
            price: 89,
            originalPrice: 120,
            image: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=200&width=200&text=Shoes",
            rating: 4.2,
            reviews: 89,
            description: "Comfortable running shoes for daily workouts",
            inStock: true,
            category: "Footwear",
            brand: "SportMax",
            colors: ["Red", "Blue", "Gray"],
            sizes: ["8", "9", "10", "11"],
        },
        {
            id: "p3",
            name: "Classic Cotton T-Shirt",
            price: 25,
            image: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=200&width=200&text=T-Shirt",
            rating: 4.0,
            reviews: 45,
            description: "100% cotton comfortable t-shirt",
            inStock: true,
            category: "Clothing",
            brand: "BasicWear",
            colors: ["White", "Black", "Navy"],
            sizes: ["S", "M", "L", "XL"],
        },
    ])

    const [cart, setCart] = useState([])
    const [wishlist, setWishlist] = useState([])

    const scrollToBottom = () => {
        // TODO
        // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

        scrollViewRef.current?.scrollToEnd({ animated: true });
    }

    const detectVideoUrl = (text: string) => {
        const videoUrlPatterns = [
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
            /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i,
        ]

        for (const pattern of videoUrlPatterns) {
            const match = text.match(pattern)
            if (match) {
                if (pattern.source.includes("youtube")) {
                    return { type: "youtube", id: match[1], url: text }
                } else if (pattern.source.includes("vimeo")) {
                    return { type: "vimeo", id: match[1], url: text }
                } else {
                    return { type: "direct", url: text }
                }
            }
        }
        return null
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, selectedChat])

    const generateBotResponse = (message: string, chatId: string): BotResponse | null => {
        const lowerMessage = message.toLowerCase().trim()

        // Help command
        if (lowerMessage === "help" || lowerMessage === "/help") {
            return {
                type: "text",
                content:
                    'I can help you with:\n• Ask questions (just type your question)\n• Fill forms (type "form" or "contact form")\n• Get quick answers\n\nTry typing: "What are your hours?" or "contact form"',
            }
        }

        // Form requests
        if (lowerMessage.includes("form") || lowerMessage.includes("contact") || lowerMessage.includes("survey")) {
            const contactForm: ChatForm = {
                id: "contact_form_" + Date.now(),
                title: "Contact Information Form",
                description: "I'll help you fill out your contact details step by step",
                fields: [
                    {
                        id: "name",
                        type: "text",
                        label: "Full Name",
                        question: "What's your full name?",
                        placeholder: "Enter your full name",
                        required: true,
                    },
                    {
                        id: "email",
                        type: "email",
                        label: "Email Address",
                        question: "What's your email address?",
                        placeholder: "Enter your email",
                        required: true,
                    },
                    {
                        id: "phone",
                        type: "phone",
                        label: "Phone Number",
                        question: "What's your phone number? (Optional)",
                        placeholder: "Enter your phone number",
                        required: false,
                    },
                    {
                        id: "company",
                        type: "text",
                        label: "Company",
                        question: "Which company do you work for? (Optional)",
                        placeholder: "Enter your company name",
                        required: false,
                    },
                    {
                        id: "message",
                        type: "textarea",
                        label: "Message",
                        question: "How can we help you today?",
                        placeholder: "Tell us how we can help",
                        required: true,
                    },
                ],
                isActive: true,
            }

            return {
                type: "form",
                content: "I'll help you fill out a contact form. Let's start with the first question:",
                form: contactForm,
            }
        }

        // QnA responses
        const qnaResponses: { [key: string]: string } = {
            hours: "Our support hours are Monday-Friday 9AM-6PM EST.",
            pricing: "We offer flexible pricing plans starting at $9.99/month. Would you like me to show you a pricing form?",
            support:
                "You can reach our support team through this chat, email at support@company.com, or phone at 1-800-SUPPORT.",
            features: "Our main features include real-time chat, file sharing, group messaging, and AI assistance.",
            account: "To manage your account, you can update your profile, change settings, or contact support for help.",
            billing: "For billing questions, please contact our billing department or fill out a billing inquiry form.",
            technical:
                "For technical issues, please describe your problem and I'll help troubleshoot or escalate to our tech team.",
        }

        // Check for keywords in the message
        for (const [keyword, response] of Object.entries(qnaResponses)) {
            if (lowerMessage.includes(keyword)) {
                return {
                    type: "quick_replies",
                    content: response,
                    quickReplies: ["More info", "Contact support", "Fill form", "Help"],
                }
            }
        }

        // Default response with quick replies
        return {
            type: "quick_replies",
            content:
                "I'm here to help! I can assist with questions about our services, help you fill out forms, or connect you with support.",
            quickReplies: ["Show pricing", "Contact form", "Support hours", "Help"],
        }
    }

    const handleBotInteraction = (userMessage: string, chatId: string) => {
        // Only respond in the AI Support Group
        if (chatId !== "4") return

        const botResponse = generateBotResponse(userMessage, chatId)
        if (!botResponse) return

        // Add bot response after a short delay
        setTimeout(() => {
            const botMessage: Message = {
                id: Date.now().toString(),
                content: botResponse.content,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sender: "Support Assistant",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=SA",
                isFavorite: false,
                isImportant: false,
            }

            setMessages((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), botMessage],
            }))

            // Handle conversational form display
            if (botResponse.form) {
                setConversationalForms((prev) => ({
                    ...prev,
                    [chatId]: {
                        form: botResponse.form!,
                        currentFieldIndex: 0,
                        responses: {},
                    },
                }))
            }
        }, 1000)
    }

    const handleFormSubmit = (chatId: string, formData: { [key: string]: string }) => {
        const form = activeForms[chatId]
        if (!form) return

        // Store form responses
        setFormResponses((prev) => ({
            ...prev,
            [form.id]: formData,
        }))

        // Send confirmation message
        const confirmationMessage: Message = {
            id: Date.now().toString(),
            content: `Thank you! I've received your ${form.title.toLowerCase()}. Here's what you submitted:\n\n${Object.entries(
                formData,
            )
                .map(([key, value]) => {
                    const field = form.fields.find((f) => f.id === key)
                    return `${field?.label}: ${value}`
                })
                .join("\n")}\n\nSomeone from our team will get back to you soon!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sender: "Support Assistant",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=SA",
            isFavorite: false,
            isImportant: false,
        }

        setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), confirmationMessage],
        }))

        // Clear active form
        setActiveForms((prev) => {
            const newForms = { ...prev }
            delete newForms[chatId]
            return newForms
        })
    }

    const handleFieldSubmit = (chatId: string, fieldId: string, value: string, isComplete: boolean) => {
        const formState = conversationalForms[chatId]
        if (!formState) return

        // Update responses
        const newResponses = { ...formState.responses, [fieldId]: value }

        if (isComplete) {
            // Form is complete - send confirmation
            const confirmationMessage: Message = {
                id: Date.now().toString(),
                content: `Perfect! I've collected all your information. Here's what you submitted:\n\n${Object.entries(
                    newResponses,
                )
                    .map(([key, val]) => {
                        const field = formState.form.fields.find((f) => f.id === key)
                        return `${field?.label}: ${val || "Not provided"}`
                    })
                    .join("\n")}\n\nThank you! Someone from our team will get back to you soon! 🎉`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sender: "Support Assistant",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=SA",
                isFavorite: false,
                isImportant: false,
            }

            setMessages((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), confirmationMessage],
            }))

            // Clear conversational form
            setConversationalForms((prev) => {
                const newForms = { ...prev }
                delete newForms[chatId]
                return newForms
            })
        } else {
            // Move to next field
            setConversationalForms((prev) => ({
                ...prev,
                [chatId]: {
                    ...formState,
                    currentFieldIndex: formState.currentFieldIndex + 1,
                    responses: newResponses,
                },
            }))
        }
    }

    const handleQuickReply = (reply: string, chatId: string) => {
        // Send user's quick reply as a message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sender: "You",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
            isFavorite: false,
            isImportant: false,
        }

        setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), userMessage],
        }))

        // Generate bot response
        handleBotInteraction(reply, chatId)
    }

    const handleSendMessage = () => {
        if ((newMessage.trim() || stagedFiles.length > 0) && selectedChat) {
            // Send text message if there's text
            if (newMessage.trim()) {
                const textMessage: Message = {
                    id: Date.now().toString(),
                    content: newMessage,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    sender: "You",
                    avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
                    isFavorite: false,
                    isImportant: false,
                }

                setMessages((prev) => ({
                    ...prev,
                    [selectedChat]: [...(prev[selectedChat] || []), textMessage],
                }))

                // Trigger bot interaction for AI Support Group and Shopping Group
                if (selectedChat === "4") {
                    handleBotInteraction(newMessage, selectedChat)
                } else if (selectedChat === "5") {
                    handleShoppingBotInteraction(newMessage, selectedChat)
                }
            }

            // Send file messages - change to send all files in one message
            if (stagedFiles.length > 0) {
                const fileMessage: Message = {
                    id: Date.now().toString() + Math.random(),
                    content: `${stagedFiles.length} file${stagedFiles.length > 1 ? "s" : ""} shared`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    sender: "You",
                    avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
                    fileUrl: "multiple_files", // Special indicator for multiple files
                    fileName: JSON.stringify(
                        stagedFiles.map((file) => ({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            url: URL.createObjectURL(file),
                        })),
                    ),
                    fileType: "multiple",
                    fileSize: stagedFiles.reduce((total, file) => total + file.size, 0),
                    isFavorite: false,
                    isImportant: false,
                }

                setMessages((prev) => ({
                    ...prev,
                    [selectedChat]: [...(prev[selectedChat] || []), fileMessage],
                }))
            }

            setNewMessage("")
            setStagedFiles([])
        }
    }

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return

        const newFiles = Array.from(files)
        setStagedFiles((prev) => [...prev, ...newFiles])
        setShowMenu(false)
    }

    const handleImageUpload = (files: FileList | null) => {
        if (!files) return

        const newFiles = Array.from(files)
        setStagedFiles((prev) => [...prev, ...newFiles])
        setShowMenu(false)
    }

    const handleMessageAction = (action: "copy" | "reply" | "forward", message: Message) => {
        if (action === "copy") {
            navigator.clipboard.writeText(message.content)
        } else if (action === "reply" || action === "forward") {
            setSelectedMessage(message)
            setActionType(action)
            setSelectedItems([])
            setContactSearchQuery("")
            setContactViewType("contacts")
            setShowContacts(true)
        }
    }

    const handleAddContacts = (type: "contacts" | "groups") => {
        setActionType("add")
        setSelectedItems([])
        setContactSearchQuery("")
        setContactViewType(type)
        setShowContacts(true)
    }

    const handleEditContact = (contact: Contact) => {
        setEditingContact(contact)
        setShowEditForm(true)
    }

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group)
        setShowEditGroupForm(true)
    }

    const handleSaveContact = (updatedContact: Contact) => {
        setContacts((prev) => prev.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact)))
        setShowEditForm(false)
        setEditingContact(null)
    }

    const handleSaveGroup = (updatedGroup: Group) => {
        setGroups((prev) => prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)))
        setShowEditGroupForm(false)
        setEditingGroup(null)
    }

    const toggleFavorite = (messageId: string) => {
        if (!selectedChat) return
        setMessages((prev) => ({
            ...prev,
            [selectedChat]: prev[selectedChat].map((msg) =>
                msg.id === messageId ? { ...msg, isFavorite: !msg.isFavorite } : msg,
            ),
        }))
    }

    const toggleImportant = (messageId: string) => {
        if (!selectedChat) return
        setMessages((prev) => ({
            ...prev,
            [selectedChat]: prev[selectedChat].map((msg) =>
                msg.id === messageId ? { ...msg, isImportant: !msg.isImportant } : msg,
            ),
        }))
    }

    const toggleChatFavorite = (chatId: string) => {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, isFavorite: !chat.isFavorite } : chat)))
    }

    const toggleChatImportant = (chatId: string) => {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, isImportant: !chat.isImportant } : chat)))
    }

    const handleItemToggle = (item: SelectableItem) => {
        setSelectedItems((prev) => {
            const isSelected = prev.some((selectedItem) => selectedItem.id === item.id)
            if (isSelected) {
                return prev.filter((selectedItem) => selectedItem.id !== item.id)
            } else {
                return [...prev, item]
            }
        })
    }

    const handleSendToItems = () => {
        if (selectedItems.length > 0) {
            const contactCount = selectedItems.filter((item) => item.type === "contact").length
            const groupCount = selectedItems.filter((item) => item.type === "group").length
            const totalUserCount = selectedItems.reduce((total, item) => {
                if (item.type === "contact") {
                    return total + 1
                } else {
                    return total + (item as Group).memberCount
                }
            }, 0)

            if (actionType === "add") {
                console.log(`Adding to contacts/groups:`)
                console.log(`- ${contactCount} contacts`)
                console.log(`- ${groupCount} groups`)
                console.log(
                    "Selected items:",
                    selectedItems.map((item) => item.name),
                )
            } else {
                console.log(`${actionType} message to:`)
                console.log(`- ${contactCount} contacts`)
                console.log(`- ${groupCount} groups`)
                console.log(`- Total users reached: ${totalUserCount}`)
                console.log(
                    "Selected items:",
                    selectedItems.map((item) => item.name),
                )
            }

            setShowContacts(false)
            setActionType(null)
            setSelectedMessage(null)
            setSelectedItems([])
            setContactSearchQuery("")
            setContactViewType("contacts")
        }
    }

    const filteredChats = chats.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const filteredMessages =
        selectedChat && messages[selectedChat]
            ? messages[selectedChat].filter(
                (message) =>
                    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (message.fileName && message.fileName.toLowerCase().includes(searchQuery.toLowerCase())),
            )
            : []

    const currentList = contactViewType === "contacts" ? contacts : groups
    const filteredCurrentList = currentList.filter((item) =>
        item.name.toLowerCase().includes(contactSearchQuery.toLowerCase()),
    )

    // Calculate total user count for selected items
    const totalUserCount = selectedItems.reduce((total, item) => {
        if (item.type === "contact") {
            return total + 1
        } else {
            return total + (item as Group).memberCount
        }
    }, 0)

    const selectedContactsCount = selectedItems.filter((item) => item.type === "contact").length
    const selectedGroupsCount = selectedItems.filter((item) => item.type === "group").length

    const handleShoppingBotInteraction = (message: string, chatId: string) => {
        const lowerMessage = message.toLowerCase().trim()

        if (lowerMessage === "show products") {
            const productMessage: Message = {
                id: Date.now().toString(),
                content: "Here are some products you might like:",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sender: "Shopping Bot",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                isFavorite: false,
                isImportant: false,
                messageType: "products",
                products: products.slice(0, 2),
            }

            setMessages((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), productMessage],
            }))
        } else if (lowerMessage === "browse electronics") {
            const electronicsProducts = products.filter((product) => product.category === "Electronics")

            const electronicsMessage: Message = {
                id: Date.now().toString(),
                content: "Here are some electronics products:",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sender: "Shopping Bot",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                isFavorite: false,
                isImportant: false,
                messageType: "products",
                products: electronicsProducts.slice(0, 2),
            }

            setMessages((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), electronicsMessage],
            }))
        } else if (lowerMessage === "view cart") {
            if (cart.length === 0) {
                const emptyCartMessage: Message = {
                    id: Date.now().toString(),
                    content: "Your cart is empty.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    sender: "Shopping Bot",
                    avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                    isFavorite: false,
                    isImportant: false,
                }

                setMessages((prev) => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), emptyCartMessage],
                }))
            } else {
                const cartProducts = products.filter((product) => cart.includes(product.id))

                const cartMessage: Message = {
                    id: Date.now().toString(),
                    content: "Here are the items in your cart:",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    sender: "Shopping Bot",
                    avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                    isFavorite: false,
                    isImportant: false,
                    messageType: "products",
                    products: cartProducts.slice(0, 2),
                }

                setMessages((prev) => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), cartMessage],
                }))
            }
        } else {
            const defaultMessage: Message = {
                id: Date.now().toString(),
                content: "I can help you find products, browse categories, or view your cart. What would you like to do?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sender: "Shopping Bot",
                avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=🛍️",
                isFavorite: false,
                isImportant: false,
            }

            setMessages((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), defaultMessage],
            }))
        }
    }

    const handleAddToCart = (productId: string) => {
        setCart((prev) => {
            if (prev.includes(productId)) {
                return prev
            } else {
                return [...prev, productId]
            }
        })
    }

    const handleViewProductDetails = (productId: string) => {
        console.log(`View details for product: ${productId}`)
    }

    const handleToggleWishlist = (productId: string) => {
        setWishlist((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId)
            } else {
                return [...prev, productId]
            }
        })
    }

    const handleAddNewContact = () => {
        setShowAddContactForm(true)
    }

    const handleAddNewGroup = () => {
        setShowAddGroupForm(true)
    }

    const handleForwardMessage = (message: Message) => {
        setMessageToForward(message);
    };

    const handleSetReply = (message: Message | null) => {
        setReplyingToMessage(message);
    };

    if (showAddContactForm) {
        // return <AddContactForm onSave={handleSaveNewContact} onCancel={() => setShowAddContactForm(false)} />
        return <></>
    }

    if (showAddGroupForm) {
        // return <AddGroupForm onSave={handleSaveNewGroup} onCancel={() => setShowAddGroupForm(false)} />
        return <></>
    }

    if (showEditGroupForm && editingGroup) {
        return (
            // <EditGroupForm
            //     group={editingGroup}
            //     onSave={handleSaveGroup}
            //     onCancel={() => {
            //         setShowEditGroupForm(false)
            //         setEditingGroup(null)
            //     }}
            // />
            <></>
        )
    }

    if (showEditForm && editingContact) {
        return (
            // <EditContactForm
            //     contact={editingContact}
            //     onSave={handleSaveContact}
            //     onCancel={() => {
            //         setShowEditForm(false)
            //         setEditingContact(null)
            //     }}
            // />
            <></>
        )
    }

    if (showContacts) {
        const getHeaderTitle = () => {
            if (actionType === "add") {
                return "Add Contacts & Groups"
            } else if (actionType === "reply") {
                return "Reply to"
            } else {
                return "Forward to"
            }
        }

        const getButtonText = () => {
            if (actionType === "add") {
                return "Add"
            } else {
                return "Send"
            }
        }

        return (
            <></>
        )
    }



    if (messageToForward) {
        return (
            <MessageForwarder
                messageToForward={messageToForward}
                onClose={() => setMessageToForward(null)}
                currentUserId={String(userCatalog.user_catalog_id)}
            />
        );
    }

    if (selectedScreen === "group-cu") {
        return <GroupEditor currentUserId={String(userCatalog.user_catalog_id)} currentUserEmail={String(userCatalog.user_email)} selectedChat={selectedChat} setSelectedChat={setSelectedChat} setSelectedScreen={setSelectedScreen} />
    }

    if (!selectedChat) {
        return (
            <View className="flex flex-col h-full w-full">
                {/* <View className="flex items-center gap-3 p-4 border-b bg-gray-50">
                    <Image src="https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=Me" alt="Current User" className="w-8 h-8 rounded-full" />
                    <View className="flex-1">
                        <H2 className="font-semibold text-primary text-sm">Alex Johnson</H2>
                        <P className="text-xs text-gray-500">Online</P>
                    </View>
                    <View className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onPress={() => handleAddContacts("contacts")} className="p-2">
                            <User className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onPress={() => handleAddContacts("groups")} className="p-2">
                            <Users className="h-4 w-4" />
                        </Button>
                    </View>
                </View>  */}
                <ChatList setSelectedChat={setSelectedChat} currentUserId={String(userCatalog.user_catalog_id)} setSelectedScreen={setSelectedScreen} />
            </View>
        )
    }

    return (
        <View className="flex flex-col h-full w-full absolute top-0">
            <ChatScreen
                chatGroupId={selectedChat}
                setSelectedChat={(id: string) => setSelectedChat(id)}
                setSelectedScreen={setSelectedScreen}
                onForwardMessage={handleForwardMessage}
                replyingToMessage={replyingToMessage}
                onSetReply={handleSetReply}
            />
        </View>
    )
}
