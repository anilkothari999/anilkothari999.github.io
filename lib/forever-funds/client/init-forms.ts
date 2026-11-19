import type { ForeverFundsConfig } from "../config";

declare global {
  interface Window {
    FOREVER_FUNDS_CONFIG?: ForeverFundsConfig;
  }
}

// Shows only the fieldsets whose data-products list includes the selected product.
// Hidden fieldsets are disabled so their required fields are skipped and not submitted.
function syncProductFields(select: HTMLSelectElement) {
  select.form?.querySelectorAll<HTMLFieldSetElement>("fieldset[data-products]").forEach((fieldset) => {
    const show = (fieldset.dataset.products ?? "").split("|").includes(select.value);
    fieldset.hidden = !show;
    fieldset.disabled = !show;
  });
}

function initProductFields(signal: AbortSignal) {
  document.querySelectorAll<HTMLSelectElement>("select[data-product-select]").forEach((select) => {
    syncProductFields(select);
    select.addEventListener("change", () => syncProductFields(select), { signal });
    select.form?.addEventListener("reset", () => setTimeout(() => syncProductFields(select)), { signal });
  });

  document.querySelectorAll<HTMLAnchorElement>("a[data-enquire-product]").forEach((link) => {
    link.addEventListener(
      "click",
      () => {
        const select = document.querySelector(link.hash)?.querySelector<HTMLSelectElement>("select[data-product-select]");
        if (!select) return;
        select.value = link.dataset.enquireProduct ?? "";
        syncProductFields(select);
        // Defer until the browser has finished navigating to the fragment, which resets focus.
        setTimeout(() => select.form?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }));
      },
      { signal },
    );
  });
}

function prefillContactTopic() {
  const topic = new URLSearchParams(window.location.search).get("topic")?.trim().slice(0, 60);
  const message = document.querySelector<HTMLTextAreaElement>('form[data-submit-kind="contact"] textarea[name="message"]');
  if (topic && message && !message.value) message.value = `I would like to know more about ${topic}.`;
}

export function initFormHandlers(): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const config = window.FOREVER_FUNDS_CONFIG ?? ({} as ForeverFundsConfig);
  const QUEUE_KEY = "ff_pending_submissions_v1";
  const clean = (s: FormDataEntryValue | null) =>
    String(s ?? "")
      .replace(/[<>\u0000-\u001f]/g, "")
      .trim()
      .slice(0, 2000);
  const validMobile = (s: string) => /^[6-9]\d{9}$/.test(String(s || "").trim());
  const getQueue = (): unknown[] => {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as unknown[];
    } catch {
      return [];
    }
  };
  const setQueue = (q: unknown[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-30)));
    } catch {
      /* ignore quota errors */
    }
  };

  async function send(payload: Record<string, unknown>) {
    if (payload.kind === "lead") {
      const endpoint = String(config.googleSheetsWebAppUrl || "");
      if (!endpoint.startsWith("https://script.google.com/macros/s/") || !endpoint.endsWith("/exec")) {
        throw new Error("google_sheets_not_configured");
      }
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
      });
      return { ok: true };
    }
    if (
      !config.submitFunctionUrl ||
      !config.supabaseAnonKey ||
      config.supabaseUrl?.includes("YOUR_PROJECT")
    ) {
      throw new Error("backend_not_configured");
    }
    const response = await fetch(config.submitFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`submit_failed_${response.status}`);
    return response.json().catch(() => ({ ok: true }));
  }

  async function retryQueue() {
    const q = getQueue();
    if (!q.length) return;
    const remain: unknown[] = [];
    for (const item of q) {
      try {
        await send(item as Record<string, unknown>);
      } catch {
        remain.push(item);
      }
    }
    setQueue(remain);
  }

  window.addEventListener("online", retryQueue, { signal });
  void retryQueue();

  initProductFields(signal);
  prefillContactTopic();

  document.querySelectorAll("form[data-submit-kind]").forEach((form) => {
    if (!(form instanceof HTMLFormElement)) return;
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const status = form.querySelector(".form-status");
      const button = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      if (data.get("website")) {
        if (status) status.textContent = "Thank you.";
        return;
      }
      const mobile = clean(data.get("mobile"));
      if (mobile && !validMobile(mobile)) {
        form.querySelector<HTMLInputElement>('[name="mobile"]')?.setCustomValidity(
          "Enter a valid 10-digit Indian mobile number.",
        );
        form.querySelector<HTMLInputElement>('[name="mobile"]')?.reportValidity();
        return;
      }
      form.querySelector<HTMLInputElement>('[name="mobile"]')?.setCustomValidity("");
      if (!form.reportValidity()) return;
      const consent = form.querySelector<HTMLInputElement>('[name="consent"]');
      if (consent && !consent.checked) return;
      const redirect = form.dataset.redirect;
      const redirectTab = redirect ? window.open("about:blank", "_blank") : null;
      const payload: Record<string, unknown> = {
        kind: form.dataset.submitKind,
        source_page: location.pathname,
        created_at: new Date().toISOString(),
        consent: true,
        name: clean(data.get("name")),
        mobile,
        email: clean(data.get("email")).toLowerCase(),
        message: clean(data.get("message")),
        product_type: clean(data.get("product_type")),
        details: {} as Record<string, string>,
      };
      const details = payload.details as Record<string, string>;
      for (const [key, value] of data.entries()) {
        if (!["name", "mobile", "email", "message", "consent", "website"].includes(key)) {
          details[key] = clean(value);
        }
      }
      if (button instanceof HTMLButtonElement) button.disabled = true;
      if (status) status.textContent = "Submitting…";
      let saved = false;
      try {
        await send(payload);
        saved = true;
      } catch {
        if (payload.kind !== "lead") {
          const q = getQueue();
          q.push(payload);
          setQueue(q);
        }
        if (status) {
          status.textContent =
            payload.kind === "lead"
              ? "We could not submit your details. Please try again, or contact us on +91 95714 11114."
              : "Your enquiry could not be sent right now. It will retry when this browser is online.";
        }
        if (redirectTab) {
          try {
            redirectTab.close();
          } catch {
            /* ignore */
          }
        }
        if (button instanceof HTMLButtonElement) button.disabled = false;
        return;
      }
      if (redirect) {
        form.reset();
        if (status) status.textContent = "Thank you. Your details were sent. Opening the registration page…";
        if (redirectTab) {
          redirectTab.location.replace(redirect);
          redirectTab.opener = null;
        } else {
          if (status) {
            status.textContent =
              "Your details were sent. Please allow pop-ups to open the registration page in a new tab.";
          }
          window.open(redirect, "_blank", "noopener,noreferrer");
        }
        if (button instanceof HTMLButtonElement) button.disabled = false;
        return;
      }
      if (saved) {
        form.reset();
        if (status) status.textContent = "Thank you. Your enquiry has been received.";
      }
      if (button instanceof HTMLButtonElement) button.disabled = false;
    }, { signal });
  });

  return () => controller.abort();
}