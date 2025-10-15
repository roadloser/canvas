import type { ComponentType, LazyExoticComponent } from 'react';

// 路由元数据接口
export interface RouteMetadata {
  title: string;
  description?: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
  hidden?: boolean;
}

// 路由配置接口
export interface RouteConfig {
  path: string;
  element: ComponentType | LazyExoticComponent<ComponentType>;
  metadata: RouteMetadata;
  children?: RouteConfig[];
  index?: boolean;
  errorElement?: ComponentType;
}

// 导航项接口
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  children?: NavItem[];
  hidden?: boolean;
}

// 路由状态常量对象
export const RouteStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
} as const;

// 路由状态类型
export type RouteStatusType = (typeof RouteStatus)[keyof typeof RouteStatus];

// 路由上下文类型
export interface RouteContextType {
  currentRoute?: RouteConfig;
  isLoading: boolean;
  error?: Error;
}
