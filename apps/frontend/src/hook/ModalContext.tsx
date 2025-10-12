// src/hook/ModalContext.tsx
import React, { createContext, useContext, useRef } from "react";

/* ===== Toast types (đã có) ===== */
export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPayload = {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, default 5000
};

type ToastListener = (payload: ToastPayload) => void;

/* ===== Confirm types (mới) ===== */
export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string; // default "Xác nhận"
  cancelText?: string; // default "Hủy"
  variant?: "default" | "danger";
};
type ConfirmDispatcher = (opts: ConfirmOptions) => Promise<boolean>;

/* ===== API hook ===== */
type OpenNotifyFn =
  | ((payload: ToastPayload) => void)
  | ((
      message: string,
      type?: ToastType,
      title?: string,
      duration?: number
    ) => void);

type ModalContextType = {
  openNotify: OpenNotifyFn;
  subscribeNotify: (cb: ToastListener) => () => void;

  // NEW:
  openConfirm: ConfirmDispatcher;
  // ConfirmRoot sẽ "đăng ký" dispatcher này vào Provider
  _registerConfirmDispatcher: (fn: ConfirmDispatcher) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  /* ===== Toast ===== */
  const toastListenersRef = useRef(new Set<ToastListener>());

  const publishToast = (payload: ToastPayload) => {
    const merged = { duration: 5000, type: "info" as ToastType, ...payload };
    toastListenersRef.current.forEach((fn) => fn(merged));
  };

  const openNotify: OpenNotifyFn = (...args: any[]) => {
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
  };

  const subscribeNotify = (cb: ToastListener) => {
    toastListenersRef.current.add(cb);
    return () => toastListenersRef.current.delete(cb);
  };

  /* ===== Confirm ===== */
  const confirmDispatcherRef = useRef<ConfirmDispatcher | null>(null);

  const _registerConfirmDispatcher = (fn: ConfirmDispatcher) => {
    confirmDispatcherRef.current = fn;
  };

  const openConfirm: ConfirmDispatcher = async (opts) => {
    // Nếu ConfirmRoot chưa mount thì fallback window.confirm để không chặn luồng dev
    if (!confirmDispatcherRef.current) {
      return Promise.resolve(window.confirm(opts?.message || "Xác nhận?"));
    }
    return confirmDispatcherRef.current(opts);
  };

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

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModalContext must be used within ModalProvider");
  return ctx;
};
