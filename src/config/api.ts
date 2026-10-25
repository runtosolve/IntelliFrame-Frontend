export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gfsobzf3saishtr6yxxeoentym0axyqp.lambda-url.us-east-1.on.aws/intelliframe/base";

export const CALCULATE_TIMEOUT_MS = 5 * 60 * 1000;

export const REPORT_URL =
  process.env.NEXT_PUBLIC_REPORT_URL ??
  API_URL.replace(/\/base\/?$/, "/export-pdf");

export const REPORT_TIMEOUT_MS = 10 * 60 * 1000;
