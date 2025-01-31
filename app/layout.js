import localFont from "next/font/local";
import "./globals.css";
import AuthButton from "@/components/header";
import { createClient } from '@/utils/supabase/server'
import Link from "next/link";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-6 bg-black text-white`}
      >
        <div>
          <header className="flex items-center justify-between border-b border-b-foreground/10 mb-5 h-24 px-6">
            <div className="text-2xl font-bold">
              <Link href="/">IRIS</Link>
            </div>
            {data.user &&
              < nav className="flex space-x-8">
                <Link href="/dashboard" className="hover:text-gray-300 text-xl font-bold">
                  Dashboard
                </Link>
                {/* <a href="/dashboard/settings" className="hover:text-gray-300 text-xl font-bold">
                  Settings
                </a> */}
                <Link href="/dashboard/authenticate" className="hover:text-gray-300 text-xl font-bold">
                  Authenticate
                </Link>
                <Link href="/dashboard/documentation" className="hover:text-gray-300 text-xl font-bold">
                  How To
                </Link>
              </nav>
            }
            <AuthButton />
          </header>
          {children}
        </div>
      </body>
    </html >
  );
}
