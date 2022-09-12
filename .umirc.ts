import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
  ],
  npmClient: 'yarn',
  proxy: {
    '/api2': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api2': '' },
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/FE-build-client/' : '/' 
});