import { getHeaderHtml } from "@/lib/forever-funds/content";
import { HtmlBlock } from "./HtmlBlock";

export function SiteHeader() {
  return <HtmlBlock html={getHeaderHtml()} />;
}