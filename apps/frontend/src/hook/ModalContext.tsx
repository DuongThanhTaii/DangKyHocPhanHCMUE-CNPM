// src/hook/ModalContext.tsx
import React, { createContext, useContext, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastPayload = {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, mặc định 5000
};

type Listener = (payload: ToastPayload) => void;

// 👇 overload type: cho phép gọi theo 2 kiểu
// Use overloaded call signatures so TS can resolve both call styles
type OpenNotifyFn = {
  (payload: ToastPayload): void;
  (message: string, type?: ToastType, title?: string, duration?: number): void;
};

type ModalContextType = {
  openNotify: OpenNotifyFn;
  subscribeNotify: (cb: Listener) => () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const listenersRef = useRef(new Set<Listener>());

  const publish = (payload: ToastPayload) => {
    const merged = { duration: 5000, type: "info" as ToastType, ...payload };
    listenersRef.current.forEach((fn) => fn(merged));
  };

  // 👇 triển khai hàm hỗ trợ cả 2 chữ ký
  const openNotify: OpenNotifyFn = (...args: any[]) => {
    if (typeof args[0] === "string") {
      const [message, type, title, duration] = args as [
        string,
        ToastType | undefined,
        string | undefined,
        number | undefined
      ];
      publish({ message, type, title, duration });
    } else {
      publish(args[0] as ToastPayload);
    }
  };

  const subscribeNotify = (cb: Listener) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  };

  return (
    <ModalContext.Provider value={{ openNotify, subscribeNotify }}>
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
