import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/context/search-context";
import { cn } from "@/lib/utils";
import { DialogModel } from "@/components/modal/global-model";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/context/supabase-provider";

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
        <AuthProvider>
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
                <NextTopLoader />
                {children}
              </SearchProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
          <Toaster richColors />
          <DialogModel />
        </AuthProvider>
      </body>
    </html>
  );
}
