"use strict";
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

function formatTime() {
	return new Date().toLocaleTimeString();
}

function info(message, ...args) {
	console.log(
		`${colors.cyan}[${formatTime()}] INFO:${colors.reset}`,
		message,
		...args,
	);
}

function success(message, ...args) {
	console.log(
		`${colors.green}[${formatTime()}] SUCCESS:${colors.reset}`,
		message,
		...args,
	);
}

function warning(message, ...args) {
	console.log(
		`${colors.yellow}[${formatTime()}] WARNING:${colors.reset}`,
		message,
		...args,
	);
}

function error(message, ...args) {
	console.error(
		`${colors.red}[${formatTime()}] ERROR:${colors.reset}`,
		message,
		...args,
	);
}

module.exports = {
	info,
	success,
	warning,
	error,
};
