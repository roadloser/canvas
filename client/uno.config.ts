// TODO 暂且只能放在rsbuild的同级目录，有时间再看如何放在根目录下

import presetAttributify from '@unocss/preset-attributify';
import presetIcons from '@unocss/preset-icons';
import presetUno from '@unocss/preset-uno';
import { defineConfig } from 'unocss';

export default defineConfig({
  content: {
    filesystem: ['./src/**/*.{html,js,ts,jsx,tsx}', './src/**/*.tsx', './src/**/*.ts'],
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  shortcuts: {
    // 基础布局
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',

    // 移动端导航（保留必要的响应式功能）
    'nav-mobile': 'fixed inset-0 z-50 bg-white lg:hidden',
    'nav-overlay': 'fixed inset-0 bg-black bg-opacity-25',
    'nav-panel': 'relative flex h-full w-full max-w-xs flex-col bg-white shadow-xl',
    'nav-item-mobile': 'block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50',

    // 汉堡菜单
    hamburger:
      'inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden',
    'hamburger-line': 'block h-0.5 w-6 bg-current transition-all duration-300',
  },
  theme: {
    // 自定义断点
    breakpoints: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    // 4的倍数间距系统
    spacing: {
      '0': '0px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '32': '128px',
    },
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
  },
  rules: [
    ['reset', { '*': { margin: 0, padding: 0 } }],
    ['box-border', { '*': { 'box-sizing': 'border-box' } }],
  ],
});
