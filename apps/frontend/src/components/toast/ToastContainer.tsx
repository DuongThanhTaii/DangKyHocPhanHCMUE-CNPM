// src/components/toast/ToastContainer.tsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
//import { X } from "lucide-react"; // icon, có thể bỏ nếu không dùng
import { useModalContext, type ToastPayload } from "../../hook/ModalContext";
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

  const icons = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          fill="#ffffff"
          d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
        />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path
          fill="#ffffff"
          d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
        />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
        <path
          fill="#ffffff"
          d="M64 432c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40c0-22.1 17.9-40 40-40zM64 0c26.5 0 48 21.5 48 48 0 .6 0 1.1 0 1.7l-16 304c-.9 17-15 30.3-32 30.3S33 370.7 32 353.7L16 49.7c0-.6 0-1.1 0-1.7 0-26.5 21.5-48 48-48z"
        />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
        <path
          fill="#ffffff"
          d="M48 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM0 192c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 256 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-224-32 0c-17.7 0-32-14.3-32-32z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`toast ${typeClass} ${
        leaving ? "toast--leave" : "toast--enter"
      }`}
    >
      <div className="toast__content">
        <div className="toast__text">
          <div className="toast_svg">{icons[type]}</div>
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
          <span style={{ display: "inline-block", lineHeight: 0 }}>
            &#10005;
          </span>
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
        duration: payload.duration ?? 999999,
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
