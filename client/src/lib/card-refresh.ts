import { apiRequest } from "@/lib/queryClient";

export type CardRefreshResult = {
  id: string;
  status: "running" | "complete" | "failed";
  percent: number;
  binsChecked: number;
  totalBins: number;
  cardsUpdated: number;
  duplicateGroups: number;
  duplicatesFound: number;
  duplicatesRemoved: number;
  error?: string;
};

export async function refreshCardBins(onProgress: (percent: number) => void): Promise<CardRefreshResult> {
  const startResponse = await apiRequest("POST", "/api/cards/refresh");
  const initial = await startResponse.json().catch(() => null);
  if (!startResponse.ok) throw new Error(initial?.message || "Unable to start card refresh");

  let job = initial as CardRefreshResult;
  onProgress(job.percent ?? 0);

  while (job.status === "running") {
    await new Promise(resolve => window.setTimeout(resolve, 500));
    const statusResponse = await fetch(`/api/cards/refresh/status?jobId=${encodeURIComponent(job.id)}`, {
      credentials: "include",
    });
    const status = await statusResponse.json().catch(() => null);
    if (!statusResponse.ok) throw new Error(status?.message || "Unable to read refresh progress");
    job = status as CardRefreshResult;
    onProgress(job.percent ?? 0);
  }

  if (job.status === "failed") throw new Error(job.error || "Card refresh failed");
  return job;
}