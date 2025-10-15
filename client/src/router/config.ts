import type { NavItem, RouteConfig } from '@/types/route';

// 路由配置映射
export const routeConfigMap = new Map<string, RouteConfig>([]);

// 导航配置映射
export const navConfigMap = new Map<string, NavItem>([]);

// 获取路由配置数组
export const getRouteConfigs = (): RouteConfig[] => {
  return Array.from(routeConfigMap.values());
};

// 获取导航配置数组
export const getNavItems = (): NavItem[] => {
  return Array.from(navConfigMap.values()).filter((item) => !item.hidden);
};

// 根据路径获取路由配置
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Array.from(routeConfigMap.values()).find((route) => route.path === path);
};

// 根据路径获取导航项 - 使用ES7语法优化
export const getNavItemByPath = (path: string): NavItem | undefined => {
  return Array.from(navConfigMap.values()).find((item) => item.path === path);
};
