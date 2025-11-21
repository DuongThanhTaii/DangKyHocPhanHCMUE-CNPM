import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // <-- type-only
import type { User } from "./types"; // <-- type-only

type AuthState = { token: string | null; user: User | null };

const persisted: AuthState = (() => {
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    return { token, user: userRaw ? (JSON.parse(userRaw) as User) : null };
  } catch {
    return { token: null, user: null };
  }
})();

const slice = createSlice({
  name: "auth",
  initialState: persisted,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = slice.actions;
export default slice.reducer;
