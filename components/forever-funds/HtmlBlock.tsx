type HtmlBlockProps = {
  html: string;
  className?: string;
  "data-page"?: string;
};

export function HtmlBlock({ html, className, "data-page": dataPage }: HtmlBlockProps) {
  return (
    <div
      className={className}
      data-page={dataPage}
      // Trusted static HTML extracted from the legacy single-file site.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}