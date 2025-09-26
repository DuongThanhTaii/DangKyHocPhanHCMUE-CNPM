// import { configureStore } from "@reduxjs/toolkit";
// import { api } from "./api";
// import authReducer from "../features/auth/slice";

// export const store = configureStore({
//   reducer: {
//     [api.reducerPath]: api.reducer,
//     auth: authReducer,
//   },
//   middleware: (gDM) => gDM().concat(api.middleware),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux"; // 👈 type-only
import authReducer from "../features/auth/authSlice";

export const store = configureStore({ reducer: { auth: authReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
