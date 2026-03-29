const emailConfig = {
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: parseInt(process.env.SMTP_PORT, 10) || 587,
	secure: false, // true for 465, false for 587
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	from: process.env.SMTP_FROM || process.env.SMTP_USER,
};

module.exports = emailConfig;
