import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { SearchProvider } from "@/context/search-context";
import { cn } from "@/lib/utils";
import { NotificationManager } from "@/components/notification-manager";
import { ExpoNotificationManagerWrapper } from "@/components/ExpoNotificationManagerWrapper";
import { DialogModel } from "@/components/modal/global-model";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Morr Appz",
    default: "Morr Appz",
  },
  description: "created by morr",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale || "en"} suppressHydrationWarning>
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={[
              "light",
              "dark",
              "zinc",
              "blue",
              "green",
              "violet",
              "neo",
              "bubble",
            ]}
          >
            <SearchProvider>
              <SessionProvider>
                <NextTopLoader />
                <NotificationManager />
                <ExpoNotificationManagerWrapper />
                {children}
              </SessionProvider>
            </SearchProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster richColors />
        <DialogModel />
      </body>
    </html>
  );
}
