import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom"; // <-- import RouterProvider
import { store } from "./app/store";
import router from "./router"; // <-- import router
import "./index.css";
import "./styles/reset.css"; // (global) nếu bạn dùng

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
