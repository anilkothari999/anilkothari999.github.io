import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/forever-funds/SiteHeader";
import { SiteFooter } from "@/components/forever-funds/SiteFooter";
import { ForeverFundsClient } from "@/components/forever-funds/ForeverFundsClient";
import { getForeverFundsConfig } from "@/lib/forever-funds/config";
import { PAGE_METADATA } from "@/lib/forever-funds/routes";

export const metadata: Metadata = {
  title: {
    default: PAGE_METADATA.home.title,
    template: "%s | Forever Funds",
  },
  description: PAGE_METADATA.home.description,
  metadataBase: new URL("https://foreverfunds.in"),
  openGraph: {
    title: "Forever Funds by Anil Kothari",
    description: PAGE_METADATA.home.description,
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#17315f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const config = getForeverFundsConfig();
  return (
    <html lang="en-IN">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ForeverFundsClient config={config} />
      </body>
    </html>
  );
}