/**
 * API Gateway base URL (no path). Trial/dev:
 *   https://of6rpy6zah.execute-api.us-east-2.amazonaws.com
 *
 * Prefer NEXT_PUBLIC_API_BASE_URL. NEXT_PUBLIC_API_URL is accepted when it
 * still ends with /intelliframe/base or /export-pdf.
 */
function resolveApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return base.replace(/\/+$/, "");

  const legacy = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (legacy) {
    return legacy
      .replace(/\/intelliframe\/(?:base|export-pdf)\/?$/i, "")
      .replace(/\/+$/, "");
  }

  return "https://of6rpy6zah.execute-api.us-east-2.amazonaws.com";
}

export const API_BASE_URL = resolveApiBase();

/** UI deadline for polling a calculation job (does not cancel the server job). */
export const CALCULATE_TIMEOUT_MS = 10 * 60 * 1000;

/** UI deadline for polling a report job. */
export const REPORT_TIMEOUT_MS = 10 * 60 * 1000;
