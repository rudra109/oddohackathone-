import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Procurement ERP",
  description: "Vendor Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AppProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
