import api from "./api";

export async function fetchJSON(url: string, options?: { method?: string; body?: any }) {
  try {
    const method = options?.method?.toUpperCase() || "GET";

    switch (method) {
      case "POST":
        const postRes = await api.post(url, options?.body);
        return postRes.data;

      case "PUT":
        const putRes = await api.put(url, options?.body);
        return putRes.data;

      case "PATCH":
        const patchRes = await api.patch(url, options?.body);
        return patchRes.data;

      case "DELETE":
        const deleteRes = await api.delete(url);
        return deleteRes.data;

      case "GET":
      default:
        const getRes = await api.get(url);
        return getRes.data;
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}