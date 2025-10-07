// src/components/toast/ToastContainer.tsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
//import { X } from "lucide-react"; // icon, có thể bỏ nếu không dùng
import {
  useModalContext,
  type ToastPayload,
  type ToastType,
} from "../../hook/ModalContext";
import "./toast.css";

type ToastItem = Required<ToastPayload>;

const genId = () => Math.random().toString(36).slice(2, 10);

const Toast: React.FC<{
  data: ToastItem;
  onClose: (id: string) => void;
}> = ({ data, onClose }) => {
  const { id, title, message, type, duration } = data;
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      if (elapsed >= duration) {
        clearInterval(interval);
        setLeaving(true);
        setTimeout(() => onClose(id), 250);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [duration, id, onClose]);

  const typeClass = useMemo(() => {
    switch (type) {
      case "success":
        return "toast--success";
      case "error":
        return "toast--error";
      case "warning":
        return "toast--warning";
      default:
        return "toast--info";
    }
  }, [type]);

  return (
    <div
      className={`toast ${typeClass} ${
        leaving ? "toast--leave" : "toast--enter"
      }`}
    >
      <div className="toast__content">
        <div className="toast__text">
          {title && <div className="toast__title">{title}</div>}
          <div className="toast__message">{message}</div>
        </div>
        <button
          className="toast__close"
          onClick={() => {
            setLeaving(true);
            setTimeout(() => onClose(id), 250);
          }}
        >
          {/* simple X fallback to avoid external icon dependency */}
          <span style={{ display: "inline-block", lineHeight: 0 }}>&#10005;</span>
        </button>
      </div>
      <div className="toast__progress" style={{ width: `${progress}%` }} />
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { subscribeNotify } = useModalContext();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = subscribeNotify((payload) => {
      const newToast: ToastItem = {
        id: payload.id ?? genId(),
        title: payload.title ?? "",
        message: payload.message,
        type: payload.type ?? "info",
        duration: payload.duration ?? 5000,
      };
      setToasts((prev) => [newToast, ...prev]);
    });
    return () => unsub();
  }, [subscribeNotify]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const root =
    document.getElementById("toast-root") ||
    (() => {
      const div = document.createElement("div");
      div.id = "toast-root";
      document.body.appendChild(div);
      return div;
    })();

  return createPortal(
    <div className="toast__container">
      {toasts.map((t) => (
        <Toast key={t.id} data={t} onClose={removeToast} />
      ))}
    </div>,
    root
  );
};

export default ToastContainer;
