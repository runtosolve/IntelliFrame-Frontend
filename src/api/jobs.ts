import { fetchAuthSession } from "aws-amplify/auth";
import { API_BASE_URL, CALCULATE_TIMEOUT_MS, REPORT_TIMEOUT_MS } from "@/config/api";

export type AnalysisResult = {
  applied_pressure: number;
  failure_limit_state: string;
  failure_location: number;
  input_z: number[];
  output_v: number[];
  report_id?: string;
};

export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "expired";

export type Job = {
  job_id: string;
  job_type?: "base" | "export-pdf";
  status: JobStatus;
  status_url?: string;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
  cache?: "hit" | "miss" | "none";
  result?: AnalysisResult;
  download_url?: string;
  filename?: string;
  content_type?: string;
  expires_in?: number;
  error?: string;
  detail?: string;
};

export type JobRoute = "/intelliframe/base" | "/intelliframe/export-pdf";

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>, fallback: string) {
    const detail =
      (typeof body.detail === "string" && body.detail) ||
      (typeof body.error === "string" && body.error) ||
      (typeof body.message === "string" && body.message) ||
      fallback;
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function bearerToken(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  const token = tokens?.accessToken?.toString();
  if (!token) throw new Error("Please sign in.");
  return token;
}

function resolveUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${API_BASE_URL}/`).toString();
}

type ApiResponse = { response: Response; body: Record<string, unknown> };

async function apiRequest(pathOrUrl: string, options: RequestInit = {}): Promise<ApiResponse> {
  const token = await bearerToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(resolveUrl(pathOrUrl), {
    ...options,
    headers,
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(response.status, body, `HTTP ${response.status}`);
  }
  return { response, body };
}

function asJob(body: Record<string, unknown>): Job {
  return body as unknown as Job;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export type RunJobOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  onStatus?: (job: Job) => void;
};

export async function runJob(
  route: JobRoute,
  payload: Record<string, unknown> | string,
  options: RunJobOptions = {},
): Promise<Job> {
  const { signal, onStatus } = options;
  const timeoutMs =
    options.timeoutMs ??
    (route === "/intelliframe/export-pdf" ? REPORT_TIMEOUT_MS : CALCULATE_TIMEOUT_MS);

  const body =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  const submitted = await apiRequest(route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  if (submitted.response.status !== 202) {
    throw new Error(`Unexpected submit status ${submitted.response.status}; expected 202.`);
  }

  const statusUrl =
    (typeof submitted.body.status_url === "string" && submitted.body.status_url) ||
    (typeof submitted.body.job_id === "string" && `/intelliframe/jobs/${submitted.body.job_id}`) ||
    "";
  if (!statusUrl) {
    throw new Error("Unexpected submit response: missing status_url / job_id.");
  }

  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const { response, body: statusBody } = await apiRequest(statusUrl, { signal });
    const job = asJob(statusBody);
    onStatus?.(job);

    if (job.status === "succeeded") return job;
    if (job.status === "failed" || job.status === "expired") {
      throw new Error(job.detail ?? job.error ?? job.status);
    }
    if (job.status !== "queued" && job.status !== "running") {
      throw new Error(`Unexpected job status: ${job.status}`);
    }

    const elapsed = Date.now() - started;
    const minimumSeconds = elapsed < 30_000 ? 3 : 10;
    const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
    const seconds = Math.max(minimumSeconds, Number.isFinite(retryAfter) ? retryAfter : 0);
    await sleep(seconds * 1000, signal);
  }

  throw new Error("Still processing. Save the job ID and check again later.");
}

export async function downloadJobFile(
  job: Job,
  signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  if (!job.download_url) {
    throw new Error("Job succeeded without a download_url.");
  }
  const response = await fetch(job.download_url, { signal });
  if (!response.ok) {
    throw new Error(`Could not download the file (HTTP ${response.status}).`);
  }
  const blob = await response.blob();
  const filename =
    job.filename?.trim() ||
    "IntelliFrame_Report.pdf";
  return { blob, filename };
}

export function jobStatusLabel(status: JobStatus | null | undefined): string {
  switch (status) {
    case "queued":
      return "Queued…";
    case "running":
      return "Running…";
    case "succeeded":
      return "Complete";
    case "failed":
      return "Failed";
    case "expired":
      return "Expired";
    default:
      return "Submitting…";
  }
}
