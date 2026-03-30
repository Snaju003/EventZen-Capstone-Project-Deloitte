import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "@/App.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <MotionConfig reducedMotion="user">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: "14px",
                  background: "#fff",
                  color: "#1e293b",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  fontFamily: "'Geist Variable', sans-serif",
                  boxShadow: "0 16px 48px -16px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                  padding: "12px 16px",
                },
                success: {
                  iconTheme: { primary: "#059669", secondary: "#ecfdf5" },
                },
                error: {
                  iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
                },
              }}
            />
            <App />
          </MotionConfig>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
