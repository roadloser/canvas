import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import UnoCSS from '@unocss/postcss';
import { config } from 'dotenv';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
const env = process.env.NODE_ENV || 'development';
config({ path: path.resolve(__dirname, `../env/.env.${env}`) });

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          UnoCSS({
            // TODO 暂且只能放在rsbuild的同级目录，有时间再看如何放在根目录下
            // configOrPath: path.resolve(__dirname, '../uno.config.ts'),
          }),
        ],
      },
    },
    rspack: {
      module: {
        rules: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                configFile: '../babel.config.cjs',
              },
            },
          },
        ],
      },
    },
    // 构建分析配置
    bundlerChain: async (chain) => {
      if (process.env.BUILD_ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer');
        chain.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [
          {
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
          },
        ]);
      }
    },
  },
  html: {
    template: './public/index.html',
    title: process.env.APP_NAME || 'Rsbuild Monorepo Demo',
  },
  server: {
    port: Number(process.env.CLIENT_PORT) || 3000,
    host: process.env.CLIENT_HOST || 'localhost',
    open: process.env.OPEN_BROWSER === 'true',
  },
  dev: {
    hmr: process.env.HOT_RELOAD !== 'false',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@/components': './src/components',
      '@/pages': './src/pages',
      '@/router': './src/router',
      '@/utils': './src/utils',
      '@/assets': './src/assets',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  output: {
    distPath: {
      root: 'dist',
    },
    assetPrefix: process.env.PUBLIC_URL || '/',
    sourceMap: {
      js: process.env.BUILD_SOURCEMAP === 'true' ? 'source-map' : false,
    },
  },
});
