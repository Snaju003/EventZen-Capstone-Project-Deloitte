import { createContext, useCallback, useEffect, useRef, useState } from "react";

import {
  authApi,
  ensureCsrfToken,
  extractPayload,
  extractUser,
} from "@/lib/auth-api";
import { createAuthActions } from "@/context/auth/authActions";
import {
  defaultPendingVerification,
  LEGACY_ACCESS_TOKEN_KEY,
  LEGACY_REFRESH_TOKEN_KEY,
  readPendingVerification,
  readStorage,
  RESET_TOKEN_KEY,
  writeStorage,
  PENDING_VERIFICATION_KEY,
} from "@/context/auth/auth.storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingVerification, setPendingVerificationState] = useState(() => readPendingVerification());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResetToken, setPendingResetToken] = useState(() => readStorage(RESET_TOKEN_KEY));
  const authStateVersionRef = useRef(0);

  const bumpAuthStateVersion = useCallback(() => {
    authStateVersionRef.current += 1;
  }, []);

  const setPendingVerification = useCallback((value) => {
    const nextValue = value?.email ? value : defaultPendingVerification;

    setPendingVerificationState(nextValue);
    writeStorage(
      PENDING_VERIFICATION_KEY,
      nextValue.email ? JSON.stringify(nextValue) : null,
    );
  }, []);

  const clearAuthState = useCallback(() => {
    bumpAuthStateVersion();
    setUser(null);
  }, [bumpAuthStateVersion]);

  const fetchMe = useCallback(async () => {
    const requestVersion = authStateVersionRef.current;
    const response = await authApi.get("/me");
    const payload = extractPayload(response);
    const nextUser = extractUser(payload) || payload;

    if (requestVersion === authStateVersionRef.current) {
      setUser(nextUser);
    }
    return nextUser;
  }, []);

  const refreshAuthToken = useCallback(async () => {
    const requestVersion = authStateVersionRef.current;
    const response = await authApi.post("/refresh-token", {});
    const payload = extractPayload(response);
    const nextUser = extractUser(payload) || (await fetchMe());

    if (requestVersion === authStateVersionRef.current) {
      setUser(nextUser);
    }
    return payload;
  }, [fetchMe]);

  const {
    approveVendorRequest,
    deleteMe,
    loadPendingVendorRequests,
    login,
    logout,
    register,
    requestEmailChangeOtp,
    requestPasswordOtp,
    requestVendorAccess,
    resendOtp,
    resetPassword,
    updateMe,
    uploadAvatar,
    verifyEmailChangeOtp,
    verifyOtp,
    verifyResetOtp,
  } = createAuthActions({
    clearAuthState,
    fetchMe,
    pendingVerification,
    setIsLoading,
    setPendingResetToken,
    setPendingVerification,
    setUser,
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
        requestEmailChangeOtp,
        verifyEmailChangeOtp,
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
