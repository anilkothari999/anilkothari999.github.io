import fs from "node:fs";
import path from "node:path";

const base = path.join(process.cwd(), "lib", "forever-funds");

function readUtf8(...parts: string[]) {
  return fs.readFileSync(path.join(base, ...parts), "utf8");
}

export function getHeaderHtml() {
  return readUtf8("header.html");
}

export function getFooterHtml() {
  return readUtf8("footer.html");
}

export function getPageHtml(slug: string) {
  return readUtf8("pages", `${slug}.html`);
}