export type ForeverFundsConfig = {
  googleSheetsWebAppUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  submitFunctionUrl: string;
};

export function getForeverFundsConfig(): ForeverFundsConfig {
  return {
    googleSheetsWebAppUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL ?? "",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    submitFunctionUrl: process.env.NEXT_PUBLIC_SUBMIT_FUNCTION_URL ?? "",
  };
}