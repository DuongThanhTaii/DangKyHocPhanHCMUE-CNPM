// src/hook/ModalContext.tsx
import React, { createContext, useCallback, useContext, useRef } from "react";

/* =========================
 * Toast types
 * ========================= */
export type ToastType = "success" | "error" | "info" | "warning";

export type ToastPayload = {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, default 5000
};

type ToastListener = (payload: ToastPayload) => void;

/* =========================
 * Confirm types
 * ========================= */
export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string; // default "Xác nhận"
  cancelText?: string; // default "Hủy"
  variant?: "default" | "danger";
};

type ConfirmDispatcher = (opts: ConfirmOptions) => Promise<boolean>;

/* =========================
 * Public API types
 * ========================= */

// Overload thay vì union function-type để TS suy luận chính xác
export type OpenNotifyFn = {
  (payload: ToastPayload): void;
  (message: string, type?: ToastType, title?: string, duration?: number): void;
};

type ModalContextType = {
  // Toast
  openNotify: OpenNotifyFn;
  subscribeNotify: (cb: ToastListener) => () => void;

  // Confirm
  openConfirm: ConfirmDispatcher;
  // Cho phép đăng ký HOẶC gỡ dispatcher (null khi unmount)
  _registerConfirmDispatcher: (fn: ConfirmDispatcher | null) => void;
};

/* =========================
 * Context & Provider
 * ========================= */

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  /* ---------- Toast ---------- */
  const toastListenersRef = useRef(new Set<ToastListener>());

  const publishToast = useCallback((payload: ToastPayload) => {
    const merged: ToastPayload = {
      duration: 3000,
      type: "info",
      ...payload,
    };
    toastListenersRef.current.forEach((fn) => fn(merged));
  }, []);

  const openNotify = useCallback<OpenNotifyFn>(
    (...args: any[]) => {
      if (typeof args[0] === "string") {
        const [message, type, title, duration] = args as [
          string,
          ToastType | undefined,
          string | undefined,
          number | undefined
        ];
        publishToast({ message, type, title, duration });
      } else {
        publishToast(args[0] as ToastPayload);
      }
    },
    [publishToast]
  );

  const subscribeNotify = useCallback((cb: ToastListener) => {
    toastListenersRef.current.add(cb);
    return () => {
      toastListenersRef.current.delete(cb);
    };
  }, []);

  /* ---------- Confirm ---------- */
  const confirmDispatcherRef = useRef<ConfirmDispatcher | null>(null);

  const _registerConfirmDispatcher = useCallback(
    (fn: ConfirmDispatcher | null) => {
      confirmDispatcherRef.current = fn;
    },
    []
  );

  const openConfirm: ConfirmDispatcher = useCallback(async (opts) => {
    // Nếu ConfirmRoot chưa mount → fallback window.confirm để không chặn luồng dev
    if (!confirmDispatcherRef.current) {
      return Promise.resolve(window.confirm(opts?.message ?? "Xác nhận?"));
    }
    return confirmDispatcherRef.current(opts);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        openNotify,
        subscribeNotify,
        openConfirm,
        _registerConfirmDispatcher,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

/* =========================
 * Hook
 * ========================= */

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModalContext must be used within ModalProvider");
  return ctx;
};
