import localFont from "next/font/local";
import "./globals.css";
import AuthButton from "@/components/header";
import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react"
import SupabaseProvider from "@/utils/supabase/provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "IRIS",
  description: "Arctech connection application.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-6 bg-white text-black`}
      >
        <div>
          <header className="flex items-center justify-between border-b border-gray-300 mb-5 h-24 px-6">
            <div className="text-3xl font-extrabold">
              <Link href="/">IRIS</Link>
            </div>
            {data.user && (
              <nav className="flex space-x-8">
                <Link href="/dashboard" className="hover:text-gray-700 text-xl font-bold">
                  Dashboard
                </Link>
                <Link href="/dashboard/authenticate" className="hover:text-gray-700 text-xl font-bold">
                  Authenticate
                </Link>
                <Link href="/dashboard/documentation" className="hover:text-gray-700 text-xl font-bold">
                  How To
                </Link>
              </nav>
            )}
            <AuthButton />
          </header>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
