import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: "IELTSBF",
  description: "Vintage academic IELTS practice platform",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
