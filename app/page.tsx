import type { Metadata } from "next";
import { PageMain } from "@/components/forever-funds/PageMain";
import { PAGE_METADATA } from "@/lib/forever-funds/routes";

export const metadata: Metadata = {
  title: PAGE_METADATA.home.title.replace(" | Forever Funds", ""),
  description: PAGE_METADATA.home.description,
};

export default function HomePage() {
  return <PageMain slug="home" />;
}