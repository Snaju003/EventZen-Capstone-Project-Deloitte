const bcrypt = require("bcrypt");

class PasswordHasher {
	constructor({ bcryptLib = bcrypt, saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10 } = {}) {
		this.bcrypt = bcryptLib;
		this.saltRounds = saltRounds;
	}

	async hashPassword(plainPassword) {
		return this.bcrypt.hash(plainPassword, this.saltRounds);
	}

	async comparePassword(plainPassword, hashedPassword) {
		return this.bcrypt.compare(plainPassword, hashedPassword);
	}
}

module.exports = PasswordHasher;
