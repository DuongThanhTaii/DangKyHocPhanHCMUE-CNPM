import React, { useEffect, useRef, useState } from "react";
// ⬇️ type-only import để không phát sinh import runtime
import type { ChatbotPayload, VectorItem } from "../../services/chatbot";

/** ====== Types ====== */
type UserMsg = { id: string; role: "user"; text: string };
type BotMsg =
  | { id: string; role: "bot" | "system"; payload: ChatbotPayload }
  | { id: string; role: "system"; payload: { text: string } };
type Message = UserMsg | BotMsg;

const uid = () => Math.random().toString(36).slice(2);

/** ====== Draggable FAB config ====== */
const FAB_SIZE = 56;
const PANEL_W = 380;
const PANEL_H = 520;
const EDGE_PAD = 12;
const CLICK_DRAG_THRESHOLD = 6;
const POS_KEY = "chatbot_fab_pos";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** ====== Render bot payload theo type ====== */
function renderBotPayload(
  payload: ChatbotPayload | { text: string }
): React.ReactNode {
  if ("text" in payload) {
    return <div className="cbt-bubble">{payload.text}</div>;
  }

  const p = payload as ChatbotPayload & Record<string, any>;
  const t = p?.type as string | undefined;

  if (t === "error") {
    return <div className="cbt-bubble">⚠️ {p.message}</div>;
  }

  if (t === "table") {
    return (
      <div
        className="cbt-bubble cbt-html"
        // HTML từ backend (bảng) — đảm bảo nguồn tin cậy
        dangerouslySetInnerHTML={{ __html: String(p.data ?? "") }}
      />
    );
  }

  if (t === "course") {
    const d = (p.data ?? {}) as {
      ten_mon: string;
      description: string;
      match_score: number;
    };
    return (
      <div className="cbt-bubble">
        <div style={{ fontWeight: 600 }}>{d.ten_mon}</div>
        <div style={{ opacity: 0.95, marginTop: 4 }}>{d.description}</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}></div>
      </div>
    );
  }

  if (t === "vector_search") {
    const r: VectorItem[] = (p.results as VectorItem[]) || [];
    if (!r.length) {
      return (
        <div className="cbt-bubble">
          {p.message || "Không tìm thấy thông tin phù hợp trong Sổ tay."}
        </div>
      );
    }
    return (
      <div className="cbt-bubble">
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Kết quả gần nhất</div>
        {r.map((it, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ whiteSpace: "pre-wrap" }}>{it.chunk}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {typeof it.distance === "number" ? it.distance.toFixed(4) : "—"}
            </div>
            {i < r.length - 1 && (
              <hr style={{ marginTop: 8, marginBottom: 8 }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback
  return <div className="cbt-bubble">{JSON.stringify(p)}</div>;
}

export default function ChatbotWidget() {
  /** ====== UI state ====== */
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "system",
      payload: {
        text: "Xin chào 👋 Mình là Chatbot HCMUE. Bạn cần gì cứ hỏi nhé!",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState<number>(
    Number(import.meta.env.VITE_CHATBOT_TOPK_DEFAULT ?? 1)
  );
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
        const p = JSON.parse(saved);
        return {
          x: clamp(p.x, EDGE_PAD, W - FAB_SIZE - EDGE_PAD),
          y: clamp(p.y, EDGE_PAD, H - FAB_SIZE - EDGE_PAD),
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
    const dist = Math.hypot(dx, dy);
    if (dist > CLICK_DRAG_THRESHOLD) draggedRef.current = true;

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
    if (!draggedRef.current) {
      setOpen((v) => !v);
    }
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

  /** ====== Chat logic ====== */
  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: UserMsg = { id: uid(), role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // chú ý: dùng queryChatbotRaw để nhận payload có type
      const { queryChatbotRaw } = await import("../../services/chatbot");
      const payload = await queryChatbotRaw(q, topK);
      const botMsg: BotMsg = { id: uid(), role: "bot", payload };
      setMessages((m) => [...m, botMsg]);
    } catch (err: any) {
      const botMsg: BotMsg = {
        id: uid(),
        role: "system",
        payload: {
          text: "⚠️ Xin lỗi, không thể xử lý yêu cầu.\n" + (err?.message || ""),
        },
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {/* FAB — kéo thả khắp màn hình */}
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

      {/* Panel chat */}
      {open && (
        <div
          className="cbt-panel"
          style={{ left: panelPos.left, top: panelPos.top }}
        >
          <div className="cbt-header">
            <div className="cbt-title">Chatbot HCMUE</div>
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

          <div className="cbt-body">
            {messages.map((m) => (
              <div key={m.id} className={`cbt-msg ${m.role}`}>
                {m.role === "user" ? (
                  <div className="cbt-bubble">{m.text}</div>
                ) : (
                  renderBotPayload(
                    m.payload as ChatbotPayload | { text: string }
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
        </div>
      )}
    </>
  );
}
