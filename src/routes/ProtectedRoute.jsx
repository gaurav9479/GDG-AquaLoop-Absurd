import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While Firebase checks auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Checking authentication...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow access
  return children;
}
