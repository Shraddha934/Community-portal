import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Community Portal",
  description: "Manage community issues efficiently",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
    </ClerkProvider>
  );
}
