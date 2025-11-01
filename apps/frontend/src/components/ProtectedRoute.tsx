import { Navigate, Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAppSelector } from "../app/hooks";
import { ROLE_HOME } from "../features/auth/roleMap";
import type { Role } from "../features/auth/types";

type Props = PropsWithChildren<{
  allow?: Role[];
  redirectIfNoAuth?: string;
}>;

export default function ProtectedRoute({
  allow,
  redirectIfNoAuth = "/",
  children,
}: Props) {
  const { token, user } = useAppSelector((s) => s.auth);

  if (!token || !user) return <Navigate to={redirectIfNoAuth} replace />;

  const role = user.loaiTaiKhoan as Role | undefined;
  if (allow && (!role || !allow.includes(role))) {
    const redirectPath =
      role && ROLE_HOME[role] ? ROLE_HOME[role] : redirectIfNoAuth;
    return <Navigate to={redirectPath} replace />;
  }

  // If used as a wrapper, render children; otherwise render nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
}
