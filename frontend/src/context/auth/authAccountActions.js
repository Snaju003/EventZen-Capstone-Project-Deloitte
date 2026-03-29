import { updateMeSchema } from "@/lib/auth-schemas";
import {
  approveVendorRoleRequest,
  authApi,
  extractPayload,
  extractUser,
  getMessage,
  getPendingVendorRoleRequests,
  requestEmailChangeOtp as requestEmailChangeOtpApi,
  requestVendorRole,
  verifyEmailChangeOtp as verifyEmailChangeOtpApi,
} from "@/lib/auth-api";

export function createAuthAccountActions({
  clearAuthState,
  fetchMe,
  setUser,
  withLoading,
}) {
  const updateMe = async (values) => withLoading(async () => {
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

  const requestEmailChangeOtp = async (newEmail) => withLoading(async () => {
    const payload = await requestEmailChangeOtpApi(newEmail);
    return {
      payload,
      message: payload?.message || "OTP sent to your new email.",
    };
  });

  const verifyEmailChangeOtp = async (otp) => withLoading(async () => {
    const payload = await verifyEmailChangeOtpApi(otp);
    const nextUser = payload?.user || (await fetchMe());
    setUser(nextUser);

    return {
      payload,
      user: nextUser,
      message: payload?.message || "Email updated successfully.",
    };
  });

  const uploadAvatar = async (file) => withLoading(async () => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await authApi.post("/avatar", formData);
    const nextUser = await fetchMe();

    return {
      user: nextUser,
      message: getMessage(response),
    };
  });

  const deleteMe = async () => withLoading(async () => {
    const response = await authApi.delete("/me");
    clearAuthState();

    return {
      payload: extractPayload(response),
      message: getMessage(response),
    };
  });

  const requestVendorAccess = async () => withLoading(async () => {
    const payload = await requestVendorRole();
    const nextUser = payload?.user || (await fetchMe());
    setUser(nextUser);

    return {
      payload,
      user: nextUser,
      message: payload?.message || "Vendor role request submitted.",
    };
  });

  const loadPendingVendorRequests = async () => withLoading(async () => getPendingVendorRoleRequests());

  const approveVendorRequest = async (userId) => withLoading(async () => {
    const payload = await approveVendorRoleRequest(userId);
    return {
      payload,
      message: payload?.message || "Vendor role approved.",
    };
  });

  return {
    approveVendorRequest,
    deleteMe,
    loadPendingVendorRequests,
    requestEmailChangeOtp,
    requestVendorAccess,
    updateMe,
    uploadAvatar,
    verifyEmailChangeOtp,
  };
}
