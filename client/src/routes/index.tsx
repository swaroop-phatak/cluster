import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

function Placeholder({ name }: { name: string }) {
  return <div>{name}</div>;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/clusters",
        element: <Placeholder name="Cluster Feed" />,
      },
      {
        path: "/clusters/:id",
        element: <Placeholder name="Cluster Detail" />,
      },
      {
        path: "/companies/:id",
        element: <Placeholder name="Company Dashboard" />,
      },
      {
        path: "/insiders/:id",
        element: <Placeholder name="Insider Profile" />,
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/watchlist",
            element: <Placeholder name="Watchlist" />,
          },
          {
            path: "/settings/notifications",
            element: <Placeholder name="Notification Settings" />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/clusters" replace />,
      },
    ],
  },
]);
