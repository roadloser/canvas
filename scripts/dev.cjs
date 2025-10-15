#!/usr/bin/env node
"use strict";
const { spawn } = require("child_process");
const { loadEnv } = require("./utils/env-loader.cjs");
const logger = require("./utils/logger.cjs");

async function dev() {
	// 加载开发环境变量
	loadEnv("development");

	logger.info("启动前端开发环境...");

	// 启动前端开发服务器
	const clientProcess = spawn(
		"pnpm",
		["-F", "rsbuild-monorepo-demo-client", "dev"],
		{
			stdio: "inherit",
			shell: true,
			cwd: process.cwd(),
		},
	);

	// 处理进程退出
	clientProcess.on("close", (code) => {
		if (code !== 0) {
			logger.error(`前端开发服务器退出，退出码: ${code}`);
			process.exit(code);
		}
	});

	// 优雅关闭
	process.on("SIGINT", () => {
		logger.info("正在关闭开发服务器...");
		clientProcess.kill("SIGINT");
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		logger.info("正在关闭开发服务器...");
		clientProcess.kill("SIGTERM");
		process.exit(0);
	});
}

dev().catch((error) => {
	logger.error("启动开发环境失败:", error);
	process.exit(1);
});
