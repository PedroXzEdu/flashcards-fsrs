import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

const DashboardPage = lazy(() => import("./pages/decks/DashboardPage"));
const DeckPage = lazy(() => import("./pages/decks/DeckPage"));
const ReviewPage = lazy(() => import("./pages/review/ReviewPage"));
const StatsPage = lazy(() => import("./pages/decks/StatsPage"));
const StatsGlobalPage = lazy(() => import("./pages/StatsGlobalPage"));
const SharedDeckPage = lazy(() => import("./pages/SharedDeckPage"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PageLoader() {
  return <div style={{ padding: 24, color: "var(--text-muted)" }}>Carregando...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
