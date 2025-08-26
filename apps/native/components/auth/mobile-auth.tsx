'use dom';
import '../../global.css';

import { useState } from "react"
import { Button } from "@/components/primitives/button"
import { Input } from "@/components/primitives/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/primitives/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitives/tabs"
import { Label } from "@/components/primitives/label"
import { Badge } from "@/components/primitives/badge"
import { Separator } from "@/components/primitives/separator"
import {
    MessageCircle,
    Phone,
    User as UserIcon,
    Mail,
    Shield,
    CheckCircle,
    ArrowRight,
    Loader2,
    ArrowLeft,
    RefreshCw,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/primitives/select"
import { Session, User, WeakPassword } from '@supabase/supabase-js';

export default function MobileAuth({ navigate, signIn, toast, verifySendOtp, verifyOtp }: {
    dom: import('expo/dom').DOMProps;
    navigate: (path: string) => void;
    signIn: (email: string, password: string) => Promise<{
        user: User;
        session: Session;
        weakPassword?: WeakPassword;
    } | boolean>;
    toast: (message: string, variant?: string, options?: Record<string, any> | undefined) => void;
    verifySendOtp: (user_email: string, user_phone: string, register?: boolean) => Promise<boolean>;
    verifyOtp: (otp: string, user_email: string, user_phone: string, password: string, name: string, register?: boolean) => Promise<boolean>
}) {

    const [activeTab, setActiveTab] = useState("signin")
    const [step, setStep] = useState<"form" | "otp">("form")
    const [loading, setLoading] = useState(false)

    // Form data
    const [mobile, setMobile] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [emailOtp, setEmailOtp] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [otp, setOtp] = useState("")
    const [countdown, setCountdown] = useState(0)

    const [clickedSubmit, setClickedSubmit] = useState(false)

    // Add after existing state declarations
    const [selectedCountry, setSelectedCountry] = useState({
        code: "+1-United States",
        flag: "🇺🇸",
        name: "United States",
        digits: 10,
    })

    // Country data
    const countries = [
        { code: "+1", flag: "🇺🇸", name: "United States", digits: 10 },
        { code: "+1", flag: "🇨🇦", name: "Canada", digits: 10 },
        { code: "+44", flag: "🇬🇧", name: "United Kingdom", digits: 10 },
        { code: "+91", flag: "🇮🇳", name: "India", digits: 10 },
        { code: "+86", flag: "🇨🇳", name: "China", digits: 11 },
        { code: "+81", flag: "🇯🇵", name: "Japan", digits: 10 },
        { code: "+49", flag: "🇩🇪", name: "Germany", digits: 11 },
        { code: "+33", flag: "🇫🇷", name: "France", digits: 10 },
        { code: "+39", flag: "🇮🇹", name: "Italy", digits: 10 },
        { code: "+34", flag: "🇪🇸", name: "Spain", digits: 9 },
        { code: "+61", flag: "🇦🇺", name: "Australia", digits: 9 },
        { code: "+55", flag: "🇧🇷", name: "Brazil", digits: 11 },
        { code: "+7", flag: "🇷🇺", name: "Russia", digits: 10 },
        { code: "+82", flag: "🇰🇷", name: "South Korea", digits: 10 },
        { code: "+65", flag: "🇸🇬", name: "Singapore", digits: 8 },
        { code: "+971", flag: "🇦🇪", name: "UAE", digits: 9 },
        { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", digits: 9 },
        { code: "+27", flag: "🇿🇦", name: "South Africa", digits: 9 },
        { code: "+52", flag: "🇲🇽", name: "Mexico", digits: 10 },
        { code: "+54", flag: "🇦🇷", name: "Argentina", digits: 10 },
    ]

    const formatMobile = (value: string, maxDigits: number) => {
        const digits = value.replace(/\D/g, "").slice(0, maxDigits)
        return digits
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const resetForm = () => {
        setMobile("")
        setName("")
        setEmail("")
        setEmailOtp("")
        setPassword("")
        setOtp("")
        setStep("form")
        setClickedSubmit(false)
        setSelectedCountry({
            code: "+1",
            flag: "🇺🇸",
            name: "United States",
            digits: 10,
        })
    }

    const isMobileInvalid = () => {
        return mobile.length > 0 && mobile.length !== selectedCountry.digits;
    }

    const isPasswordInvalid = () => {
        return password.length < 8;
    }

    const canSendOTP = () => {
        if (activeTab === "signin") {
            return emailOtp.trim() && validateEmail(emailOtp)
        } else {
            return name.trim() && email.trim() && validateEmail(email) && !isPasswordInvalid()
        }
    }

    const canSignInWithPassword = () => {
        return email.trim() && validateEmail(email) && password.trim().length >= 6
    }

    const sendOTP = async (register: boolean = true) => {
        if (!canSendOTP()) return
        setClickedSubmit(true)

        setLoading(true)
        const result = await verifySendOtp(email || emailOtp, mobile, register);

        if (!result) {
            setLoading(false)
            return
        }

        setStep("otp")
        setCountdown(60)
        setLoading(false)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const signInWithPassword = async () => {
        if (!canSignInWithPassword()) return

        setLoading(true)

        const result = await signIn(email, password)

        if (result && typeof result === "object" && "user" in result && result.user.id) {
            console.log("loged in")
        } else {
            toast("Invalid credentials. Use password: password123 for demo", "error")
        }
        setLoading(false)
    }

    const submitVerifyOTP = async () => {

        setLoading(true)
        const result = await verifyOtp(otp, email || emailOtp, mobile, password, name, activeTab === "signin" ? false : true)
        if (result) {

        }

        setLoading(false)
    }

    const goBack = () => {
        setStep("form")
        setOtp("")
    }

    // Add this function to validate the signup form
    const validateSignupForm = () => {
        if (!name.trim()) {
            toast("Please enter your full name", "error")
            return false
        }
        if (!email.trim() || !validateEmail(email)) {
            toast("Please enter a valid email address", "error")
            return false
        }
        if (isPasswordInvalid()) {
            toast("Password must be at least 8 characters", "error")
            return false
        }
        return true
    }

    if (step === "otp") {
        return (
            <div className="w-full min-h-screen bg-background p-4 flex items-center justify-center">
                <div className="w-full max-w-sm">
                    <Card className="w-full shadow-lg">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" size="icon" onClick={goBack}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="w-10" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Enter OTP</CardTitle>
                                <CardDescription className="mt-2">
                                    {/* Code sent to {mobile} */}
                                    {/* {activeTab === "signup" && email && (
                                        <>
                                            <br />
                                            and {email}
                                        </>
                                    )} */}
                                    Code sent to {email || emailOtp}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Verification Code</Label>
                                <Input
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="text-center text-2xl tracking-widest font-mono h-14"
                                    maxLength={6}
                                />
                            </div>

                            <Button onClick={submitVerifyOTP} disabled={otp.length !== 6 || loading} className="w-full h-12">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {activeTab === "signup" ? "Create Account" : "Sign In"}
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-sm text-muted-foreground">Resend in {countdown}s</p>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={() => sendOTP(false)}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend OTP
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-background p-4 flex items-center justify-center">
            <div className="w-full max-w-sm">
                <Card className="w-full shadow-lg">
                    <CardHeader className="text-center space-y-4">
                        <div className="p-3 bg-card rounded-full mx-auto w-fit">
                            <MessageCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">AI Chat</CardTitle>
                            <CardDescription className="mt-2">
                                {activeTab === "signin" ? "Sign in to your account" : "Create your account to get started"}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                setActiveTab(value)
                                resetForm()
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin" className="space-y-6 mt-6">
                                {/* Email & Password Sign In */}
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`pl-10 pr-10 h-12 text-base ${(clickedSubmit && isPasswordInvalid()) ? 'border-red-500 focus:border-red-500 ring-red-500' : ''}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className={`text-xs mt-1 ${(clickedSubmit && isPasswordInvalid()) ? 'text-red-600' : 'text-muted-foreground'}`}>
                                            {isPasswordInvalid()
                                                ? "Password must be at least 8 characters"
                                                : ""}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={signInWithPassword}
                                        disabled={!canSignInWithPassword() || loading}
                                        className="w-full h-12"
                                        variant="outline"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Sign In with Password
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Separator */}
                                <div className="relative">
                                    <Separator />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
                                    </div>
                                </div>

                                {/* Mobile OTP Sign In */}
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                value={emailOtp}
                                                onChange={(e) => setEmailOtp(e.target.value)}
                                                className="pl-10 h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-card p-3 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">OTP Verification</span>
                                        </div>
                                        <p className="text-xs text-blue-700">We'll send a verification code to your email.</p>
                                    </div>

                                    <Button
                                        onClick={() => sendOTP(false)}
                                        disabled={!canSendOTP() || loading}
                                        className="w-full h-12 bg-transparent"
                                        variant="outline"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Sign In with OTP
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-4 mt-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => {
                                                    // Accept only alphabetic characters and spaces
                                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                                    setName(value);
                                                }}
                                                className="pl-10 h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`pl-10 pr-10 h-12 text-base ${(clickedSubmit && isPasswordInvalid()) ? 'border-red-500 focus:border-red-500 ring-red-500' : ''}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className={`text-xs mt-1 ${(clickedSubmit && isPasswordInvalid()) ? 'text-red-600' : 'text-muted-foreground'}`}>
                                            {isPasswordInvalid()
                                                ? "Password must be at least 8 characters"
                                                : ""}
                                        </p>
                                    </div>

                                    <div className="bg-card p-3 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Create Account</span>
                                        </div>
                                        <p className="text-xs text-green-700">
                                            We'll send an OTP to your email to verify your account.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            if (validateSignupForm()) {
                                                sendOTP()
                                            }
                                        }}
                                        disabled={!canSendOTP() || loading}
                                        className="w-full h-12"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                Create Account & Send OTP
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="text-center">
                            <Badge variant="secondary" className="text-xs">
                                🔒 Secure • Multiple Auth Options • Privacy Protected
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
