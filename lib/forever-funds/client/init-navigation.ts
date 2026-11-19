import { PAGE_METADATA, PAGE_SLUG_TO_PATH, type ForeverFundsPageSlug } from "../routes";

function pathToSlug(pathname: string): ForeverFundsPageSlug | null {
  if (pathname === "/") return "home";
  const slug = pathname.replace(/^\//, "");
  if (slug in PAGE_SLUG_TO_PATH) return slug as ForeverFundsPageSlug;
  return null;
}

function scrollToAnchor() {
  const raw = decodeURIComponent(window.location.hash.slice(1));
  if (!raw) return;
  const parts = raw.split("--");
  const anchor = parts.length > 1 ? parts.slice(1).join("--") : raw;
  const tryIds = [anchor, ...parts.slice(1)];
  for (const id of tryIds) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
}

function markCurrentNav() {
  const pathname = window.location.pathname;
  document.querySelectorAll(".main-nav a[href]").forEach((node) => {
    if (!(node instanceof HTMLAnchorElement)) return;
    const href = node.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
    const path = href.split("#")[0] || "/";
    const isCurrent = path === pathname || (path === "/" && pathname === "/");
    if (isCurrent) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
  const slug = pathToSlug(pathname);
  if (slug) {
    const meta = PAGE_METADATA[slug];
    document.title = slug === "home" ? meta.title : `${meta.title} | Forever Funds`;
  }
}

export function initSiteNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  function closeDropdowns(except: Element | null = null) {
    document.querySelectorAll(".nav-group").forEach((g) => {
      if (g !== except) {
        g.classList.remove("open");
        g.querySelector(":scope > button")?.setAttribute("aria-expanded", "false");
      }
    });
  }

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) closeDropdowns();
  });

  document.querySelectorAll(".nav-group>button").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const g = btn.parentElement;
      if (!g) return;
      const opening = !g.classList.contains("open");
      closeDropdowns(g);
      g.classList.toggle("open", opening);
      btn.setAttribute("aria-expanded", String(opening));
    });
  });

  document.addEventListener("click", (ev) => {
    if (!(ev.target instanceof Element) || !ev.target.closest(".main-nav")) closeDropdowns();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      closeDropdowns();
      nav?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  document.querySelectorAll(".dropdown a").forEach((a) => {
    a.addEventListener("click", () => {
      closeDropdowns();
      nav?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  markCurrentNav();
  scrollToAnchor();
  window.addEventListener("hashchange", scrollToAnchor);
}

export function refreshSiteNavigation() {
  markCurrentNav();
  scrollToAnchor();
}