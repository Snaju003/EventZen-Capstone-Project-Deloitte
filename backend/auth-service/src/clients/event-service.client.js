function getEventServiceBaseUrls() {
	const configuredUrls = [
		process.env.EVENT_SERVICE_URL,
		"http://event-service:8080",
		"http://localhost:8080",
	].filter((url) => typeof url === "string" && url.trim());

	return [...new Set(configuredUrls.map((url) => url.replace(/\/$/, "")))];
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

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-User-Id": approver?._id?.toString() || "internal-auth-service",
					"X-User-Email": approver?.email || "internal-auth-service@eventzen.local",
					"X-User-Role": approverRole,
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
