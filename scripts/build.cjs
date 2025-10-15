#!/usr/bin/env node
"use strict";
const { spawn } = require("child_process");
const { loadEnv } = require("./utils/env-loader.cjs");
const logger = require("./utils/logger.cjs");

async function build() {
	const env = process.argv[2] || "production";

	// 加载对应环境变量
	loadEnv(env);

	logger.info(`开始构建 (${env} 环境)...`);

	try {
		// 清理旧构建产物
		logger.info("清理旧构建产物...");
		await runCommand("pnpm", ["-F", "rsbuild-monorepo-demo-client", "clean"]);

		// 构建前端应用
		logger.info("构建前端应用...");
		await runCommand("pnpm", ["-F", "rsbuild-monorepo-demo-client", "build"]);

		logger.success("构建完成!");
	} catch (error) {
		logger.error("构建失败:", error.message);
		process.exit(1);
	}
}

function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, args, {
			stdio: "inherit",
			shell: true,
			cwd: process.cwd(),
		});

		childProcess.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`命令执行失败，退出码: ${code}`));
			}
		});

		childProcess.on("error", (error) => {
			reject(error);
		});
	});
}

build().catch((error) => {
	logger.error("构建过程出错:", error);
	process.exit(1);
});
