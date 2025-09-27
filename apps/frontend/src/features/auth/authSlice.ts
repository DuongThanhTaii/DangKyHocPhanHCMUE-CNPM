import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
type User = {
  id?: string;
  ho_ten?: string;
  loai_tai_khoan?: string;
  ma_so_sinh_vien?: string;
  ma_so_nhan_vien?: string;
};

type AuthState = { token: string | null; user: User | null };

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    },
  },
});

export const { setCredentials, logout } = slice.actions;
export const selectAuth = (s: { auth: AuthState }) => s.auth;
export default slice.reducer;
