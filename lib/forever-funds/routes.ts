export const FOREVER_FUNDS_PAGES = [
  "54ec-bonds",
  "about-us",
  "bonds",
  "calculators",
  "contact",
  "fees",
  "fixed-deposit",
  "home",
  "insurance",
  "mutual-funds",
  "other-products",
  "pms",
  "privacy",
  "sif",
  "terms"
] as const;

export type ForeverFundsPageSlug = (typeof FOREVER_FUNDS_PAGES)[number];

export const PAGE_SLUG_TO_PATH: Record<ForeverFundsPageSlug, string> = {
  "54ec-bonds": "/54ec-bonds",
  "about-us": "/about-us",
  "bonds": "/bonds",
  "calculators": "/calculators",
  "contact": "/contact",
  "fees": "/fees",
  "fixed-deposit": "/fixed-deposit",
  "home": "/",
  "insurance": "/insurance",
  "mutual-funds": "/mutual-funds",
  "other-products": "/other-products",
  "pms": "/pms",
  "privacy": "/privacy",
  "sif": "/sif",
  "terms": "/terms",
};

export const PAGE_METADATA: Record<
  ForeverFundsPageSlug,
  { title: string; description: string }
> = {
  "home": {
    "title": "Forever Funds by Anil Kothari | Personalised Financial Guidance",
    "description": "Explore mutual funds, insurance, bonds, retirement planning and financial calculators with Forever Funds by Anil Kothari, Jaipur."
  },
  "about-us": {
    "title": "About Us",
    "description": "About Forever Funds by Anil Kothari — personalised financial guidance in Jaipur."
  },
  "mutual-funds": {
    "title": "Mutual Funds",
    "description": "Learn about mutual fund categories and risks with Forever Funds."
  },
  "sif": {
    "title": "Specialised Investment Fund (SIF)",
    "description": "Understand SIF eligibility, strategy and risks."
  },
  "pms": {
    "title": "Portfolio Management Service (PMS)",
    "description": "PMS overview — fees, risks and suitability."
  },
  "fixed-deposit": {
    "title": "Fixed Deposits",
    "description": "Fixed deposit information — tenure, issuer and liquidity."
  },
  "bonds": {
    "title": "RBI & Corporate Bonds",
    "description": "Bond investing basics — yield, credit and liquidity risks."
  },
  "54ec-bonds": {
    "title": "54EC Capital Gains Bonds",
    "description": "Section 54EC bonds — informational overview."
  },
  "insurance": {
    "title": "Insurance",
    "description": "Health, life, motor, travel and other insurance enquiries."
  },
  "other-products": {
    "title": "Other Products",
    "description": "NPS, stock broking and loan against mutual funds."
  },
  "calculators": {
    "title": "Financial Calculators",
    "description": "SIP, retirement, SWP, EMI and other illustrative calculators."
  },
  "fees": {
    "title": "Fee Structure",
    "description": "How Forever Funds is remunerated — zero professional fees."
  },
  "contact": {
    "title": "Contact Us",
    "description": "Reach Forever Funds by phone, WhatsApp or email in Jaipur."
  },
  "privacy": {
    "title": "Privacy Policy",
    "description": "Privacy notice for Forever Funds enquiry forms."
  },
  "terms": {
    "title": "Terms of Use",
    "description": "Terms of use for Forever Funds website information."
  }
};
