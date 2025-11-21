// src/services/chatbot.ts

/** ===== Kiểu dữ liệu dùng chung ===== */
export type VectorItem = { chunk: string; source?: string; distance?: number };

export type ChatbotPayload =
  | { type: "natural_answer"; answer: string; results?: VectorItem[] }
  | { type: "answer"; text: string; results?: VectorItem[] }
  | { type: "table"; data: string }
  | {
      type: "course";
      data: { ten_mon: string; description: string; match_score: number };
    }
  | {
      type: "vector_search";
      results: VectorItem[];
      message?: string;
      natural_answer?: string;
    }
  | { type: "error"; message: string }
  | Record<string, unknown>;

/** ===== Base URLs cho từng Space (điền env HF của bạn) ===== */
const trimBase = (s: string) => (s || "").replace(/\/+$/, "");

const BANG_BASE = trimBase(
  import.meta.env.VITE_API_BANG || "https://<your-bang>.hf.space"
);
const PHONG_BASE = trimBase(
  import.meta.env.VITE_API_PHONG || "https://<your-phong>.hf.space"
);
const MONHOC_BASE = trimBase(
  import.meta.env.VITE_API_MONHOC || "https://<your-monhoc>.hf.space"
);
const KHOA_BASE = trimBase(
  import.meta.env.VITE_API_KHOA || "https://<your-khoa>.hf.space"
);
const NGANH_BASE = trimBase(
  import.meta.env.VITE_API_NGANH || "https://<your-nganh>.hf.space"
);

/** 👉 FileQA dùng /ask (POST {question}), không phải /search */
const FILEQA_BASE = trimBase(
  import.meta.env.VITE_API_FILEQA || "https://<your-fileqa>.hf.space"
);

/** Gộp domain -> base */
export const DOMAIN_BASES = {
  bang: BANG_BASE,
  phong: PHONG_BASE,
  monhoc: MONHOC_BASE,
  khoa: KHOA_BASE,
  nganh: NGANH_BASE,
  fileqa: FILEQA_BASE,
};
export type DomainKey = keyof typeof DOMAIN_BASES;

/* ===================== Helpers chắc chắn ===================== */

/** parse an toàn (backend đôi khi trả stringified JSON) */
function safeParse<T = any>(x: any): T | null {
  if (x == null) return null;
  if (typeof x === "object") return x as T;
  try {
    return JSON.parse(String(x)) as T;
  } catch {
    return null;
  }
}

/** lấy phần .result bên trong nếu có (dù raw là string hay object) */
function unwrapResult(raw: any): any {
  const o = safeParse<any>(raw) ?? raw;
  return typeof o?.result !== "undefined" ? o.result : o;
}

/** gọn dòng + bỏ khoảng cách thừa */
function cleanMultiline(s: string) {
  return String(s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Ưu tiên natural_answer/answer/text nếu đã có sẵn */
function normalizePayload(raw: any): ChatbotPayload {
  const o = safeParse<any>(raw) ?? raw;

  if (typeof o?.natural_answer === "string") {
    return {
      type: "natural_answer",
      answer: cleanMultiline(o.natural_answer),
      results: o?.results || [],
    };
  }
  if (typeof o?.answer === "string") {
    return {
      type: "natural_answer",
      answer: cleanMultiline(o.answer),
      results: o?.results || [],
    };
  }
  if (typeof o?.text === "string") {
    return {
      type: "answer",
      text: cleanMultiline(o.text),
      results: o?.results || [],
    };
  }
  return o as ChatbotPayload;
}

/* ===================== Format theo domain (lọc gọn) ===================== */

/** BẢNG: bỏ “(Match …)” + “[Bảng: …]”, giữ thân */
function fmtBang(raw: any): string {
  const r = unwrapResult(raw);
  let s = typeof r === "string" ? r : String(r ?? "");
  s = s.replace(/^\(Match[^\n]*\)\s*/i, ""); // (Match fuzzy alias: …)
  s = s.replace(/^\[[^\]]+\]\s*\n?/m, ""); // [Bảng: …]
  return cleanMultiline(s);
}

/** KHOA: chỉ tên + liên hệ cần thiết */
function fmtKhoa(raw: any): string {
  const r = unwrapResult(raw) ?? {};
  const info = r.info ?? {};
  const name = r.ten_khoa || "Khoa";
  const lines = [
    `**${name}**`,
    info.van_phong_lam_viec ? `Văn phòng: ${info.van_phong_lam_viec}` : null,
    info.dien_thoai
      ? `Điện thoại: ${info.dien_thoai}${
          info.noi_bo ? ` (Nội bộ ${info.noi_bo})` : ""
        }`
      : null,
    info.email ? `Email: ${info.email}` : null,
    info.website ? `Website: ${info.website}` : null,
  ].filter(Boolean);
  return cleanMultiline(lines.join("\n"));
}

/** PHÒNG / TRUNG TÂM: tên + liên hệ + (nếu có) công việc dạng bullet */
function fmtPhong(raw: any): string {
  const r = unwrapResult(raw) ?? {};
  const info = r.info ?? {};
  const name = r.ten_phong || r.ten_don_vi || "Đơn vị";
  const jobs: string[] = Array.isArray(info.cong_viec_lien_quan_sinh_vien)
    ? info.cong_viec_lien_quan_sinh_vien
    : [];
  const lines = [
    `**${name}**`,
    info.van_phong_lam_viec ? `Văn phòng: ${info.van_phong_lam_viec}` : null,
    info.dien_thoai
      ? `Điện thoại: ${info.dien_thoai}${
          info.noi_bo ? ` (Nội bộ ${info.noi_bo})` : ""
        }`
      : null,
    info.email ? `Email: ${info.email}` : null,
    info.website ? `Website: ${info.website}` : null,
    jobs.length
      ? `\nCông việc liên quan sinh viên:\n- ${jobs.join("\n- ")}`
      : null,
  ].filter(Boolean);
  return cleanMultiline(lines.join("\n"));
}

/** NGÀNH: tên + “Cơ hội nghề nghiệp” (lọc đuôi kiểu "40.") */
function fmtNganh(raw: any): string {
  const r = unwrapResult(raw) ?? {};
  const name = r.ten_nganh || "Ngành";
  let cohoi = String(r.cohoi || "");
  cohoi = cohoi.replace(/\n\s*\d+\.\s*$/m, ""); // bỏ đuôi số lẻ
  return cleanMultiline(`**${name} – Cơ hội nghề nghiệp**\n${cohoi}`);
}

/** MÔN HỌC: tên + mô tả */
function fmtMonHoc(raw: any): string {
  const r = unwrapResult(raw) ?? {};
  const name = r.ten_mon || "Môn học";
  const desc = r.description || r.Description || "";
  return cleanMultiline(`**${name}**\n${desc}`);
}

/** FILEQA: đa phần backend đã trả answer/natural_answer/text */
function fmtFileQA(raw: any): string {
  const o = safeParse<any>(raw) ?? raw;
  const ans =
    o?.natural_answer ?? o?.answer ?? o?.text ?? o?.result ?? String(o ?? "");
  return cleanMultiline(String(ans));
}

/** Gom format theo domain -> ChatbotPayload chuẩn để hiển thị */
export function formatForDomain(
  domain: DomainKey,
  raw: ChatbotPayload | any
): ChatbotPayload {
  // Nếu đã là natural_answer/answer thì chỉ clean & trả luôn
  const n = normalizePayload(raw);
  if (n?.type === "natural_answer") {
    return { ...n, answer: cleanMultiline(String(n.answer)) };
  }
  if (n?.type === "answer") {
    return { ...n, text: cleanMultiline(String(n.text)) };
  }

  // Tự format từ JSON thô theo domain
  switch (domain) {
    case "khoa":
      return { type: "natural_answer", answer: fmtKhoa(raw) };
    case "phong":
      return { type: "natural_answer", answer: fmtPhong(raw) };
    case "nganh":
      return { type: "natural_answer", answer: fmtNganh(raw) };
    case "monhoc":
      return { type: "natural_answer", answer: fmtMonHoc(raw) };
    case "bang":
      return { type: "natural_answer", answer: fmtBang(raw) };
    case "fileqa":
      return { type: "natural_answer", answer: fmtFileQA(raw) };
    default:
      return n;
  }
}

/* ===================== Heuristic đoán domain ===================== */

export function guessDomain(q: string): DomainKey {
  const s = (q || "").toLowerCase();

  if (/(điểm|đổi điểm|thang điểm|rèn luyện|học bổng|quy chế|quy định)/.test(s))
    return "bang";
  if (/(phòng|trung tâm|phòng ban|liên hệ|điện thoại|email)/.test(s))
    return "phong";
  if (/(môn|học phần|điều kiện tiên quyết|mô tả môn)/.test(s)) return "monhoc";
  if (/(khoa .+|thuộc khoa|khoa cntt|khoa toán|khoa ngữ|khoa)/.test(s))
    return "khoa";
  if (/(ngành|cơ hội nghề nghiệp|định hướng|chuẩn đầu ra)/.test(s))
    return "nganh";

  // nếu bạn có FileQA và muốn ưu tiên theo từ khoá:
  if (/(sổ tay|so tay|tài liệu|văn bản)/.test(s)) return "fileqa";

  return "bang";
}

/* ===================== Gọi API (fileqa → /ask; còn lại → /search) ===================== */

export async function queryByDomain(
  domain: DomainKey,
  query: string,
  top_k = 1
): Promise<ChatbotPayload> {
  const base = DOMAIN_BASES[domain];

  // File QA: POST /ask  { question }
  if (domain === "fileqa") {
    const url = `${base}/ask`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ question: query }),
    });

    if (!res.ok) {
      let detail = await res.text();
      try {
        const j = JSON.parse(detail);
        detail = j?.detail?.error || j?.message || detail;
      } catch {}
      throw new Error(`[fileqa] ${detail}`);
    }
    const raw = await res.json();
    return formatForDomain("fileqa", raw);
  }

  // Các domain khác: POST /search { query, top_k }
  const url = `${base}/search`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, top_k }),
  });

  if (!res.ok) {
    let detail = await res.text();
    try {
      const j = JSON.parse(detail);
      detail = j?.detail?.error || j?.message || detail;
    } catch {}
    throw new Error(`[${domain}] ${detail}`);
  }

  const raw = await res.json();
  return formatForDomain(domain, raw);
}
