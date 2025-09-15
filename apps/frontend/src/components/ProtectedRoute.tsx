import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { ROLE_HOME } from "../features/auth/roleMap";
import type { Role } from "../features/auth/types";

type Props = { allow: Role[]; redirectIfNoAuth?: string };

export default function ProtectedRoute({
  allow,
  redirectIfNoAuth = "/login",
}: Props) {
  const { token, user } = useAppSelector((s) => s.auth);

  if (!token || !user) return <Navigate to={redirectIfNoAuth} replace />;

  if (!allow.includes(user.loai_tai_khoan)) {
    return <Navigate to={ROLE_HOME[user.loai_tai_khoan]} replace />;
  }
  return <Outlet />;
}
