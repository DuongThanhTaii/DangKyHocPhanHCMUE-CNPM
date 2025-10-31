// Type cho từng item từ vector DB
export type VectorItem = { chunk: string; source?: string; distance?: number };

// Payload tổng quát sau CHUẨN HÓA
export type ChatbotPayload =
  | { type: "table"; data: string }
  | {
      type: "course";
      data: { ten_mon: string; description: string; match_score: number };
    }
  | { type: "vector_search"; results: VectorItem[]; message?: string }
  | { type: "natural_answer"; answer: string; results?: VectorItem[] }
  | { type: "answer"; text: string; results?: VectorItem[] }
  | { type: "error"; message: string }
  | Record<string, unknown>;

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

  // ---- CHUẨN HÓA: ưu tiên natural_answer nếu có ----
  const raw = await res.json();

  // Trường hợp backend trả type="vector_search" + natural_answer
  if (typeof raw?.natural_answer === "string") {
    const results: VectorItem[] = Array.isArray(raw?.results)
      ? raw.results
      : [];
    return {
      type: "natural_answer",
      answer: raw.natural_answer,
      results,
    };
  }

  // Giữ nguyên các dạng khác
  return raw as ChatbotPayload;
}
