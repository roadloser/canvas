"use strict";
module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				// 按需引入polyfill，减少打包体积
				useBuiltIns: "usage",
				// 使用core-js 3版本
				corejs: 3,
				// 精确配置目标环境，确保Babel只为指定的目标环境进行代码转换
				targets: "last 2 versions and not dead, > 0.2%",
				// 保持模块化结构，交给打包工具处理
				modules: false,
				loose: true,
			},
		],
		[
			"@babel/preset-react",
			{
				runtime: "automatic",
			},
		],
		[
			"@babel/preset-typescript",
			{
				isTSX: true,
				allExtensions: true,
			},
		],
	],
	plugins: [
		// 添加模块解析插件，用于路径别名的转换
		[
			"module-resolver",
			{
				// 指定项目根目录，用于正确解析相对路径
				root: ["."],
				// 定义路径别名映射关系
				alias: {
					"@": "./src",
					"@/components": "./src/components",
					"@/pages": "./src/pages",
					"@/router": "./src/router",
					"@/utils": "./src/utils",
					"@/assets": "./src/assets",
				},
				// 设置相对于client目录的根路径
				cwd: "packagejson",
			},
		],
	],
};
