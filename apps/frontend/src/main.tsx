import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store";
import { SidebarProvider } from "./app/hooks/useSidebar";
import { router } from "./router";
import { ModalProvider } from "./hook/ModalContext";
import ToastContainer from "./components/toast/ToastContainer";
import "./components/toast/toast.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <SidebarProvider>
          <ModalProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </ModalProvider>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
