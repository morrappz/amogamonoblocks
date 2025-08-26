import MobileAuth from "@/components/auth/mobile-auth";
import { SafeAreaView } from "@/components/safe-area-view";
import { useAuth } from "@/context/supabase-provider";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import { supabase } from "@/config/supabase";
import { useState } from "react";

export default function App() {
    const router = useRouter()
    const { signIn, setSession } = useAuth();
    const [otpDetails, setOtpDetails] = useState("")

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
            <MobileAuth
                dom={{
                    scrollEnabled: true,
                }}

                navigate={(path: string) => {
                    if (path)
                        router.push(path as any);
                }}

                signIn={async (email: string, password: string) => {
                    return await signIn(email, password)
                }}

                verifySendOtp={async (user_email: string, user_phone: string, register: boolean = true) => {
                    if (register) {
                        const { data, error } = await supabase.rpc("check_user_existence", { user_email, user_phone: "" })
                        console.log("function", data, error)
                        if (error) {
                            toast.error("Error checking user existence")
                            console.error(error.message)
                            return false
                        }

                        if (data !== "USER_DOES_NOT_EXIST") {
                            if (data === user_email) {
                                toast.error("User email exist")
                                return false
                            } else if (data === user_phone) {
                                toast.error("User phone exist")
                                return false
                            }
                        }
                    }

                    const { data: sendOtp, error: sendOtpError } = await supabase.auth.signInWithOtp({
                        email: user_email,
                        options: {
                            shouldCreateUser: register
                        }
                    })
                    if (sendOtpError) {
                        toast.error(sendOtpError?.message || "Error can not send the otp")
                        return false
                    }
                    return true
                }}

                verifyOtp={async (otp: string, user_email: string, user_phone: string, password: string, name: string, register: boolean = true) => {
                    const { data: verifyOtp, error: verifyOtpError } = await supabase.auth.verifyOtp({
                        email: user_email,
                        token: otp,
                        type: "email"
                    })

                    if (verifyOtpError || !verifyOtp.session) {
                        toast.error(verifyOtpError?.message || "Error can verify the otp")
                        return false
                    }

                    if (register) {
                        await supabase.auth.setSession(verifyOtp.session)

                        const { data: updateUser, error: updateUserError } = await supabase.auth.updateUser({
                            phone: user_phone,
                            password: password,
                            data: {
                                full_name: name
                            }
                        })

                        if (updateUserError || !updateUser) {
                            toast.error(updateUserError?.message || "Error can not save user information")
                            return false
                        }
                    }

                    setSession(verifyOtp.session)

                    return true
                }}

                toast={(message: string, variant: string = "default", options: Record<string, any> | undefined = undefined) => {
                    switch (variant) {
                        case "error":
                            toast.error(message, options)
                            break;
                        case "success":
                            toast.success(message, options)
                            break;
                        case "warning":
                            toast.warning(message, options)
                            break;
                        default:
                            toast(message, options)
                    }
                }}
            />
        </SafeAreaView>
    );
}
