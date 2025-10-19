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
        <div className="confirm__icon--wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              fill="#f50057"
              d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"
            />
          </svg>
        </div>
        <div className="confirm__message__container">
          <p className="confirm__message">{state.message}</p>
          <h6 className="confirm__message__h6">Chọn hủy để quay lại</h6>
        </div>
        <div className="confirm__actions">
          <button className="confirm__btn cancel" onClick={() => close(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                fill="#f50057"
                d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"
              />
            </svg>
            {state.cancelText || defaultTexts.cancelText}
          </button>
          <button className="confirm__btn confirm" onClick={() => close(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                fill="#143266"
                d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
              />
            </svg>
            {/* {state.confirmText || defaultTexts.confirmText} */}
          </button>
        </div>
      </div>
    </div>,
    portalEl
  );
};

export default ConfirmRoot;
