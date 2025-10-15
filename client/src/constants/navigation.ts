// 导航状态映射
export const NAV_STATE_MAP = new Map([
  ['active', 'bg-primary-100 text-primary-700'],
  ['inactive', 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'],
  ['disabled', 'text-gray-400 cursor-not-allowed'],
]);

// 导航样式配置
export const NAV_STYLES = {
  base: 'rounded-md px-3 py-2 font-medium text-responsive-sm transition-colors',
  states: NAV_STATE_MAP,
  mobile: {
    base: 'block px-4 py-3 font-medium text-responsive-base transition-colors',
    active: 'bg-primary-50 text-primary-700 border-r-2 border-primary-600',
    inactive: 'text-gray-900 hover:bg-gray-50',
  },
} as const;

// 响应式断点
export const BREAKPOINTS = new Map([
  ['sm', '640px'],
  ['md', '768px'],
  ['lg', '1024px'],
  ['xl', '1280px'],
]);

// 动画配置
export const ANIMATIONS = {
  transition: 'transition-colors duration-200 ease-in-out',
  hover: 'hover:scale-105 transform transition-transform duration-150',
} as const;
