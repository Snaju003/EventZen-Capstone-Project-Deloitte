import { createContext, useCallback, useEffect, useState } from "react";

import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  updateMeSchema,
  verifyOtpSchema,
} from "@/lib/auth-schemas";
import {
  approveVendorRoleRequest,
  authApi,
  ensureCsrfToken,
  extractPayload,
  extractUser,
  getMessage,
  getPendingVendorRoleRequests,
  requestVendorRole,
} from "@/lib/auth-api";

const PENDING_VERIFICATION_KEY = "auth.pendingVerification";
const RESET_TOKEN_KEY = "auth.resetToken";
const LEGACY_ACCESS_TOKEN_KEY = "auth.accessToken";
const LEGACY_REFRESH_TOKEN_KEY = "auth.refreshToken";

const defaultPendingVerification = {
  email: "",
  purpose: "register",
};

const AuthContext = createContext(null);

function readStorage(key) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;

  if (!value) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, value);
}

function readPendingVerification() {
  const rawValue = readStorage(PENDING_VERIFICATION_KEY);

  if (!rawValue) return defaultPendingVerification;

  try {
    return JSON.parse(rawValue);
  } catch {
    return defaultPendingVerification;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingVerification, setPendingVerificationState] = useState(() =>
    readPendingVerification(),
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResetToken, setPendingResetToken] = useState(() =>
    readStorage(RESET_TOKEN_KEY),
  );

  const setPendingVerification = (value) => {
    const nextValue = value?.email ? value : defaultPendingVerification;

    setPendingVerificationState(nextValue);
    writeStorage(
      PENDING_VERIFICATION_KEY,
      nextValue.email ? JSON.stringify(nextValue) : null,
    );
  };

  const clearAuthState = () => {
    setUser(null);
  };

  const fetchMe = useCallback(async () => {
    const response = await authApi.get("/me");
    const payload = extractPayload(response);
    const nextUser = extractUser(payload) || payload;

    setUser(nextUser);
    return nextUser;
  }, []);

  const withLoading = async (task) => {
    setIsLoading(true);

    try {
      return await task();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthToken = useCallback(async () => {
    const response = await authApi.post("/refresh-token", {});
    const payload = extractPayload(response);
    const nextUser = extractUser(payload) || (await fetchMe());

    setUser(nextUser);
    return payload;
  }, [fetchMe]);

  const login = async (values) =>
    withLoading(async () => {
      const parsedValues = loginSchema.parse(values);
      const response = await authApi.post("/login", parsedValues);
      const payload = extractPayload(response);

      const nextUser = extractUser(payload) || (await fetchMe());
      setUser(nextUser);

      return {
        user: nextUser,
        message: getMessage(response),
      };
    });

  const register = async (values) =>
    withLoading(async () => {
      const parsedValues = registerSchema.parse(values);
      const response = await authApi.post("/register", {
        name: parsedValues.name,
        email: parsedValues.email,
        password: parsedValues.password,
      });

      setPendingVerification({
        email: parsedValues.email,
        purpose: "register",
      });

      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const requestPasswordOtp = async (email) =>
    withLoading(async () => {
      const parsedValues = requestOtpSchema.parse({ email });
      const response = await authApi.post("/forgot-password", parsedValues);

      setPendingVerification({
        email: parsedValues.email,
        purpose: "password-reset",
      });

      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const resendOtp = async (email) =>
    withLoading(async () => {
      const parsedValues = requestOtpSchema.parse({
        email: email || pendingVerification.email,
      });
      const response = await authApi.post("/resend-otp", parsedValues);

      setPendingVerification({
        email: parsedValues.email,
        purpose: pendingVerification.purpose || "register",
      });

      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const verifyOtp = async ({ email, otp }) =>
    withLoading(async () => {
      const parsedValues = verifyOtpSchema.parse({
        email: email || pendingVerification.email,
        otp,
      });
      const response = await authApi.post("/verify-otp", parsedValues);
      const payload = extractPayload(response);

      let nextUser = extractUser(payload);

      if (!nextUser) {
        try {
          nextUser = await fetchMe();
        } catch {
          nextUser = null;
        }
      }

      if (nextUser) {
        setUser(nextUser);
      }

      setPendingVerification(defaultPendingVerification);

      return {
        payload,
        message: getMessage(response),
        user: nextUser || null,
        isLoggedIn: Boolean(nextUser),
      };
    });

  const verifyResetOtp = async ({ email, otp }) =>
    withLoading(async () => {
      const parsedValues = verifyOtpSchema.parse({
        email: email || pendingVerification.email,
        otp,
      });
      const response = await authApi.post("/verify-reset-otp", parsedValues);
      const payload = extractPayload(response);

      const resetToken = payload?.resetToken || response?.data?.resetToken || null;

      setPendingResetToken(resetToken);
      writeStorage(RESET_TOKEN_KEY, resetToken);
      setPendingVerification(defaultPendingVerification);

      return {
        payload,
        resetToken,
        message: getMessage(response),
      };
    });

  const resetPassword = async (newPassword, resetToken) =>
    withLoading(async () => {
      const response = await authApi.post(
        "/reset-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${resetToken}` } },
      );

      setPendingResetToken(null);
      writeStorage(RESET_TOKEN_KEY, null);

      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const updateMe = async (values) =>
    withLoading(async () => {
      const parsedValues = updateMeSchema.parse(values);
      const response = await authApi.put("/me", parsedValues);
      const payload = extractPayload(response);
      const nextUser = extractUser(payload) || payload;

      setUser(nextUser);
      return {
        user: nextUser,
        message: getMessage(response),
      };
    });

  const uploadAvatar = async (file) =>
    withLoading(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await authApi.post("/avatar", formData);
      const nextUser = await fetchMe();

      return {
        user: nextUser,
        message: getMessage(response),
      };
    });

  const deleteMe = async () =>
    withLoading(async () => {
      const response = await authApi.delete("/me");
      clearAuthState();
      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const requestVendorAccess = async () =>
    withLoading(async () => {
      const payload = await requestVendorRole();
      const nextUser = payload?.user || (await fetchMe());
      setUser(nextUser);

      return {
        payload,
        user: nextUser,
        message: payload?.message || "Vendor role request submitted.",
      };
    });

  const loadPendingVendorRequests = async () =>
    withLoading(async () => {
      const requests = await getPendingVendorRoleRequests();
      return requests;
    });

  const approveVendorRequest = async (userId) =>
    withLoading(async () => {
      const payload = await approveVendorRoleRequest(userId);
      return {
        payload,
        message: payload?.message || "Vendor role approved.",
      };
    });

  const logout = async () =>
    withLoading(async () => {
      try {
        await authApi.post("/logout", {});
      } finally {
        clearAuthState();
      }
    });

  useEffect(() => {
    writeStorage(LEGACY_ACCESS_TOKEN_KEY, null);
    writeStorage(LEGACY_REFRESH_TOKEN_KEY, null);

    let active = true;

    const bootstrap = async () => {
      try {
        await ensureCsrfToken();
      } catch {
        // Continue bootstrap; CSRF cookie can also be issued on login/refresh.
      }

      try {
        await fetchMe();
      } catch {
        try {
          await refreshAuthToken();
        } catch {
          if (active) {
            setUser(null);
          }
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [fetchMe, refreshAuthToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingVerification,
        isAuthenticated: Boolean(user),
        isInitializing,
        isLoading,
        login,
        register,
        verifyOtp,
        verifyResetOtp,
        resendOtp,
        requestPasswordOtp,
        resetPassword,
        pendingResetToken,
        refreshSession: refreshAuthToken,
        logout,
        fetchMe,
        updateMe,
        uploadAvatar,
        deleteMe,
        requestVendorAccess,
        loadPendingVendorRequests,
        approveVendorRequest,
        setPendingVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
