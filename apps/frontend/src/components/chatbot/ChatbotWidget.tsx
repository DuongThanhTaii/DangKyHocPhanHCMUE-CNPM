// src/components/chatbot/ChatbotWidget.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  queryByDomain,
  guessDomain,
  type DomainKey,
  formatForDomain,
} from "../../services/chatbot";
import type { ChatbotPayload, VectorItem } from "../../services/chatbot";

/** ====== Types ====== */
type UserMsg = { id: string; role: "user"; text: string };
type BotMsg =
  | { id: string; role: "bot"; payload: ChatbotPayload }
  | { id: string; role: "system"; payload: ChatbotPayload | { text: string } };
type Message = UserMsg | BotMsg;

const uid = () => Math.random().toString(36).slice(2);

/** ====== Draggable FAB config ====== */
const FAB_SIZE = 56;
const PANEL_W = 420; // thoáng hơn một chút
const PANEL_H = 560;
const EDGE_PAD = 12;
const CLICK_DRAG_THRESHOLD = 6;
const POS_KEY = "chatbot_fab_pos";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const isUser = (m: Message): m is UserMsg => m.role === "user";

/** ====== Simple markdown renderer (bold, list, linebreak, code inline) ====== */
function toHtml(md: string): string {
  if (!md) return "";
  let s = md;

  // escape cơ bản
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // **bold**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // `inline code`
  s = s.replace(/`([^`]+?)`/g, '<code class="cbt-code">$1</code>');

  // li gạch đầu dòng
  s = s.replace(
    /^(?:[-*•]\s.+)$/gm,
    (m) => `<li>${m.replace(/^[-*•]\s/, "")}</li>`
  );
  // li số thứ tự
  s = s.replace(/^\d+[\.\)]\s.+$/gm, (m) => {
    const text = m.replace(/^\d+[\.\)]\s/, "");
    return `<li>${text}</li>`;
  });
  // gộp li → ul (đủ tốt cho đoạn ngắn)
  s = s.replace(
    /(?:<li>[\s\S]*?<\/li>)/g,
    (block) => `<ul class="cbt-ul">${block}</ul>`
  );

  // thu gọn xuống dòng
  s = s.replace(/\r/g, "");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/\n{2}/g, "<br>");
  s = s.replace(/\n/g, "<br>");

  return s;
}

/** ====== Clipboard helpers ====== */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
    return ok;
  }
}

/** ====== Convert payload -> plain text ====== */
function payloadToPlainText(p: ChatbotPayload | { text: string }): string {
  if ("text" in p) return String(p.text ?? "");
  const t = (p as any).type as string | undefined;

  if (t === "natural_answer" || t === "answer") {
    const text = String(
      (p as any).answer ?? (p as any).text ?? "(Không có nội dung trả lời)"
    );
    const r: VectorItem[] = (p as any).results || [];
    if (!r.length) return text;
    const refs = r
      .map((it, i) => {
        const chunk = String(it.chunk ?? "");
        const src = String(it.source ?? "So_Tay");
        const dist =
          typeof it.distance === "number" ? it.distance.toFixed(4) : "—";
        return `#${i + 1}\n${chunk}\nsource: ${src} · distance: ${dist}`;
      })
      .join("\n\n");
    return `${text}\n\n---\nNguồn tham chiếu:\n${refs}`;
  }

  if (t === "table") {
    const raw = (p as any)?.data;
    const html: string = typeof raw === "string" ? raw : String(raw ?? "");
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").trim();
  }

  return JSON.stringify(p);
}

/** ====== Render bot payload ====== */
function renderBotPayload(
  payload: ChatbotPayload | { text: string },
  onCopy?: (ok: boolean) => void
): React.ReactElement {
  const tools = (content: React.ReactElement): React.ReactElement => (
    <div className="cbt-bubble-wrap">
      {content}
      <div className="cbt-tools">
        <button
          className="cbt-tool-btn"
          onClick={async () => {
            const ok = await copyToClipboard(payloadToPlainText(payload));
            onCopy?.(ok);
          }}
          title="Copy nội dung"
        >
          Copy
        </button>
      </div>
    </div>
  );

  if ("text" in payload) {
    return tools(
      <div className="cbt-bubble">{String(payload.text ?? "")}</div>
    );
  }

  const t = (payload as any).type as string | undefined;

  if (t === "error") {
    return tools(
      <div className="cbt-bubble">
        ⚠️ {String((payload as any).message ?? "")}
      </div>
    );
  }

  if (t === "table") {
    const raw = (payload as any)?.data;
    const html: string = typeof raw === "string" ? raw : String(raw ?? "");
    return tools(
      <div
        className="cbt-bubble cbt-html"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (t === "course") {
    const d = (payload as any).data as {
      ten_mon?: string;
      description?: string;
      Description?: string;
      match_score?: number | string;
    };
    const ten = String(d?.ten_mon ?? "");
    const desc = String(d?.description ?? d?.Description ?? "");
    const score =
      typeof d?.match_score === "number"
        ? d?.match_score
        : Number(d?.match_score ?? "");
    return tools(
      <div className="cbt-bubble">
        <div className="cbt-title-sm">{ten}</div>
        <div className="cbt-desc">{desc}</div>
        <div className="cbt-meta">
          Độ khớp: {Number.isNaN(score) ? "" : `${score}%`}
        </div>
      </div>
    );
  }

  if (t === "vector_search") {
    const r: VectorItem[] = (payload as any).results || [];
    if (!r.length) {
      return tools(
        <div className="cbt-bubble">
          {String(
            (payload as any).message || "Không tìm thấy thông tin phù hợp."
          )}
        </div>
      );
    }
    return tools(
      <div className="cbt-bubble">
        <div className="cbt-title-sm">Kết quả gần nhất</div>
        {r.map((it, i) => (
          <div key={i} className="cbt-block">
            <div
              className="cbt-pre"
              dangerouslySetInnerHTML={{
                __html: toHtml(String(it.chunk ?? "")),
              }}
            />
            <div className="cbt-meta">
              source: {String(it.source ?? "So_Tay")} · distance:{" "}
              {typeof it.distance === "number" ? it.distance.toFixed(4) : "—"}
            </div>
            {i < r.length - 1 && <hr className="cbt-hr" />}
          </div>
        ))}
      </div>
    );
  }

  if (t === "natural_answer" || t === "answer") {
    const text = String(
      (payload as any).answer ??
        (payload as any).text ??
        "(Không có nội dung trả lời)"
    );
    return tools(
      <div className="cbt-bubble">
        <div
          className="cbt-pre"
          dangerouslySetInnerHTML={{ __html: toHtml(text) }}
        />
      </div>
    );
  }

  return tools(<div className="cbt-bubble">{JSON.stringify(payload)}</div>);
}

/** ====== Màn chọn chức năng ====== */
type Choice = {
  key: DomainKey | "auto";
  title: string;
  desc: string;
  emoji: string;
};

const CHOICES: Choice[] = [
  {
    key: "auto",
    title: "Trợ lý tổng hợp",
    desc: "Tự đoán nguồn phù hợp.",
    emoji: "✨",
  },
  {
    key: "bang",
    title: "Tra cứu Bảng",
    desc: "Thang điểm, học bổng…",
    emoji: "📊",
  },
  {
    key: "phong",
    title: "Phòng/Trung tâm",
    desc: "Thông tin liên hệ.",
    emoji: "🏢",
  },
  { key: "monhoc", title: "Môn học", desc: "Mô tả, đề cương…", emoji: "📚" },
  { key: "khoa", title: "Khoa", desc: "Thông tin các khoa.", emoji: "🏫" },
  {
    key: "nganh",
    title: "Ngành học",
    desc: "Cơ hội nghề nghiệp.",
    emoji: "🎓",
  },
  // NEW
  {
    key: "fileqa",
    title: "File QA",
    desc: "Hỏi theo tài liệu đã nạp.",
    emoji: "🗂️",
  },
];

export default function ChatbotWidget() {
  /** ====== UI state ====== */
  const [open, setOpen] = useState(false);
  const [modePicked, setModePicked] = useState<boolean>(false);
  const [domain, setDomain] = useState<DomainKey | "auto">("auto");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "system",
      payload: {
        text: "Xin chào 👋 Mời bạn chọn chức năng trước khi đặt câu hỏi.",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState<number>(
    Number(import.meta.env.VITE_CHATBOT_TOPK_DEFAULT ?? 1)
  );
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  /** ====== FAB position (draggable + persist) ====== */
  const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
    const W = typeof window !== "undefined" ? window.innerWidth : 1280;
    const H = typeof window !== "undefined" ? window.innerHeight : 720;
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(POS_KEY) : null;
    if (saved) {
      try {
        const p = JSON.parse(saved) as any;
        return {
          x: clamp(
            Number(p?.x ?? W - FAB_SIZE - 20),
            EDGE_PAD,
            W - FAB_SIZE - EDGE_PAD
          ),
          y: clamp(
            Number(p?.y ?? H - FAB_SIZE - 20),
            EDGE_PAD,
            H - FAB_SIZE - EDGE_PAD
          ),
        };
      } catch {}
    }
    return { x: W - FAB_SIZE - 20, y: H - FAB_SIZE - 20 };
  });

  useEffect(() => {
    const onResize = () => {
      setFabPos((p) => ({
        x: clamp(p.x, EDGE_PAD, window.innerWidth - FAB_SIZE - EDGE_PAD),
        y: clamp(p.y, EDGE_PAD, window.innerHeight - FAB_SIZE - EDGE_PAD),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);
  const draggedRef = useRef(false);

  const onFabPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      px: fabPos.x,
      py: fabPos.y,
    };
    draggedRef.current = false;
    document.body.classList.add("cbt-noselect");
  };
  const onFabPointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > CLICK_DRAG_THRESHOLD) draggedRef.current = true;
    const nx = clamp(
      dragStartRef.current.px + dx,
      EDGE_PAD,
      window.innerWidth - FAB_SIZE - EDGE_PAD
    );
    const ny = clamp(
      dragStartRef.current.py + dy,
      EDGE_PAD,
      window.innerHeight - FAB_SIZE - EDGE_PAD
    );
    setFabPos({ x: nx, y: ny });
  };
  const onFabPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragStartRef.current = null;
    document.body.classList.remove("cbt-noselect");
    localStorage.setItem(POS_KEY, JSON.stringify(fabPos));
    if (!draggedRef.current) setOpen((v) => !v);
  };

  /** ====== Panel position relative to FAB ====== */
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  useEffect(() => {
    if (!open) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const preferTop = fabPos.y - PANEL_H - 12 >= EDGE_PAD;
    const top = preferTop
      ? fabPos.y - PANEL_H - 12
      : clamp(fabPos.y + FAB_SIZE + 12, EDGE_PAD, H - PANEL_H - EDGE_PAD);
    let left = fabPos.x + FAB_SIZE - PANEL_W;
    left = clamp(left, EDGE_PAD, W - PANEL_W - EDGE_PAD);
    setPanelPos({ top, left });
  }, [open, fabPos]);

  /** ====== Toast nhỏ ====== */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1100);
    return () => clearTimeout(t);
  }, [toast]);

  /** ====== Utils ====== */
  const resetChat = (intro?: string) => {
    setMessages([
      {
        id: uid(),
        role: "system",
        payload: { text: intro || "Bạn đã chuyển chức năng. Hãy đặt câu hỏi!" },
      },
    ]);
  };

  const handlePick = (k: DomainKey | "auto") => {
    setDomain(k);
    setModePicked(true);
    resetChat(
      k === "auto"
        ? "Bạn đang ở chế độ Trợ lý tổng hợp (Auto)."
        : `Bạn đang ở chức năng: ${String(k).toUpperCase()}.`
    );
  };

  /** ====== Chat logic ====== */
  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: UserMsg = { id: uid(), role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const chosen: DomainKey = domain === "auto" ? guessDomain(q) : domain;
      const raw = await queryByDomain(chosen, q, topK);
      const payload = formatForDomain(chosen, raw);
      const botMsg: BotMsg = { id: uid(), role: "bot", payload };
      setMessages((m) => [...m, botMsg]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "system",
          payload: {
            text:
              "⚠️ Xin lỗi, không thể xử lý yêu cầu.\n" + (err?.message || ""),
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        aria-label="Open Chatbot"
        className="cbt-fab"
        style={{ left: fabPos.x, top: fabPos.y }}
        onPointerDown={onFabPointerDown}
        onPointerMove={onFabPointerMove}
        onPointerUp={onFabPointerUp}
      >
        💬
      </button>

      {/* Panel: Pick Screen */}
      {open && !modePicked && (
        <div
          className="cbt-panel"
          style={{ left: panelPos.left, top: panelPos.top }}
        >
          <div className="cbt-header">
            <div className="cbt-title">Chọn chức năng</div>
            <div className="cbt-actions">
              <button
                className="cbt-close"
                onClick={() => setOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="cbt-body cbt-narrow">
            <div className="cbt-grid">
              {CHOICES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handlePick(c.key)}
                  className="cbt-card"
                >
                  <div className="cbt-emoji">{c.emoji}</div>
                  <div className="cbt-card-title">{c.title}</div>
                  <div className="cbt-card-desc">{c.desc}</div>
                </button>
              ))}
            </div>

            <div className="cbt-hint">
              Gợi ý: Bạn có thể chuyển nhanh giữa các nguồn ngay trong phần
              chat.
            </div>
          </div>
        </div>
      )}

      {/* Panel Chat */}
      {open && modePicked && (
        <div
          className="cbt-panel"
          style={{ left: panelPos.left, top: panelPos.top }}
        >
          <div className="cbt-header">
            <div className="cbt-title">
              {domain === "auto"
                ? "Trợ lý tổng hợp"
                : `Chatbot ${domain.toUpperCase()}`}
            </div>
            <div className="cbt-actions">
              <div className="cbt-switches">
                {CHOICES.map((c) => (
                  <button
                    key={c.key}
                    className="cbt-minibtn"
                    style={{
                      background:
                        c.key === domain
                          ? "rgba(255,255,255,.28)"
                          : "rgba(255,255,255,.12)",
                      borderColor: "rgba(255,255,255,.35)",
                    }}
                    onClick={() => {
                      setDomain(c.key as DomainKey | "auto");
                      resetChat(
                        c.key === "auto"
                          ? "Bạn đang ở chế độ Trợ lý tổng hợp (Auto)."
                          : `Bạn đang ở chức năng: ${String(
                              c.key
                            ).toUpperCase()}.`
                      );
                    }}
                    title={`Nguồn: ${c.title}`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              <button
                className="cbt-minibtn"
                onClick={() => {
                  setModePicked(false);
                  setInput("");
                  resetChat("Xin chào 👋 Mời bạn chọn chức năng.");
                }}
              >
                ← Chọn lại
              </button>
              <button
                className="cbt-close"
                onClick={() => setOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="cbt-body">
            {messages.map((m) => (
              <div key={m.id} className={`cbt-msg ${m.role}`}>
                {isUser(m) ? (
                  <div className="cbt-bubble-wrap">
                    <div className="cbt-bubble">{m.text}</div>
                    <div className="cbt-tools">
                      <button
                        className="cbt-tool-btn"
                        onClick={async () => {
                          const ok = await copyToClipboard(m.text);
                          setToast(ok ? "Đã copy" : "Copy thất bại");
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  renderBotPayload((m as BotMsg).payload, (ok) =>
                    setToast(ok ? "Đã copy" : "Copy thất bại")
                  )
                )}
              </div>
            ))}
            {loading && (
              <div className="cbt-msg bot">
                <div className="cbt-bubble">Đang xử lý…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="cbt-input">
            <input
              value={input}
              placeholder="Nhập câu hỏi và nhấn Enter…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <button onClick={send} disabled={loading || !input.trim()}>
              Gửi
            </button>
          </div>

          {toast && <div className="cbt-toast">{toast}</div>}
        </div>
      )}
    </>
  );
}
