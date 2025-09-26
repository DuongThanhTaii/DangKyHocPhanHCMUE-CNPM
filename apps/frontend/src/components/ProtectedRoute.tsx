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

    const role = user.loai_tai_khoan as Role | undefined;
    if (!role || !allow.includes(role)) {
      const redirectPath = role && ROLE_HOME[role] ? ROLE_HOME[role] : redirectIfNoAuth;
      return <Navigate to={redirectPath} replace />;
    }
  return <Outlet />;
}
