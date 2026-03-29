module.exports = {
	async getMe(req, res, next) {
		try {
			const user = await this.authService.getCurrentUser(req.user.sub);
			return res.status(200).json({ user });
		} catch (error) {
			return next(error);
		}
	},

	async updateMe(req, res, next) {
		try {
			const user = await this.authService.updateCurrentUser(req.user.sub, req.body);
			return res.status(200).json({
				message: "User updated successfully",
				user,
			});
		} catch (error) {
			return next(error);
		}
	},

	async deleteMe(req, res, next) {
		try {
			const result = await this.authService.deleteCurrentUser(req.user.sub);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},

	async uploadAvatar(req, res, next) {
		try {
			const user = await this.authService.uploadAvatar(req.user.sub, req.file);
			return res.status(200).json({
				message: "Avatar uploaded successfully",
				user,
			});
		} catch (error) {
			return next(error);
		}
	},

	async requestEmailChangeOtp(req, res, next) {
		try {
			const result = await this.authService.requestEmailChangeOtp(req.user.sub, req.body || {});
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},

	async verifyEmailChangeOtp(req, res, next) {
		try {
			const result = await this.authService.verifyEmailChangeOtp(req.user.sub, req.body || {});
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},

	async uploadMediaImages(req, res, next) {
		try {
			const result = await this.authService.uploadMediaImages(req.user, req.files, req.body?.folder);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},
};
