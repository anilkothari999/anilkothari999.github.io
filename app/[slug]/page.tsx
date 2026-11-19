import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageMain } from "@/components/forever-funds/PageMain";
import {
  FOREVER_FUNDS_PAGES,
  PAGE_METADATA,
  type ForeverFundsPageSlug,
} from "@/lib/forever-funds/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function isForeverFundsSlug(slug: string): slug is ForeverFundsPageSlug {
  return (FOREVER_FUNDS_PAGES as readonly string[]).includes(slug) && slug !== "home";
}

export function generateStaticParams() {
  return FOREVER_FUNDS_PAGES.filter((slug) => slug !== "home").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isForeverFundsSlug(slug)) return {};
  const meta = PAGE_METADATA[slug];
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function ForeverFundsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isForeverFundsSlug(slug)) notFound();
  return <PageMain slug={slug} />;
}