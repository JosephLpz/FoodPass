import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScannerProvider } from "@/context/ScannerContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FoodPass - Sistema de Control de Consumo",
  description: "Sistema de control de consumo alimentario mediante código QR para comedores empresariales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ScannerProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ScannerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
