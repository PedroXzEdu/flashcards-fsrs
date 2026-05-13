import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/decks/DashboardPage";
import DeckPage from "./pages/decks/DeckPage";
import ReviewPage from "./pages/review/ReviewPage";
import StatsPage from "./pages/decks/StatsPage";
import StatsGlobalPage from "./pages/StatsGlobalPage";
import SharedDeckPage from "./pages/SharedDeckPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <PrivateRoute>
            <StatsGlobalPage />
          </PrivateRoute>
        }
      />
      <Route path="/shared/:token" element={<SharedDeckPage />} />
      <Route
        path="/decks/:id"
        element={
          <PrivateRoute>
            <DeckPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
      <Route
        path="/decks/:id/review"
        element={
          <PrivateRoute>
            <ReviewPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/decks/:id/stats"
        element={
          <PrivateRoute>
            <StatsPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
