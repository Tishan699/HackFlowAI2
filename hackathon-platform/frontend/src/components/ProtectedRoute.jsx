import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center bg-[#120c0b] rounded-2xl border border-red-900/60 m-6 shadow-2xl">
        <h2 className="text-xl font-bold text-red-500 mb-2 font-heading">Access Restricted</h2>
        <p className="text-zinc-400 text-sm">
          Your account role (<span className="capitalize font-bold text-orange-400">{user.role}</span>) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return children;
}

