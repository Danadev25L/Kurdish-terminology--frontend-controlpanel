import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Zain } from "next/font/google";
import { AuthProvider } from "./providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const zain = Zain({
  variable: "--font-zain",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "KTP Control Panel",
  description: "Kurdish Terminology Portal — Admin & Expert Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} ${zain.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
