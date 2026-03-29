const crypto = require("crypto");

function getEventServiceBaseUrls() {
	const configuredUrls = [
		process.env.EVENT_SERVICE_URL,
		"http://event-service:8080",
		"http://localhost:8080",
	].filter((url) => typeof url === "string" && url.trim());

	return [...new Set(configuredUrls.map((url) => url.replace(/\/$/, "")))];
}

function buildInternalHeaders({ method, path }) {
  const secret = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();
  if (!secret) {
    return {};
  }

  const timestamp = Date.now().toString();
  const service = String(process.env.INTERNAL_CALLER_NAME || "auth-service").trim() || "auth-service";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${method}.${path}.${service}`)
    .digest("hex");

  return {
    "X-Internal-Secret": secret,
    "X-Internal-Timestamp": timestamp,
    "X-Internal-Service": service,
    "X-Internal-Signature": signature,
  };
}

async function syncApprovedVendor({ user, approver }) {
	const approverRole = approver?.role || "admin";
	const baseUrls = getEventServiceBaseUrls();

	if (!baseUrls.length) {
		return {
			ok: false,
			errorType: "config",
			lastError: "EVENT_SERVICE_URL is not configured",
		};
	}

	let lastError = "Unknown error";

  for (const baseUrl of baseUrls) {
    const endpoint = `${baseUrl}/vendors/role-sync`;
    const endpointUrl = new URL(endpoint);
    const method = "POST";
    const path = `${endpointUrl.pathname}${endpointUrl.search}` || "/";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": approver?._id?.toString() || "internal-auth-service",
          "X-User-Email": approver?.email || "internal-auth-service@eventzen.local",
          "X-User-Role": approverRole,
          ...buildInternalHeaders({ method, path }),
        },
				body: JSON.stringify({
					userId: user._id.toString(),
					name: user.name,
					contactEmail: user.email,
				}),
			});

			if (response.ok) {
				return { ok: true };
			}

			let message = "Failed to persist vendor record";
			try {
				const payload = await response.json();
				message = payload?.error || payload?.message || message;
			} catch {
				// Ignore JSON parse errors and fallback to default message.
			}

			lastError = `${message} (${endpoint})`;
		} catch (error) {
			lastError = `${error.message} (${endpoint})`;
		}
	}

	return {
		ok: false,
		errorType: "request",
		lastError,
	};
}

module.exports = {
	getEventServiceBaseUrls,
	syncApprovedVendor,
};
