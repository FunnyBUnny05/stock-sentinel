
import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google"; // Added JetBrains Mono
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" }); // Configure Mono

export const metadata: Metadata = {
    title: "Stock Sentinel",
    description: "Institutional AI Stock Analysis",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${orbitron.variable} ${mono.variable} font-sans antialiased min-h-screen bg-grid selection:bg-blue-500/30 selection:text-blue-200 pt-14`}>
                {children}
            </body>
        </html>
    );
}
