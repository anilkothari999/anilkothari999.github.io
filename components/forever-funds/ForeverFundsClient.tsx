"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import type { ForeverFundsConfig } from "@/lib/forever-funds/config";
import { initFormHandlers } from "@/lib/forever-funds/client/init-forms";
import { initSiteNavigation, refreshSiteNavigation } from "@/lib/forever-funds/client/init-navigation";

declare global {
  interface Window {
    FOREVER_FUNDS_CONFIG?: ForeverFundsConfig;
    Chart?: unknown;
  }
}

type ForeverFundsClientProps = {
  config: ForeverFundsConfig;
};

let calculatorsBooted = false;

function loadLegacyScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-ff-legacy="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.ffLegacy = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function bootCalculators() {
  if (calculatorsBooted) return;
  if (!document.querySelector("[data-calculator]")) return;
  calculatorsBooted = true;
  await loadLegacyScript("/legacy/calculators-core.js");
  await loadLegacyScript("/legacy/calculators-ui.js");
}

export function ForeverFundsClient({ config }: ForeverFundsClientProps) {
  const pathname = usePathname();

  useEffect(() => {
    window.FOREVER_FUNDS_CONFIG = config;
    const cleanupForms = initFormHandlers();
    const cleanupNavigation = initSiteNavigation();
    void bootCalculators();
    return () => {
      cleanupForms();
      cleanupNavigation();
    };
  }, [config]);

  useEffect(() => {
    refreshSiteNavigation();
    void bootCalculators();
  }, [pathname]);

  return (
  <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}