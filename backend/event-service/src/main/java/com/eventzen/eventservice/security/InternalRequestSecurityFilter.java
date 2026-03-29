package com.eventzen.eventservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InternalRequestSecurityFilter extends OncePerRequestFilter {

    private final Map<String, Long> replayCache = new ConcurrentHashMap<>();

    @Value("${internal-service.secret:}")
    private String internalServiceSecret;

    @Value("${internal-signature.ttl-ms:60000}")
    private long signatureTtlMs;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator") || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String secret = trimToEmpty(internalServiceSecret);
        if (secret.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        String providedSecret = trimToEmpty(request.getHeader("X-Internal-Secret"));
        String timestamp = trimToEmpty(request.getHeader("X-Internal-Timestamp"));
        String serviceName = trimToEmpty(request.getHeader("X-Internal-Service"));
        String signature = trimToEmpty(request.getHeader("X-Internal-Signature"));

        if (!secret.equals(providedSecret)) {
            reject(response, "Invalid internal service secret");
            return;
        }

        if (timestamp.isEmpty() || serviceName.isEmpty() || signature.isEmpty()) {
            reject(response, "Internal signature headers are required");
            return;
        }

        long timestampMs;
        try {
            timestampMs = Long.parseLong(timestamp);
        } catch (NumberFormatException exception) {
            reject(response, "Invalid internal signature timestamp");
            return;
        }

        long nowMs = System.currentTimeMillis();
        purgeExpiredReplayEntries(nowMs);

        if (Math.abs(nowMs - timestampMs) > signatureTtlMs) {
            reject(response, "Internal signature expired");
            return;
        }

        String method = request.getMethod().toUpperCase();
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String signedPath = query == null || query.isBlank() ? path : path + "?" + query;

        String expectedSignature;
        try {
            expectedSignature = createSignature(secret, timestamp, method, signedPath, serviceName);
        } catch (Exception exception) {
            reject(response, "Invalid internal request signature");
            return;
        }

        if (!timingSafeHexEquals(expectedSignature, signature)) {
            reject(response, "Invalid internal request signature");
            return;
        }

        String replayKey = serviceName + ":" + signature;
        if (replayCache.putIfAbsent(replayKey, nowMs + signatureTtlMs) != null) {
            reject(response, "Replay request detected");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void purgeExpiredReplayEntries(long nowMs) {
        Iterator<Map.Entry<String, Long>> iterator = replayCache.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Long> entry = iterator.next();
            if (entry.getValue() <= nowMs) {
                iterator.remove();
            }
        }
    }

    private static String createSignature(String secret, String timestamp, String method, String path, String service) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal((timestamp + "." + method + "." + path + "." + service).getBytes(StandardCharsets.UTF_8));
        return toHex(digest);
    }

    private static boolean timingSafeHexEquals(String expectedHex, String providedHex) {
        byte[] expected = fromHex(expectedHex);
        byte[] provided = fromHex(providedHex);
        if (expected == null || provided == null || expected.length != provided.length) {
            return false;
        }
        return MessageDigest.isEqual(expected, provided);
    }

    private static byte[] fromHex(String value) {
        if (value == null || (value.length() % 2) != 0) {
            return null;
        }

        int length = value.length() / 2;
        byte[] output = new byte[length];
        for (int i = 0; i < length; i++) {
            int hi = Character.digit(value.charAt(i * 2), 16);
            int lo = Character.digit(value.charAt(i * 2 + 1), 16);
            if (hi < 0 || lo < 0) {
                return null;
            }
            output[i] = (byte) ((hi << 4) + lo);
        }
        return output;
    }

    private static String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte current : bytes) {
            builder.append(String.format("%02x", current));
        }
        return builder.toString();
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\",\"statusCode\":401}");
    }
}
