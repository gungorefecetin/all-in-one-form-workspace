import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import { DndProvider } from "./components/FileManager/DndProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jotflow - The All-in-One Form Workspace",
  description: "Create, manage, and process forms efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DndProvider>
            {children}
          </DndProvider>
        </Providers>
      </body>
    </html>
  );
}
