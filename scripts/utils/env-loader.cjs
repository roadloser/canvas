"use strict";
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");

function loadEnv(environment = "development") {
	const envFiles = [
		`.env.${environment}.local`,
		".env.local",
		`.env.${environment}`,
		".env",
	];

	for (const file of envFiles) {
		const envPath = path.resolve(__dirname, "../../env", file);
		if (fs.existsSync(envPath)) {
			config({ path: envPath });
			console.log(`✓ Loaded environment variables from ${file}`);
		}
	}

	// 设置 NODE_ENV
	process.env.NODE_ENV = environment;
}

module.exports = { loadEnv };
