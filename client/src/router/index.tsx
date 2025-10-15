import type React from 'react';
import { Suspense } from 'react';
import { createBrowserRouter, Outlet, type RouteObject, RouterProvider } from 'react-router-dom';
import type { RouteConfig } from '@/types/route';
import { getRouteConfigs } from './config';

// 路由布局组件
const RootLayout: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-gray-600 text-lg">加载中...</div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};

// 将路由配置转换为React Router格式
const transformRouteConfig = (config: RouteConfig): RouteObject => {
  const { element: Component, children, path, index, errorElement: ErrorElement } = config;

  const routeObject: RouteObject = {
    path,
    element: <Component />,
    ...(index !== undefined && { index }),
    ...(ErrorElement && { errorElement: <ErrorElement /> }),
  };

  if (children) {
    routeObject.children = children.map(transformRouteConfig);
  }

  return routeObject;
};

// 创建路由器
const createAppRouter = () => {
  const routeConfigs = getRouteConfigs();

  const routes = [
    {
      path: '/',
      element: <RootLayout />,
      children: routeConfigs.map(transformRouteConfig),
    },
  ];

  return createBrowserRouter(routes);
};

// 路由提供者组件
const AppRouter: React.FC = () => {
  const router = createAppRouter();

  return <RouterProvider router={router} />;
};

export default AppRouter;
