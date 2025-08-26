import type React from "react"
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
import { View, Image, ScrollView } from "react-native"
import { H2, P } from "@/components/elements/Typography"
import { Text } from "@/components/elements/Text"
import { PressableCard } from "@/components/elements/Card"
import Svg, { Path } from "react-native-svg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/elements/Avatar"
import LucideIcon from "@/components/LucideIcon"
import { Label } from "@/components/elements/Label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/elements/DropdownMenu"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
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
    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const [showAddContactForm, setShowAddContactForm] = useState(false)
    const [showAddGroupForm, setShowAddGroupForm] = useState(false)

    const [showEditGroupForm, setShowEditGroupForm] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<Contact[]>([])

    const [chats, setChats] = useState<Chat[]>([
        {
            id: "1",
            name: "John Doe",
            lastMessage: "Hey, how are you doing?",
            timestamp: "2:30 PM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=JD",
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "2",
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
            id: "3",
            name: "Mom",
            lastMessage: "Don't forget dinner tonight",
            timestamp: "12:15 PM",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=M",
            isFavorite: false,
            isImportant: false,
        },
        {
            id: "4",
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
            id: "5",
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

    const handleSaveNewContact = (newContact: Contact) => {
        setContacts((prev) => [...prev, newContact])
        setShowAddContactForm(false)
    }

    const handleSaveNewGroup = (newGroup: Group) => {
        setGroups((prev) => [...prev, newGroup])
        setShowAddGroupForm(false)
    }

    // Add Contact Form Component
    const AddContactForm = ({ onSave, onCancel }: { onSave: (contact: Contact) => void; onCancel: () => void }) => {
        const [formData, setFormData] = useState<Contact>({
            id: Date.now().toString(),
            name: "",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=NC",
            type: "contact",
            email: "",
            phone: "",
            firstName: "",
            lastName: "",
            company: "",
            mobile: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            country: "",
        })

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const updatedContact = {
                ...formData,
                name: `${formData.firstName} ${formData.lastName}`.trim() || "New Contact",
                avatar: `https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=${(formData.firstName?.[0] || "N") + (formData.lastName?.[0] || "C")}`,
            }
            onSave(updatedContact)
        }

        return (
            <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                <View className="flex items-center gap-3 p-4 border-b">
                    <Button variant="ghost" size="sm" onPress={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Text className="text-lg font-semibold">Add Contact</Text>
                    <Button onPress={handleSubmit} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white ml-auto">
                        Save
                    </Button>
                </View>

                <View className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <Input
                                    value={formData.firstName || ""}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <Input
                                    value={formData.lastName || ""}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <Input
                                value={formData.company || ""}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <Input
                                value={formData.mobile || ""}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 1</label>
                            <Input
                                value={formData.address1 || ""}
                                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                            <Input
                                value={formData.address2 || ""}
                                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <Input
                                    value={formData.city || ""}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <Input
                                    value={formData.state || ""}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>

                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                                <Input
                                    value={formData.zip || ""}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <Input
                                    value={formData.country || ""}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>
                    </form>
                </View>
            </View>
        )
    }

    // Add Group Form Component
    const AddGroupForm = ({ onSave, onCancel }: { onSave: (group: Group) => void; onCancel: () => void }) => {
        const [formData, setFormData] = useState({
            name: "",
            description: "",
        })
        const [selectedUsers, setSelectedUsers] = useState<Contact[]>([])
        const [showUserSelection, setShowUserSelection] = useState(false)

        const handleUserToggle = (contact: Contact) => {
            setSelectedUsers((prev) => {
                const isSelected = prev.some((user) => user.id === contact.id)
                if (isSelected) {
                    return prev.filter((user) => user.id !== contact.id)
                } else {
                    return [...prev, contact]
                }
            })
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const newGroup: Group = {
                id: "g" + Date.now(),
                name: formData.name || "New Group",
                avatar: `https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=${formData.name.slice(0, 2).toUpperCase() || "NG"}`,
                memberCount: selectedUsers.length + 1, // +1 for current user
                type: "group",
            }
            onSave(newGroup)
        }

        if (showUserSelection) {
            return (
                <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                    <View className="flex items-center gap-3 p-4 border-b">
                        <Button variant="ghost" size="sm" onPress={() => setShowUserSelection(false)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Text className="text-lg font-semibold">Add Users</Text>
                        <Button
                            onPress={() => setShowUserSelection(false)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white ml-auto"
                        >
                            Done ({selectedUsers.length})
                        </Button>
                    </View>

                    <View className="flex-1 overflow-y-auto">
                        {contacts.map((contact) => {
                            const isSelected = selectedUsers.some((user) => user.id === contact.id)
                            return (
                                <View
                                    key={contact.id}
                                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                        }`}
                                // onPress={() => handleUserToggle(contact)}
                                >
                                    <View className="relative">
                                        <Image
                                            src={contact.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                            alt={contact.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        {isSelected && (
                                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <Path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </Svg>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-medium text-sm ${isSelected ? "text-blue-700" : ""}`}>{contact.name}</Text>
                                        <View className="text-xs text-gray-500">
                                            <View>{contact.email}</View>
                                            <View>{contact.phone}</View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </View>
            )
        }

        return (
            <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                <View className="flex items-center gap-3 p-4 border-b">
                    <Button variant="ghost" size="sm" onPress={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Text className="text-lg font-semibold">Add Group</Text>
                    <Button onPress={handleSubmit} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white ml-auto">
                        Save
                    </Button>
                </View>

                <View className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full"
                                placeholder="Enter group name"
                                required
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                                rows={3}
                                placeholder="Enter group description"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Add Users</label>
                            <Button
                                variant="outline"
                                onPress={() => setShowUserSelection(true)}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add Users ({selectedUsers.length} selected)
                            </Button>
                        </View>

                        {selectedUsers.length > 0 && (
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Users:</label>
                                <View className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedUsers.map((user) => (
                                        <View key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                            <Image src={user.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
                                            <Text className="text-sm flex-1">{user.name}</Text>
                                            <Button
                                                onPress={() => handleUserToggle(user)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </Button>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </form>
                </View>
            </View>
        )
    }

    // Edit Group Form Component
    const EditGroupForm = ({
        group,
        onSave,
        onCancel,
    }: { group: Group; onSave: (group: Group) => void; onCancel: () => void }) => {
        const [formData, setFormData] = useState({
            name: group.name,
            description: "",
        })
        const [selectedUsers, setSelectedUsers] = useState<Contact[]>([])
        const [showUserSelection, setShowUserSelection] = useState(false)

        const handleUserToggle = (contact: Contact) => {
            setSelectedUsers((prev) => {
                const isSelected = prev.some((user) => user.id === contact.id)
                if (isSelected) {
                    return prev.filter((user) => user.id !== contact.id)
                } else {
                    return [...prev, contact]
                }
            })
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const updatedGroup: Group = {
                ...group,
                name: formData.name,
                memberCount: selectedUsers.length + 1, // +1 for current user
            }
            onSave(updatedGroup)
        }

        if (showUserSelection) {
            return (
                <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                    <View className="flex items-center gap-3 p-4 border-b">
                        <Button variant="ghost" size="sm" onPress={() => setShowUserSelection(false)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Text className="text-lg font-semibold">Manage Users</Text>
                        <Button
                            onPress={() => setShowUserSelection(false)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white ml-auto"
                        >
                            Done ({selectedUsers.length})
                        </Button>
                    </View>

                    <View className="flex-1 overflow-y-auto">
                        {contacts.map((contact) => {
                            const isSelected = selectedUsers.some((user) => user.id === contact.id)
                            return (
                                <View
                                    key={contact.id}
                                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                        }`}
                                    onPress={() => handleUserToggle(contact)}
                                >
                                    <View className="relative">
                                        <Image
                                            src={contact.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                            alt={contact.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        {isSelected && (
                                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <Path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </Svg>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-medium text-sm ${isSelected ? "text-blue-700" : ""}`}>{contact.name}</Text>
                                        <View className="text-xs text-gray-500">
                                            <View>{contact.email}</View>
                                            <View>{contact.phone}</View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </View>
            )
        }

        return (
            <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                <View className="flex items-center gap-3 p-4 border-b">
                    <Button variant="ghost" size="sm" onPress={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Text className="text-lg font-semibold">Edit Group</Text>
                    <Button onPress={handleSubmit} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white ml-auto">
                        Save
                    </Button>
                </View>

                <View className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full"
                                placeholder="Enter group name"
                                required
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                                rows={3}
                                placeholder="Enter group description"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manage Users</label>
                            <Button
                                variant="outline"
                                onPress={() => setShowUserSelection(true)}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <UsersIcon className="h-4 w-4" />
                                Manage Users ({selectedUsers.length} selected)
                            </Button>
                        </View>

                        {selectedUsers.length > 0 && (
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Users:</label>
                                <View className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedUsers.map((user) => (
                                        <View key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                            <Image src={user.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
                                            <Text className="text-sm flex-1">{user.name}</Text>
                                            <Button
                                                onPress={() => handleUserToggle(user)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </Button>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </form>
                </View>
            </View>
        )
    }

    // Edit Contact Form Component
    const EditContactForm = ({
        contact,
        onSave,
        onCancel,
    }: { contact: Contact; onSave: (contact: Contact) => void; onCancel: () => void }) => {
        const [formData, setFormData] = useState({
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            company: contact.company || "",
            mobile: contact.mobile || "",
            email: contact.email || "",
            address1: contact.address1 || "",
            address2: contact.address2 || "",
            city: contact.city || "",
            state: contact.state || "",
            zip: contact.zip || "",
            country: contact.country || "",
        })

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const updatedContact: Contact = {
                ...contact,
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
                mobile: formData.mobile,
                email: formData.email,
                address1: formData.address1,
                address2: formData.address2,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: formData.country,
                name: `${formData.firstName} ${formData.lastName}`.trim() || "New Contact",
                avatar: `https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=40&width=40&text=${(formData.firstName?.[0] || "N") + (formData.lastName?.[0] || "C")}`,
            }
            onSave(updatedContact)
        }

        return (
            <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                <View className="flex items-center gap-3 p-4 border-b">
                    <Button variant="ghost" size="sm" onPress={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Text className="text-lg font-semibold">Edit Contact</Text>
                    <Button onPress={handleSubmit} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white ml-auto">
                        Save
                    </Button>
                </View>

                <View className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <Input
                                    value={formData.firstName || ""}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <Input
                                    value={formData.lastName || ""}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <Input
                                value={formData.company || ""}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <Input
                                value={formData.mobile || ""}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 1</label>
                            <Input
                                value={formData.address1 || ""}
                                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                            <Input
                                value={formData.address2 || ""}
                                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                                className="w-full"
                            />
                        </View>

                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <Input
                                    value={formData.city || ""}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <Input
                                    value={formData.state || ""}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>

                        <View className="grid grid-cols-2 gap-4">
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                                <Input
                                    value={formData.zip || ""}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                            <View>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <Input
                                    value={formData.country || ""}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full"
                                />
                            </View>
                        </View>
                    </form>
                </View>
            </View>
        )
    }

    if (showAddContactForm) {
        return <AddContactForm onSave={handleSaveNewContact} onCancel={() => setShowAddContactForm(false)} />
    }

    if (showAddGroupForm) {
        return <AddGroupForm onSave={handleSaveNewGroup} onCancel={() => setShowAddGroupForm(false)} />
    }

    if (showEditGroupForm && editingGroup) {
        return (
            <EditGroupForm
                group={editingGroup}
                onSave={handleSaveGroup}
                onCancel={() => {
                    setShowEditGroupForm(false)
                    setEditingGroup(null)
                }}
            />
        )
    }

    if (showEditForm && editingContact) {
        return (
            <EditContactForm
                contact={editingContact}
                onSave={handleSaveContact}
                onCancel={() => {
                    setShowEditForm(false)
                    setEditingContact(null)
                }}
            />
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
            <View className="flex flex-col h-full bg-white max-w-sm mx-auto">
                <View className="flex items-center gap-3 p-4 border-b">
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-left">{getHeaderTitle()}</Text>
                        {selectedItems.length > 0 && (
                            <View className="text-sm text-gray-600 text-left">
                                <P>
                                    {selectedContactsCount > 0 && `${selectedContactsCount} contacts`}
                                    {selectedContactsCount > 0 && selectedGroupsCount > 0 && ", "}
                                    {selectedGroupsCount > 0 && `${selectedGroupsCount} groups`}
                                </P>
                                {actionType !== "add" && <P className="text-xs text-gray-500">Total users: {totalUserCount}</P>}
                            </View>
                        )}
                    </View>
                    <View className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                                setShowContacts(false)
                                setSelectedItems([])
                                setContactSearchQuery("")
                                setContactViewType("contacts")
                            }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        {selectedItems.length > 0 && (
                            <Button onPress={handleSendToItems} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                {getButtonText()}
                            </Button>
                        )}
                    </View>
                </View>

                <View className="p-3 border-b bg-gray-50">
                    <View className="flex gap-2 mb-3">
                        <Button
                            variant={contactViewType === "contacts" ? "default" : "outline"}
                            size="sm"
                            onPress={() => {
                                setContactViewType("contacts")
                                setContactSearchQuery("")
                            }}
                            className="flex items-center gap-1 h-8 px-3 text-xs"
                        >
                            <User className="h-3 w-3" />
                            Contacts
                            {selectedContactsCount > 0 && (
                                <Text className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                                    {selectedContactsCount}
                                </Text>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onPress={handleAddNewContact}
                            className="flex items-center gap-1 h-8 px-2 text-xs bg-transparent"
                        >
                            <UserPlus className="h-3 w-3" />
                        </Button>
                        <Button
                            variant={contactViewType === "groups" ? "default" : "outline"}
                            size="sm"
                            onPress={() => {
                                setContactViewType("groups")
                                setContactSearchQuery("")
                            }}
                            className="flex items-center gap-1 h-8 px-3 text-xs"
                        >
                            <UsersIcon className="h-3 w-3" />
                            Groups
                            {selectedGroupsCount > 0 && (
                                <Text className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                                    {selectedGroupsCount}
                                </Text>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onPress={handleAddNewGroup}
                            className="flex items-center gap-1 h-8 px-2 text-xs bg-transparent"
                        >
                            <UsersIcon className="h-3 w-3" />
                        </Button>
                    </View>
                    <View className="relative">
                        <Input
                            placeholder={`Search ${contactViewType}...`}
                            value={contactSearchQuery}
                            onChange={(e) => setContactSearchQuery(e.target.value)}
                            className="pr-10 w-full border border-gray-300 rounded-md px-4 text-sm"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </View>
                </View>

                <View className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {filteredCurrentList.map((item) => {
                        const isSelected = selectedItems.some((selectedItem) => selectedItem.id === item.id)
                        return (
                            <View
                                key={item.id}
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                    }`}
                            // onPress={() => handleItemToggle(item)}
                            >
                                <View className="relative">
                                    <Image src={item.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"} alt={item.name} className="w-10 h-10 rounded-full" />
                                    {isSelected && (
                                        <View className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <Path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </Svg>
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <View className="flex items-center justify-between">
                                        <Text className={`font-medium text-sm ${isSelected ? "text-blue-700" : ""}`}>{item.name}</Text>
                                        {item.type === "contact" && actionType === "add" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onPress={(e) => {
                                                    e.stopPropagation()
                                                    handleEditContact(item as Contact)
                                                }}
                                                className="p-1 h-6 w-6"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        )}
                                        {item.type === "group" && actionType === "add" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onPress={(e) => {
                                                    e.stopPropagation()
                                                    handleEditGroup(item as Group)
                                                }}
                                                className="p-1 h-6 w-6"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </View>
                                    {item.type === "contact" && (
                                        <View className="text-xs text-gray-500">
                                            <View>{(item as Contact).email}</View>
                                            <View>{(item as Contact).phone}</View>
                                        </View>
                                    )}
                                    {item.type === "group" && (
                                        <P className="text-xs text-gray-500">{(item as Group).memberCount} members</P>
                                    )}
                                </View>
                            </View>
                        )
                    })}
                </View>
            </View>
        )
    }

    if (!selectedChat) {
        return (
            <View className="flex flex-col h-full w-full bg-white md:max-w-sm mx-auto">
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
                </View> */}

                <View className="p-3 border-b">
                    <View className="relative">
                        <Input
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className={`pl-8 pr-8 h-12 text-base `}
                        />
                        <View className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8">
                            <Text>
                                <LucideIcon name="Search" size={22} />
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView className="flex-1">
                    {filteredChats.map((chat) => (
                        <PressableCard
                            key={chat.id}
                            className="flex flex-col mb-1 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            onPress={() => setSelectedChat(chat.id)}
                        >
                            <View className="flex flex-row items-start justify-between mb-3">
                                <View className="flex flex-col">
                                    <Avatar alt={chat.name} className="size-10 rounded-full mb-2">
                                        <AvatarImage
                                            source={{
                                                uri: chat.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                                            }}
                                        />
                                        <AvatarFallback>
                                            <Text>{(chat.name || "fname")?.slice(0, 2)}</Text>
                                        </AvatarFallback>
                                    </Avatar>
                                    <View>
                                        <Text className="font-medium text-lg text-primary">{chat.name}</Text>
                                        <Text className="text-sm text-primary"> 20 Jan 2025, {chat.timestamp} </Text>
                                    </View>
                                </View>
                                <View className="flex flex-col items-end gap-1">
                                    <Text className="font-medium text-lg text-primary/40">•</Text>
                                </View>
                            </View>

                            {/* Message Content */}
                            <View className="ml-0 mb-2">
                                <P className="text-sm text-gray-800 leading-normal">{chat.lastMessage}</P>
                                {chat.isGroup && <P className="text-xs text-gray-500 mt-1">{chat.memberCount} members</P>}
                            </View>

                            {/* Action Buttons */}
                            <View className="flex flex-row items-center gap-4 ml-0 text-sm text-gray-400">
                                <Button
                                    className="hover:text-gray-600"
                                    size="icon"
                                    variant="ghost"
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(chat.lastMessage)
                                    }}
                                >
                                    <LucideIcon className="size-5 android:size-7 text-primary/35" name="MessagesSquare" size={22} />
                                </Button>
                                <Button
                                    className={`hover:text-gray-600 ${chat.isFavorite ? "text-yellow-500" : ""}`}
                                    size="icon"
                                    variant="ghost"
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        toggleChatFavorite(chat.id)
                                    }}
                                >
                                    <LucideIcon className={`size-5 android:size-7 ${chat.isFavorite ? "fill-current text-yellow-500" : "text-primary/35"}`} name="Star" size={22} />
                                </Button>
                                <Button
                                    className={`hover:text-gray-600 ${chat.isImportant ? "text-red-500" : ""}`}
                                    size="icon"
                                    variant="ghost"
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        toggleChatImportant(chat.id)
                                    }}
                                >
                                    <LucideIcon className={`size-5 android:size-7 ${chat.isImportant ? "fill-current text-red-500" : "text-primary/35"}`} name="CirclePlus" size={22} />
                                </Button>
                            </View>
                        </PressableCard>
                    ))}
                </ScrollView>
            </View>
        )
    }

    const currentChat = chats.find((chat) => chat.id === selectedChat)
    const chatMessages = searchQuery ? filteredMessages : messages[selectedChat] || []

    return (
        <View className="flex flex-col h-full w-full bg-white md:max-w-sm mx-auto">
            <View className="flex flex-row items-center gap-3 p-4 border-b bg-gray-50">
                <View className="flex flex-row space-x-2">
                    <Button variant="ghost" size="icon" onPress={() => setSelectedChat(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar alt={currentChat?.name || ""} className="size-11 rounded-full">
                        <AvatarImage
                            source={{
                                uri: currentChat?.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                            }}
                        />
                        <AvatarFallback>
                            <Text>{(currentChat?.name || "fname").slice(0, 2)}</Text>
                        </AvatarFallback>
                    </Avatar>
                </View>
                <View className="flex-1">
                    <View className="flex flex-row items-center gap-2">
                        <H2 className="font-semibold text-primary text-sm">{currentChat?.name}</H2>
                        {currentChat?.isGroup && currentChat.members && (
                            <View className="flex flex-row -space-x-1">
                                {currentChat.members.slice(0, 4).map((member, index) => (
                                    <Image
                                        key={index}
                                        src={member.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                        alt={member.name}
                                        className="w-5 h-5 rounded-full border border-white"
                                    />
                                ))}
                                {currentChat.members.length > 4 && (
                                    <Text className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                        +{currentChat.members.length - 4}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                    {currentChat?.isGroup && <P className="text-xs text-gray-500">{currentChat.memberCount} members</P>}
                </View>
            </View>

            <View className="p-3">
                <View className="relative">
                    <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`pl-8 pr-8 h-12 text-base `}
                    />
                    <View className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8">
                        <Text>
                            <LucideIcon name="Search" size={22} />
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView ref={scrollViewRef} className="flex-1 p-4 space-y-4" showsVerticalScrollIndicator={true}>
                {chatMessages.map((message) => (
                    <View key={message.id} className="flex flex-col mb-6">
                        <View className="flex flex-row items-start justify-between mb-3">
                            <View className="flex flex-col">
                                <Avatar alt={message.sender} className="size-8 android:size-12 rounded-full mb-2">
                                    <AvatarImage
                                        source={{
                                            uri: message.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                                        }}
                                    />
                                    <AvatarFallback>
                                        <Text>{(message.sender || "fname")?.slice(0, 2)}</Text>
                                    </AvatarFallback>
                                </Avatar>
                                <View>
                                    <Text className="font-medium text-lg text-primary">{message.sender}</Text>
                                    <Text className="text-sm text-primary/60">20 Jan 2025, {message.timestamp}</Text>
                                </View>
                            </View>
                            <View className="flex flex-col items-end gap-1">
                                <Text className="text-gray-400">•</Text>
                            </View>
                        </View>

                        {/* Message Content */}
                        <View className="ml-0 mb-4">
                            {/* Regular Message */}
                            {message.content && !message.fileUrl && (
                                <View>
                                    <P className="text-sm text-gray-800 leading-normal">{message.content}</P>
                                    {(() => {
                                        const videoInfo = detectVideoUrl(message.content)
                                        if (videoInfo) {
                                            return (
                                                <View className="mt-2 w-full">
                                                    {videoInfo.type === "youtube" && (
                                                        <iframe
                                                            width="100%"
                                                            height="200"
                                                            src={`https://www.youtube.com/embed/${videoInfo.id}`}
                                                            frameBorder="0"
                                                            allowFullScreen
                                                            className="rounded-md"
                                                        />
                                                    )}
                                                    {videoInfo.type === "vimeo" && (
                                                        <iframe
                                                            width="100%"
                                                            height="200"
                                                            src={`https://player.vimeo.com/video/${videoInfo.id}`}
                                                            frameBorder="0"
                                                            allowFullScreen
                                                            className="rounded-md"
                                                        />
                                                    )}
                                                    {videoInfo.type === "direct" && (
                                                        <video width="100%" height="200" controls className="rounded-md">
                                                            <source src={videoInfo.url} />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                </View>
                                            )
                                        }
                                        return null
                                    })()}
                                </View>
                            )}

                            {/* File Display */}
                            {message.fileUrl && (
                                <View>
                                    {message.fileType === "multiple" ? (
                                        <View className="w-full">
                                            <View className="text-left space-y-2">
                                                {JSON.parse(message.fileName || "[]").map((file: any, index: number) => (
                                                    <View key={index}>
                                                        {file.type.startsWith("audio/") ? (
                                                            <View className="flex items-center justify-between p-3 bg-gray-100 rounded-md w-full">
                                                                <View className="flex-1 min-w-0 pr-3">
                                                                    <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                    <View className="text-sm text-gray-500">
                                                                        {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                    </View>
                                                                </View>
                                                                <View className="flex items-center gap-3 flex-shrink-0">
                                                                    <Button
                                                                        onPress={() => {
                                                                            try {
                                                                                const audio = new Audio(file.url)
                                                                                audio.play().catch((error) => {
                                                                                    console.error("Error playing audio:", error)
                                                                                })
                                                                            } catch (error) {
                                                                                console.error("Error creating audio:", error)
                                                                            }
                                                                        }}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                                            <Path d="M8 5v14l11-7z" />
                                                                        </Svg>
                                                                    </Button>
                                                                    <Button
                                                                        onPress={() => {
                                                                            const link = document.createElement("a")
                                                                            link.href = file.url
                                                                            link.download = file.name
                                                                            link.click()
                                                                        }}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </View>
                                                            </View>
                                                        ) : file.type.startsWith("image/") ? (
                                                            <View className="w-full mb-2">
                                                                <Image
                                                                    src={file.url || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                                                    alt={file.name}
                                                                    className="w-full h-auto rounded-md max-h-64 object-cover mb-2"
                                                                />
                                                                <View className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                                                    <View className="flex-1 min-w-0 pr-3">
                                                                        <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                        <View className="text-sm text-gray-500">
                                                                            {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                        </View>
                                                                    </View>
                                                                    <View className="flex items-center gap-3 flex-shrink-0">
                                                                        <Button
                                                                            onPress={() => window.open(file.url, "_blank")}
                                                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            onPress={() => {
                                                                                const link = document.createElement("a")
                                                                                link.href = file.url
                                                                                link.download = file.name
                                                                                link.click()
                                                                            }}
                                                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            <View className="flex items-center justify-between p-3 bg-gray-100 rounded-md w-full">
                                                                <View className="flex-1 min-w-0 pr-3">
                                                                    <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                    <View className="text-sm text-gray-500">
                                                                        {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                    </View>
                                                                </View>
                                                                <View className="flex items-center gap-3 flex-shrink-0">
                                                                    <Button
                                                                        onPress={() => window.open(file.url, "_blank")}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        onPress={() => {
                                                                            const link = document.createElement("a")
                                                                            link.href = file.url
                                                                            link.download = file.name
                                                                            link.click()
                                                                        }}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ) : message.fileType?.startsWith("audio/") ? (
                                        <View className="max-w-xs">
                                            <View className="text-left">
                                                <View className="text-sm font-normal text-primary mb-2">{message.fileName}</View>
                                                <View className="flex items-center gap-3">
                                                    <Button
                                                        onPress={() => {
                                                            try {
                                                                if (message.fileUrl) {
                                                                    const audio = new Audio(message.fileUrl)
                                                                    audio.play().catch((error) => {
                                                                        console.error("Error playing audio:", error)
                                                                    })
                                                                }
                                                            } catch (error) {
                                                                console.error("Error creating audio:", error)
                                                            }
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <Path d="M8 5v14l11-7z" />
                                                        </Svg>
                                                    </Button>
                                                    <Button
                                                        onPress={() => {
                                                            const link = document.createElement("a")
                                                            link.href = message.fileUrl!
                                                            link.download = message.fileName!
                                                            link.click()
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    ) : message.fileType?.startsWith("image/") ? (
                                        <View className="w-full">
                                            <Image
                                                src={message.fileUrl || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                                alt={message.fileName}
                                                className="w-full h-auto rounded-md max-h-64 object-cover mb-2"
                                            />
                                            <View className="text-left">
                                                <View className="text-sm font-medium text-primary mb-2">{message.fileName}</View>
                                                <View className="flex items-center gap-3">
                                                    <Button
                                                        onPress={() => window.open(message.fileUrl, "_blank")}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onPress={() => {
                                                            const link = document.createElement("a")
                                                            link.href = message.fileUrl!
                                                            link.download = message.fileName!
                                                            link.click()
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="max-w-xs">
                                            <View className="text-left">
                                                <View className="text-sm font-normal text-primary mb-2">{message.fileName}</View>
                                                <View className="flex items-center gap-3">
                                                    <Button
                                                        onPress={() => {
                                                            if (message.fileUrl) {
                                                                window.open(message.fileUrl, "_blank")
                                                            }
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onPress={() => {
                                                            const link = document.createElement("a")
                                                            link.href = message.fileUrl!
                                                            link.download = message.fileName!
                                                            link.click()
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Product Cards Display */}
                            {message.messageType === "products" && message.products && (
                                <View className="ml-0 mb-4">
                                    <View className="grid gap-4">
                                        {message.products.map((product) => (
                                            //   <ProductCard
                                            //     key={product.id}
                                            //     product={product}
                                            //     onAddToCart={handleAddToCart}
                                            //     onViewDetails={handleViewProductDetails}
                                            //     onToggleWishlist={handleToggleWishlist}
                                            //     isInWishlist={wishlist.includes(product.id)}
                                            //   />
                                            <Text>produccts</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {selectedChat && conversationalForms[selectedChat] && (
                            <View className="ml-0 mb-4">
                                {/* <ConversationalForm
                                    form={conversationalForms[selectedChat].form}
                                    currentFieldIndex={conversationalForms[selectedChat].currentFieldIndex}
                                    responses={conversationalForms[selectedChat].responses}
                                    onFieldSubmit={(fieldId, value, isComplete) =>
                                        handleFieldSubmit(selectedChat, fieldId, value, isComplete)
                                    }
                                    onCancel={() => {
                                        setConversationalForms((prev) => {
                                        const newForms = { ...prev }
                                        delete newForms[selectedChat]
                                        return newForms
                                        })
                                    }}
                                    /> */}
                                <Text>ConversationalForm</Text>
                            </View>
                        )}

                        {/* Quick Replies */}
                        {message.sender !== "You" && (selectedChat === "4" || selectedChat === "5") && (
                            <View className="ml-0 mb-4">
                                <View className="flex flex-row flex-wrap gap-2">
                                    {selectedChat === "4"
                                        ? ["Ask question", "Contact form", "Support hours", "Help"].map((reply) => (
                                            <Button
                                                key={reply}
                                                variant="outline"
                                                size="sm"
                                                onPress={() => handleQuickReply(reply, selectedChat)}
                                                className="text-xs px-3 py-1 h-auto bg-white hover:bg-gray-50 border-gray-300"
                                            >
                                                <Text className="text-primary/70">{reply}</Text>
                                            </Button>
                                        ))
                                        : ["Show products", "Browse electronics", "View cart", "Help"].map((reply) => (
                                            <Button
                                                key={reply}
                                                variant="outline"
                                                size="sm"
                                                onPress={() => handleQuickReply(reply, selectedChat)}
                                                className="text-xs px-3 py-1 h-auto bg-white hover:bg-gray-50 border-gray-300"
                                            >
                                                <Text className="text-primary/70">{reply}</Text>
                                            </Button>
                                        ))}
                                </View>
                            </View>
                        )}

                        {/* Action Buttons - back outside message box */}
                        <View className="flex flex-row items-center gap-4 ml-0 text-sm text-gray-400">
                            <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("copy", message)}>
                                <LucideIcon className="size-4 android:size-7 text-primary/35" name="MessagesSquare" size={22} />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("reply", message)}>
                                <LucideIcon className="size-4 android:size-7 text-primary/35" name="Reply" size={22} />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("forward", message)}>
                                <LucideIcon className="size-4 android:size-7 text-primary/35" name="Forward" size={22} />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                className={`hover:text-gray-600 ${message.isFavorite ? "text-yellow-500" : ""}`}
                                onPress={() => toggleFavorite(message.id)}
                            >
                                <LucideIcon className="size-4 android:size-7 text-primary/35" name="Star" size={22} />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                className={`hover:text-gray-600 ${message.isImportant ? "text-red-500" : ""}`}
                                onPress={() => toggleImportant(message.id)}
                            >
                                <LucideIcon className="size-4 android:size-7 text-primary/35" name="CirclePlus" size={22} />
                            </Button>
                        </View>
                    </View>
                ))}
                <View ref={messagesEndRef} />
            </ScrollView>

            <View className="p-3">
                {/* Staged Files Preview */}
                {stagedFiles.length > 0 && (
                    <View className="mb-3 p-2 bg-gray-50 rounded-md">
                        <View className="text-xs text-gray-600 mb-2">Files to send:</View>
                        <View className="space-y-1">
                            {stagedFiles.map((file, index) => (
                                <View key={index} className="flex items-center justify-between text-sm">
                                    <Text className="text-gray-700 truncate">{file.name}</Text>
                                    <Button
                                        onPress={() => setStagedFiles((prev) => prev.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        ×
                                    </Button>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View className="relative">
                    <DropdownMenu className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <MoreVertical className="h-3 w-3 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            insets={contentInsets}
                            className="w-64 native:w-72"
                        >
                            <DropdownMenuItem>
                                <ImageIcon className="h-4 w-4" />
                                <Text>Send Images</Text>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files)}
                                />
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Paperclip className="h-4 w-4" />
                                <Text>Files Message</Text>
                                <Input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
                            </DropdownMenuItem>
                            <DropdownMenuItem onPress={() => {
                                // Create a mock audio file for voice message
                                const audioBlob = new Blob(["mock audio data"], { type: "audio/wav" })
                                const audioFile = new File([audioBlob], "voice_message.wav", { type: "audio/wav" })
                                setStagedFiles((prev) => [...prev, audioFile])
                                setShowMenu(false)
                            }}>
                                <Mic className="h-4 w-4" />
                                <Text>Voice Message</Text>
                            </DropdownMenuItem>
                            <DropdownMenuItem onPress={() => {
                                setNewMessage(newMessage + "😊")
                                setShowMenu(false)
                            }}>
                                <Smile className="h-4 w-4" />
                                <Text>Emoji</Text>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Send button on the right inside text box */}
                    <View className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                        <Button
                            onPress={handleSendMessage}
                            variant={!newMessage.trim() && stagedFiles.length === 0 ? "secondary" : "default"}
                            disabled={!newMessage.trim() && stagedFiles.length === 0}
                            size="icon"
                            className="p-1.5 size-8 android:size-10 rounded-lg"
                        >
                            <LucideIcon className={`size-4 android:size-7 ${!newMessage.trim() && stagedFiles.length === 0 ? "text-primary" : "text-primary-foreground"}`} name="SendHorizontal" size={22} />
                        </Button>
                    </View>

                    <Input
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        className="w-full border border-gray-300 rounded-md pl-10 pr-10 text-sm"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                    />
                </View>
            </View>
        </View>
    )
}
