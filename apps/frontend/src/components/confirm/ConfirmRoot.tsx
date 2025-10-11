// src/components/confirm/ConfirmRoot.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModalContext, type ConfirmOptions } from "../../hook/ModalContext";
import "./confirm.css";

type InternalState = ConfirmOptions & {
  _resolve?: (ok: boolean) => void;
  open: boolean;
};

const defaultTexts = {
  confirmText: "Xác nhận",
  cancelText: "Hủy",
};

const ConfirmRoot: React.FC = () => {
  const { _registerConfirmDispatcher } = useModalContext();
  const [state, setState] = useState<InternalState>({
    message: "",
    open: false,
  });

  // Tạo root cho portal nếu chưa có
  const portalEl =
    document.getElementById("confirm-root") ||
    (() => {
      const el = document.createElement("div");
      el.id = "confirm-root";
      document.body.appendChild(el);
      return el;
    })();

  const close = useCallback((ok: boolean) => {
    setState((s) => {
      s._resolve?.(ok);
      return { ...s, open: false, _resolve: undefined };
    });
  }, []);

  const dispatchRef = useRef<
    ((opts: ConfirmOptions) => Promise<boolean>) | null
  >(null);
  dispatchRef.current = (opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setState({
        open: true,
        message: opts.message,
        title: opts.title,
        confirmText: opts.confirmText,
        cancelText: opts.cancelText,
        variant: opts.variant || "default",
        _resolve: resolve,
      });
    });

  useEffect(() => {
    // Đăng ký "dispatcher" cho Provider
    _registerConfirmDispatcher((opts) => dispatchRef.current!(opts));
  }, [_registerConfirmDispatcher]);

  // Close khi nhấn ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!state.open) return;
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.open, close]);

  if (!state.open) return null;

  return createPortal(
    <div className="confirm__overlay" onClick={() => close(false)}>
      <div
        className={`confirm__modal ${
          state.variant === "danger" ? "confirm__modal--danger" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {state.title && <h3 className="confirm__title">{state.title}</h3>}
        <p className="confirm__message">{state.message}</p>
        <div className="confirm__actions">
          <button className="confirm__btn cancel" onClick={() => close(false)}>
            {state.cancelText || defaultTexts.cancelText}
          </button>
          <button className="confirm__btn confirm" onClick={() => close(true)}>
            {state.confirmText || defaultTexts.confirmText}
          </button>
        </div>
      </div>
    </div>,
    portalEl
  );
};

export default ConfirmRoot;
