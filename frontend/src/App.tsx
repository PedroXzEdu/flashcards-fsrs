import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { SkeletonPage } from "./components/SkeletonCard";
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

export default function App() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <Routes>
        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/register"
          element={
            <ErrorBoundary>
              <RegisterPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <StatsGlobalPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/shared/:token"
          element={
            <ErrorBoundary>
              <SharedDeckPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/decks/:id"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DeckPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/decks/:id/review"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <ReviewPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/decks/:id/stats"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <StatsPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
