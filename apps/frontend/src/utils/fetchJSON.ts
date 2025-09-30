// Simple fetchJSON helper for API calls
import api from "./api";

export async function fetchJSON(url: string, options?: { method?: string; body?: any }) {
  try {
    if (options?.method === "POST") {
      const res = await api.post(url, options.body);
      return res.data;
    } else {
      const res = await api.get(url);
      return res.data;
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}
