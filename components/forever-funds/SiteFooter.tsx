import { getFooterHtml } from "@/lib/forever-funds/content";
import { HtmlBlock } from "./HtmlBlock";

export function SiteFooter() {
  return <HtmlBlock html={getFooterHtml()} />;
}