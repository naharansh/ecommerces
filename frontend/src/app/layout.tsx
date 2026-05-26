import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/components/StoreProvider";

export const metadata: Metadata = {
  title: "ShopWave - E-Commerce Platform",
  description: "Your premier destination for quality products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </StoreProvider>
      </body>
    </html>
  );
}
