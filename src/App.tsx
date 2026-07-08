import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { router } from "./routes/router";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}
