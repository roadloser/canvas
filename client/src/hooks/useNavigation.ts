import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_STYLES } from '@/constants/navigation';
import { getNavItemByPath, getNavItems } from '@/router/config';
import type { NavItem } from '@/types/route';

// 导航状态类型
type NavState = 'active' | 'inactive' | 'disabled';

// 导航项扩展类型
interface EnhancedNavItem extends NavItem {
  isActive: boolean;
  className: string;
  state: NavState;
}

// 导航Hook
export const useNavigation = () => {
  const location = useLocation();

  // 获取当前路径
  const currentPath = location.pathname;

  // 检查路径是否匹配
  const isPathActive = useCallback(
    (path: string): boolean => {
      return currentPath === path || (path !== '/' && currentPath.startsWith(path));
    },
    [currentPath]
  );

  // 获取导航状态
  const getNavState = useCallback(
    (path: string): NavState => {
      return isPathActive(path) ? 'active' : 'inactive';
    },
    [isPathActive]
  );

  // 获取导航样式类名
  const getNavClassName = useCallback((state: NavState): string => {
    const baseClass = NAV_STYLES.base;
    const stateClass = NAV_STYLES.states.get(state) ?? '';
    return `${baseClass} ${stateClass}`.trim();
  }, []);

  // 增强的导航项
  const enhancedNavItems = useMemo((): EnhancedNavItem[] => {
    const navItems = getNavItems();

    return navItems.map((item) => {
      const state = getNavState(item.path);
      const isActive = state === 'active';
      const className = getNavClassName(state);

      return {
        ...item,
        isActive,
        className,
        state,
      };
    });
  }, [getNavState, getNavClassName]);

  // 当前导航项
  const currentNavItem = useMemo(() => {
    return getNavItemByPath(currentPath);
  }, [currentPath]);

  // 面包屑导航
  const breadcrumbs = useMemo(() => {
    const segments = currentPath.split('/').filter(Boolean);
    const crumbs: Array<{ path: string; label: string }> = [{ path: '/', label: '首页' }];

    let currentSegmentPath = '';
    for (const segment of segments) {
      currentSegmentPath += `/${segment}`;
      const navItem = getNavItemByPath(currentSegmentPath);

      if (navItem) {
        crumbs.push({
          path: currentSegmentPath,
          label: navItem.label,
        });
      }
    }

    return crumbs;
  }, [currentPath]);

  return {
    navItems: enhancedNavItems,
    currentNavItem,
    currentPath,
    breadcrumbs,
    isPathActive,
    getNavState,
    getNavClassName,
  };
};
