import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { selectAuth } from "../features/auth/authSlice";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, token } = useAppSelector(selectAuth);

  // ✅ Log chi tiết hơn
  console.log("🔍 AuthGuard Debug:", {
    hasToken: !!token,
    tokenLength: token?.length,
    userExists: !!user,
    userId: user?.id,
    userRole: user?.loaiTaiKhoan,
    requiredRole,
    roleMatch: user?.loaiTaiKhoan === requiredRole,
  });

  // ✅ Check từng điều kiện riêng
  if (!token) {
    console.log("❌ No token - redirect to login");
    return <Navigate to="/" replace />;
  }

  if (!user) {
    console.log("❌ No user object - redirect to login");
    return <Navigate to="/" replace />;
  }

  if (user.loaiTaiKhoan !== requiredRole) {
    console.log(
      `❌ Role mismatch: got "${user.loaiTaiKhoan}", need "${requiredRole}"`
    );
    return <Navigate to="/" replace />;
  }

  console.log("✅ Auth passed - rendering children");
  return <>{children}</>;
}
