import { api } from "../../app/api";
import type { LoginRequest, LoginResponse } from "./types";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
  }),
});
//note
export const { useLoginMutation } = authApi;
