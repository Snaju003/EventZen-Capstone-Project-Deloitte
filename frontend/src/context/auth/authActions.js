import { createAuthAccountActions } from "@/context/auth/authAccountActions";
import { createAuthSessionActions } from "@/context/auth/authSessionActions";

export function createAuthActions({
  clearAuthState,
  fetchMe,
  pendingVerification,
  setIsLoading,
  setPendingResetToken,
  setPendingVerification,
  setUser,
}) {
  const withLoading = async (task) => {
    setIsLoading(true);
    try {
      return await task();
    } finally {
      setIsLoading(false);
    }
  };

  const sessionActions = createAuthSessionActions({
    clearAuthState,
    fetchMe,
    pendingVerification,
    setPendingResetToken,
    setPendingVerification,
    setUser,
    withLoading,
  });

  const accountActions = createAuthAccountActions({
    clearAuthState,
    fetchMe,
    setUser,
    withLoading,
  });

  return {
    ...sessionActions,
    ...accountActions,
  };
}
