const express = require("express");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const AuthController = require("../controllers/auth.controller");
const AuthService = require("../services/auth.service");
const AuthMiddleware = require("../middleware/auth.middleware");
const PasswordHasher = require("../utils/hashPassword");
const JwtTokenService = require("../utils/generateToken");
const EmailService = require("../utils/emailService");
const jwtConfig = require("../config/jwt.config");
const upload = require("../middleware/upload.middleware");
const mediaUpload = require("../middleware/media-upload.middleware");
const { requireInternalService } = require("../middleware/internal.middleware");

const router = express.Router();

// ── Dependency wiring ───────────────────────────────────────────
const passwordHasher = new PasswordHasher();
const tokenService = new JwtTokenService({ config: jwtConfig });
const emailService = new EmailService();

const authService = new AuthService({
	userModel: User,
	refreshTokenModel: RefreshToken,
	passwordHasher,
	tokenService,
	emailService,
});
const authController = new AuthController({ authService });
const authMiddleware = new AuthMiddleware({ tokenService });

// ── Public routes ───────────────────────────────────────────────
router.post("/register", authController.register);
router.get("/csrf-token", authController.getCsrfToken);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);

// ── Authenticated routes ────────────────────────────────────────
router.get("/me", authMiddleware.authenticate, authController.getMe);
router.put("/me", authMiddleware.authenticate, authController.updateMe);
router.post("/me/email-change/request", authMiddleware.authenticate, authController.requestEmailChangeOtp);
router.post("/me/email-change/verify", authMiddleware.authenticate, authController.verifyEmailChangeOtp);
router.delete("/me", authMiddleware.authenticate, authController.deleteMe);
router.post("/avatar", authMiddleware.authenticate, upload.single("avatar"), authController.uploadAvatar);
router.post("/media/images", authMiddleware.authenticate, mediaUpload.array("images", 10), authController.uploadMediaImages);
router.post("/reset-password", authMiddleware.authenticateResetToken, authController.resetPassword);
router.patch("/users/:id/promote", authMiddleware.authenticate, authController.promoteUser);
router.post("/vendor-role/request", authMiddleware.authenticate, authController.requestVendorRole);
router.get("/vendor-role/requests", authMiddleware.authenticate, authController.getVendorRoleRequests);
router.patch("/vendor-role/requests/:id/approve", authMiddleware.authenticate, authController.approveVendorRoleRequest);
router.post("/users/bulk", authMiddleware.authenticate, authController.getUsersByIdsForAdmin);

// ── Internal service routes ─────────────────────────────────────
router.post("/internal/users/bulk", requireInternalService, authController.getUsersByIds);

module.exports = router;
