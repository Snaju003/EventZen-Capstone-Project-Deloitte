import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from "@/lib/auth-schemas";
import {
  authApi,
  extractPayload,
  extractUser,
  getMessage,
} from "@/lib/auth-api";
import {
  defaultPendingVerification,
  RESET_TOKEN_KEY,
  writeStorage,
} from "@/context/auth/auth.storage";

export function createAuthSessionActions({
  clearAuthState,
  fetchMe,
  pendingVerification,
  setPendingResetToken,
  setPendingVerification,
  setUser,
  withLoading,
}) {
  const login = async (values) => withLoading(async () => {
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

  const register = async (values) => withLoading(async () => {
    const parsedValues = registerSchema.parse(values);
    const response = await authApi.post("/register", {
      name: parsedValues.name,
      email: parsedValues.email,
      password: parsedValues.password,
    });

    setPendingVerification({ email: parsedValues.email, purpose: "register" });

    return {
      payload: extractPayload(response),
      message: getMessage(response),
    };
  });

  const requestPasswordOtp = async (email) => withLoading(async () => {
    const parsedValues = requestOtpSchema.parse({ email });
    const response = await authApi.post("/forgot-password", parsedValues);

    setPendingVerification({ email: parsedValues.email, purpose: "password-reset" });

    return {
      payload: extractPayload(response),
      message: getMessage(response),
    };
  });

  const resendOtp = async (email) => withLoading(async () => {
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

  const verifyOtp = async ({ email, otp }) => withLoading(async () => {
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

  const verifyResetOtp = async ({ email, otp }) => withLoading(async () => {
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

  const resetPassword = async (newPassword, resetToken) => withLoading(async () => {
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

  const logout = async () => withLoading(async () => {
    try {
      await authApi.post("/logout", {});
    } finally {
      clearAuthState();
    }
  });

  return {
    login,
    logout,
    register,
    requestPasswordOtp,
    resendOtp,
    resetPassword,
    verifyOtp,
    verifyResetOtp,
  };
}
