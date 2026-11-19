/**
 * One-time extractor: anilkothari999.github.io index.html → lib/forever-funds assets
 * Usage: node scripts/extract-from-legacy-html.mjs /path/to/index.html
 */
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/extract-from-legacy-html.mjs <index.html>");
  process.exit(1);
}

const html = fs.readFileSync(input, "utf8");
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "lib", "forever-funds");

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error("No <style> block found");
let css = styleMatch[1];
// Single-page sections are route-scoped in Next.js — always show main content.
css += `
.single-page { display: block !important; }
.single-page .page-hero:first-child { margin-top: 0; }
`;

const SITE_SLUGS = new Set([
  "home",
  "about-us",
  "mutual-funds",
  "sif",
  "pms",
  "fixed-deposit",
  "bonds",
  "54ec-bonds",
  "insurance",
  "other-products",
  "calculators",
  "fees",
  "contact",
  "privacy",
  "terms",
]);

const CALCULATOR_ANCHORS = new Set([
  "sip",
  "goal-sip",
  "smart-goal",
  "inflation",
  "cost-of-delay",
  "retirement",
  "swp",
  "step-up-sip",
  "lumpsum",
  "emi",
]);

function rewriteLinks(fragment) {
  return fragment
    .replace(/forever-funds-logo\.png/g, "/images/forever-funds-logo.png")
    .replace(/href="#([^"]+)"/g, (_, target) => {
      if (target.includes("--")) {
        const [page, ...rest] = target.split("--");
        const anchor = rest.join("--");
        const base = page === "home" ? "/" : `/${page}`;
        return `href="${base}#${anchor}"`;
      }
      if (target === "home") return 'href="/"';
      if (SITE_SLUGS.has(target)) {
        return `href="/${target === "home" ? "" : target}"`.replace('href="//"', 'href="/"');
      }
      if (CALCULATOR_ANCHORS.has(target)) return `href="/calculators#${target}"`;
      return `href="#${target}"`;
    });
}

const headerStart = html.indexOf('<header class="site-header');
const headerEnd = html.indexOf("</header>", headerStart) + "</header>".length;
const footerStart = html.indexOf('<footer class="site-footer');
const footerEnd = html.indexOf("</footer>", footerStart) + "</footer>".length;

const header = rewriteLinks(html.slice(headerStart, headerEnd));
const footer = rewriteLinks(html.slice(footerStart, footerEnd));

const pageOpenRe = /<div class="single-page[^"]*" data-page="([^"]+)"[^>]*>/g;
const opens = [];
let openMatch;
while ((openMatch = pageOpenRe.exec(html)) !== null) {
  opens.push({
    slug: openMatch[1],
    index: openMatch.index,
    contentStart: openMatch.index + openMatch[0].length,
  });
}
const pages = {};
for (let i = 0; i < opens.length; i++) {
  const { slug, index, contentStart } = opens[i];
  const sectionEnd = i + 1 < opens.length ? opens[i + 1].index : footerStart;
  const section = html.slice(index, sectionEnd);
  const closing = section.lastIndexOf("</div>");
  const inner = section.slice(contentStart - index, closing);
  pages[slug] = rewriteLinks(inner.trim());
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, "pages"), { recursive: true });
fs.writeFileSync(path.join(root, "app", "globals.css"), css);
fs.writeFileSync(path.join(outDir, "header.html"), header);
fs.writeFileSync(path.join(outDir, "footer.html"), footer);

const slugs = Object.keys(pages).sort();
for (const slug of slugs) {
  fs.writeFileSync(path.join(outDir, "pages", `${slug}.html`), pages[slug]);
}

const routeMeta = {
  home: {
    title: "Forever Funds by Anil Kothari | Personalised Financial Guidance",
    description:
      "Explore mutual funds, insurance, bonds, retirement planning and financial calculators with Forever Funds by Anil Kothari, Jaipur.",
  },
  "about-us": {
    title: "About Us",
    description: "About Forever Funds by Anil Kothari — personalised financial guidance in Jaipur.",
  },
  "mutual-funds": { title: "Mutual Funds", description: "Learn about mutual fund categories and risks with Forever Funds." },
  sif: { title: "Specialised Investment Fund (SIF)", description: "Understand SIF eligibility, strategy and risks." },
  pms: { title: "Portfolio Management Service (PMS)", description: "PMS overview — fees, risks and suitability." },
  "fixed-deposit": { title: "Fixed Deposits", description: "Fixed deposit information — tenure, issuer and liquidity." },
  bonds: { title: "RBI & Corporate Bonds", description: "Bond investing basics — yield, credit and liquidity risks." },
  "54ec-bonds": { title: "54EC Capital Gains Bonds", description: "Section 54EC bonds — informational overview." },
  insurance: { title: "Insurance", description: "Health, life, motor, travel and other insurance enquiries." },
  "other-products": { title: "Other Products", description: "NPS, stock broking and loan against mutual funds." },
  calculators: { title: "Financial Calculators", description: "SIP, retirement, SWP, EMI and other illustrative calculators." },
  fees: { title: "Fee Structure", description: "How Forever Funds is remunerated — zero professional fees." },
  contact: { title: "Contact Us", description: "Reach Forever Funds by phone, WhatsApp or email in Jaipur." },
  privacy: { title: "Privacy Policy", description: "Privacy notice for Forever Funds enquiry forms." },
  terms: { title: "Terms of Use", description: "Terms of use for Forever Funds website information." },
};

const routesTs = `export const FOREVER_FUNDS_PAGES = ${JSON.stringify(slugs, null, 2)} as const;

export type ForeverFundsPageSlug = (typeof FOREVER_FUNDS_PAGES)[number];

export const PAGE_SLUG_TO_PATH: Record<ForeverFundsPageSlug, string> = {
${slugs
  .map((s) => `  "${s}": ${s === "home" ? '"/"' : `"/${s}"`},`)
  .join("\n")}
};

export const PAGE_METADATA: Record<
  ForeverFundsPageSlug,
  { title: string; description: string }
> = ${JSON.stringify(routeMeta, null, 2)};
`;

fs.writeFileSync(path.join(outDir, "routes.ts"), routesTs);
console.log(`Extracted ${slugs.length} pages, CSS, header, footer → lib/forever-funds`);