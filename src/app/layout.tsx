import type { Metadata, Viewport } from "next";
import { Epilogue, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NoteProvider } from "@/context/NoteContext";
import { Toaster } from "sonner";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voicry",
  description: "Capture fleeting thoughts using voice.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${epilogue.variable} ${geistMono.variable}`}>
      <body
        className="antialiased bg-gray-50"
      >
        <NoteProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "bg-white border border-gray-200 shadow-xl rounded-2xl flex items-center p-4 gap-4 w-full font-sans",
                title: "text-gray-900 font-medium",
                description: "text-gray-500",
                actionButton: "bg-gray-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors",
                cancelButton: "bg-gray-100 text-gray-500",
                success: "border-gray-200",
                error: "border-red-200 bg-red-50 text-red-900"
              }
            }}
          />
        </NoteProvider>
      </body>
    </html>
  );
}
