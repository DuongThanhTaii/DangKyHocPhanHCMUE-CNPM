import { useEffect, useRef, useState } from "react";
import { queryChatbot } from "../../services/chatbot";

type Message = {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
};

const uid = () => Math.random().toString(36).slice(2);

// ==== Draggable FAB config ====
const FAB_SIZE = 56; // px (khớp CSS)
const PANEL_W = 380; // px (khớp CSS .cbt-panel width)
const PANEL_H = 520; // px (khớp CSS .cbt-panel height)
const EDGE_PAD = 12; // lề an toàn
const CLICK_DRAG_THRESHOLD = 6; // px — kéo > 6px mới tính là drag
const POS_KEY = "chatbot_fab_pos"; // localStorage key

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "system",
      text: "Xin chào 👋 Mình là Chatbot HCMUE. Bạn cần gì cứ hỏi nhé!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState<number>(
    Number(import.meta.env.VITE_CHATBOT_TOPK_DEFAULT ?? 2)
  );

  // ===== Scroll to bottom when open/messages change
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  // ====== Draggable FAB state
  const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
    // default: góc phải dưới
    const W = typeof window !== "undefined" ? window.innerWidth : 1280;
    const H = typeof window !== "undefined" ? window.innerHeight : 720;
    const saved = localStorage.getItem(POS_KEY);
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

  // keep pos in bounds on resize
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

  // pointer drag refs
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
    // lưu lại
    localStorage.setItem(POS_KEY, JSON.stringify(fabPos));
    // nếu không kéo (drag), coi như click toggle
    if (!draggedRef.current) {
      setOpen((v) => !v);
    }
  };

  // ====== Panel position (bật gần bóng, không tràn màn hình)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!open) return;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // ưu tiên mở panel phía trên và lệch sang trái một chút để sát bóng
    // nếu không đủ chỗ phía trên thì mở phía dưới
    const preferTop = fabPos.y - PANEL_H - 12 >= EDGE_PAD;
    const top = preferTop
      ? fabPos.y - PANEL_H - 12
      : clamp(fabPos.y + FAB_SIZE + 12, EDGE_PAD, H - PANEL_H - EDGE_PAD);

    // đặt panel sao cho mép phải panel khớp (gần) bóng
    let left = fabPos.x + FAB_SIZE - PANEL_W;
    // nếu lệch ra ngoài trái/phải thì kẹp lại
    left = clamp(left, EDGE_PAD, W - PANEL_W - EDGE_PAD);

    setPanelPos({ top, left });
  }, [open, fabPos]);

  // ====== Chat logic
  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Message = { id: uid(), role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await queryChatbot(q, topK);
      const botMsg: Message = { id: uid(), role: "bot", text: reply };
      setMessages((m) => [...m, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        id: uid(),
        role: "system",
        text:
          "⚠️ Xin lỗi, hiện không thể xử lý yêu cầu. " +
          (err?.message ? `\nChi tiết: ${err.message}` : ""),
      };
      setMessages((m) => [...m, botMsg]);
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
      {/* Bóng tròn nổi — chuyển sang absolute (left/top) để kéo thả */}
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

      {/* Khung chat đặt theo vị trí đã tính */}
      {open && (
        <div
          className="cbt-panel"
          style={{ left: panelPos.left, top: panelPos.top }}
        >
          <div className="cbt-header">
            <div className="cbt-title">Chatbot HCMUE</div>
            <div className="cbt-actions">
              <label className="cbt-topk">
                top_k:
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value || 2))}
                />
              </label>
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
                <div className="cbt-bubble">{m.text}</div>
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
