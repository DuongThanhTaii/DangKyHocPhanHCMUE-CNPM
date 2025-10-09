import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { selectAuth } from "../features/auth/authSlice";

export default function ProtectedRoute() {
  const { token } = useAppSelector(selectAuth);
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}
