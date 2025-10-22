// apps/frontend/src/services/chatbot.ts
export type VectorItem = { chunk: string; source?: string; distance?: number };
export type ChatbotPayload =
  | { type: "table"; data: string } // HTML string
  | {
      type: "course";
      data: { ten_mon: string; description: string; match_score: number };
    }
  | { type: "vector_search"; results: VectorItem[]; message?: string }
  | { type: "error"; message: string }
  | Record<string, any>;

const API_BASE =
  import.meta.env.VITE_CHATBOT_API_BASE || "http://localhost:8000";

export async function queryChatbotRaw(
  query: string,
  topK: number
): Promise<ChatbotPayload> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      if (j?.detail?.error)
        detail = `${j.detail.error} (status: ${j.detail.status})`;
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as ChatbotPayload;
}
