const nodemailer = require("nodemailer");
const emailConfig = require("../config/email.config");

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: emailConfig.host,
			port: emailConfig.port,
			secure: emailConfig.secure,
			auth: emailConfig.auth,
		});
	}

	/**
	 * Send a 6-digit OTP to the given email address.
	 */
	async sendOtpEmail(to, otp) {
		const mailOptions = {
			from: `"Capstone Auth" <${emailConfig.from}>`,
			to,
			subject: "Your Verification Code",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
					<h2 style="color: #111827; margin-bottom: 8px;">Email Verification</h2>
					<p style="color: #6b7280; font-size: 14px;">Use the code below to verify your account. It expires in <strong>10 minutes</strong>.</p>
					<div style="background: #111827; color: #ffffff; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 8px; margin: 24px 0; font-weight: bold;">
						${otp}
					</div>
					<p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
				</div>
			`,
		};

		return this.transporter.sendMail(mailOptions);
	}
}

module.exports = EmailService;
