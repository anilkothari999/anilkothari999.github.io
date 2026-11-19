import { getPageHtml } from "@/lib/forever-funds/content";
import type { ForeverFundsPageSlug } from "@/lib/forever-funds/routes";
import { HtmlBlock } from "./HtmlBlock";

type PageMainProps = {
  slug: ForeverFundsPageSlug;
};

export function PageMain({ slug }: PageMainProps) {
  const html = getPageHtml(slug);
  return (
    <main id="main-content">
      <div className="single-page active" data-page={slug} id={`page-${slug}`}>
        <HtmlBlock html={html} />
      </div>
    </main>
  );
}