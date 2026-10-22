export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://smi-test-backend.runtosolve.com/intelliframe/base";

export const CALCULATE_TIMEOUT_MS = 5 * 60 * 1000;

// PDF report: same service, sibling route of /intelliframe/base unless set explicitly.
export const REPORT_URL =
  process.env.NEXT_PUBLIC_REPORT_URL ??
  API_URL.replace(/\/base\/?$/, "/export-pdf");

// A report runs all four cases (existing and retrofit, gravity and uplift) plus the IntelliFrame
// local buckling study: about 1-2 minutes on a warm server, longer right after a deploy.
export const REPORT_TIMEOUT_MS = 10 * 60 * 1000;
