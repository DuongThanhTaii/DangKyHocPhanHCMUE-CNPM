export type ChatbotReply =
  | { text: string } // ưu tiên trường text
  | { answer?: string; response?: string; reply?: string; output?: string }
  | Record<string, unknown>;

const API_BASE =
  import.meta.env.VITE_CHATBOT_API_BASE || "http://localhost:8000";

const TOPK_DEFAULT = Number(import.meta.env.VITE_CHATBOT_TOPK_DEFAULT ?? 2);

export async function queryChatbot(
  query: string,
  topK: number = TOPK_DEFAULT
): Promise<string> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });

  // Hệ thống bận hoặc chưa OK: FastAPI trả 503 với { detail: { error, status } }
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      if (j?.detail?.error)
        detail = `${j.detail.error} (status: ${j.detail.status})`;
      else if (j?.detail)
        detail =
          typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  const data: ChatbotReply = await res.json();

  // Cố gắng lấy ra chuỗi phản hồi "đẹp"
  const text =
    (data as any).text ??
    (data as any).answer ??
    (data as any).response ??
    (data as any).reply ??
    (data as any).output ??
    JSON.stringify(data);

  return String(text);
}
