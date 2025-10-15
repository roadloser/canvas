#!/usr/bin/env node
"use strict";
const { spawn } = require("child_process");
const logger = require("./utils/logger.cjs");

async function clean() {
	logger.info("开始清理项目...");

	try {
		// 清理前端构建产物
		logger.info("清理前端构建产物...");
		await runCommand("pnpm", ["-F", "rsbuild-monorepo-demo-client", "clean"]);

		// 清理根目录 node_modules
		logger.info("清理根目录依赖...");
		await runCommand("rm", ["-rf", "node_modules"]);

		logger.success("清理完成!");
	} catch (error) {
		logger.error("清理失败:", error.message);
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

clean().catch((error) => {
	logger.error("清理过程出错:", error);
	process.exit(1);
});
