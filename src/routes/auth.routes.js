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
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// ── Authenticated routes ────────────────────────────────────────
router.get("/me", authMiddleware.authenticate, authController.getMe);
router.put("/me", authMiddleware.authenticate, authController.updateMe);
router.delete("/me", authMiddleware.authenticate, authController.deleteMe);

module.exports = router;
