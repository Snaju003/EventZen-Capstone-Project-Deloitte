import { createContext, useEffect, useRef, useState } from "react";

import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  updateMeSchema,
  verifyOtpSchema,
} from "@/lib/auth-schemas";
import {
  authApi,
  extractPayload,
  extractTokens,
  extractUser,
  getMessage,
} from "@/lib/auth-api";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const PENDING_VERIFICATION_KEY = "auth.pendingVerification";

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
  const [accessToken, setAccessToken] = useState(() => readStorage(ACCESS_TOKEN_KEY));
  const [storedRefreshToken, setStoredRefreshToken] = useState(() =>
    readStorage(REFRESH_TOKEN_KEY),
  );
  const [pendingVerification, setPendingVerificationState] = useState(() =>
    readPendingVerification(),
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const initialTokensRef = useRef({
    accessToken: readStorage(ACCESS_TOKEN_KEY),
    refreshToken: readStorage(REFRESH_TOKEN_KEY),
  });

  const setTokens = ({ accessToken: nextAccessToken, refreshToken: nextRefreshToken }) => {
    const safeAccessToken = nextAccessToken || null;
    const safeRefreshToken = nextRefreshToken || null;

    setAccessToken(safeAccessToken);
    setStoredRefreshToken(safeRefreshToken);
    writeStorage(ACCESS_TOKEN_KEY, safeAccessToken);
    writeStorage(REFRESH_TOKEN_KEY, safeRefreshToken);
  };

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
    setTokens({ accessToken: null, refreshToken: null });
  };

  const getAuthorizedConfig = (tokenOverride) => {
    const token = tokenOverride || accessToken;

    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchMe = async (tokenOverride) => {
    const response = await authApi.get("/me", getAuthorizedConfig(tokenOverride));
    const payload = extractPayload(response);
    const nextUser = extractUser(payload) || payload;

    setUser(nextUser);
    return nextUser;
  };

  const withLoading = async (task) => {
    setIsLoading(true);

    try {
      return await task();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthToken = async () => {
    const response = await authApi.post(
      "/refresh-token",
      storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
    );
    const payload = extractPayload(response);
    const tokens = extractTokens(payload);

    if (!tokens.accessToken && !tokens.refreshToken) {
      throw new Error("Refresh token response did not include new tokens.");
    }

    setTokens({
      accessToken: tokens.accessToken || accessToken,
      refreshToken: tokens.refreshToken || storedRefreshToken,
    });

    const nextUser = extractUser(payload);
    if (nextUser) {
      setUser(nextUser);
    }

    return payload;
  };

  const login = async (values) =>
    withLoading(async () => {
      const parsedValues = loginSchema.parse(values);
      const response = await authApi.post("/login", parsedValues);
      const payload = extractPayload(response);
      const tokens = extractTokens(payload);

      setTokens(tokens);

      const nextUser = extractUser(payload) || (await fetchMe(tokens.accessToken));
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
      const response = await authApi.post("/resend-otp", parsedValues);

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
      const tokens = extractTokens(payload);

      if (tokens.accessToken || tokens.refreshToken) {
        setTokens(tokens);
      }

      const nextUser = extractUser(payload);
      if (nextUser) {
        setUser(nextUser);
      }

      setPendingVerification(defaultPendingVerification);

      return {
        payload,
        message: getMessage(response),
      };
    });

  const updateMe = async (values) =>
    withLoading(async () => {
      const parsedValues = updateMeSchema.parse(values);
      const response = await authApi.put("/me", parsedValues, getAuthorizedConfig());
      const payload = extractPayload(response);
      const nextUser = extractUser(payload) || payload;

      setUser(nextUser);
      return {
        user: nextUser,
        message: getMessage(response),
      };
    });

  const deleteMe = async () =>
    withLoading(async () => {
      const response = await authApi.delete("/me", getAuthorizedConfig());
      clearAuthState();
      return {
        payload: extractPayload(response),
        message: getMessage(response),
      };
    });

  const logout = async () =>
    withLoading(async () => {
      try {
        await authApi.post(
          "/logout",
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          getAuthorizedConfig(),
        );
      } finally {
        clearAuthState();
      }
    });

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const initialAccessToken = initialTokensRef.current.accessToken;
        const initialRefreshToken = initialTokensRef.current.refreshToken;

        if (initialAccessToken) {
          const meResponse = await authApi.get("/me", {
            headers: {
              Authorization: `Bearer ${initialAccessToken}`,
            },
          });
          const mePayload = extractPayload(meResponse);

          if (active) {
            setUser(extractUser(mePayload) || mePayload);
          }
        } else if (initialRefreshToken) {
          const refreshResponse = await authApi.post("/refresh-token", {
            refreshToken: initialRefreshToken,
          });
          const refreshPayload = extractPayload(refreshResponse);
          const tokens = extractTokens(refreshPayload);

          if (active) {
            setTokens({
              accessToken: tokens.accessToken || initialAccessToken,
              refreshToken: tokens.refreshToken || initialRefreshToken,
            });
          }

          if (extractUser(refreshPayload)) {
            if (active) {
              setUser(extractUser(refreshPayload));
            }
          } else if (tokens.accessToken) {
            const meResponse = await authApi.get("/me", {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });
            const mePayload = extractPayload(meResponse);

            if (active) {
              setUser(extractUser(mePayload) || mePayload);
            }
          }
        }
      } catch {
        if (active) {
          setUser(null);
          setTokens({ accessToken: null, refreshToken: null });
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken: storedRefreshToken,
        pendingVerification,
        isAuthenticated: Boolean(user && accessToken),
        isInitializing,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        requestPasswordOtp,
        refreshSession: refreshAuthToken,
        logout,
        fetchMe,
        updateMe,
        deleteMe,
        setPendingVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
