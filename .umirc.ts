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
    '/github': {
      target: 'https://api.github.com',
      changeOrigin: true,
      pathRewrite: { '^/github': '' },
    },
  },
  // history: {
  //   type: 'hash',
  // },
  publicPath: '/FE-build-client/',
  /* 
  4.0.19 bugs dumplcate path 
  https://github.com/umijs/umi/pull/9296 
  https://github.com/umijs/umi/issues/9287
  */
  base: '/FE-build-client/',
});
