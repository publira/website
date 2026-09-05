import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  description: "The Open-Source Gateway to Your Digital Publishing Utopia.",
  title: "Publira",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html data-scroll-behavior="smooth" lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
