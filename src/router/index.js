import Vue from "vue";
import VueRouter from "vue-router";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { clearToken, getToken, getRole } from "@/utils/storage.js";
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI);
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: '/login'
  },
  {
    path: "/login",
    name: 'login',
    component: () => import(`@/views/login/Login.vue`)
  },
  {
    path: "/recipe-detail",
    name: 'recipeDetail',
    component: () => import(`@/views/user/RecipeDetail.vue`)
  },
  {
    path: "/health-news-detail",
    name: 'healthNewsDetail',
    component: () => import(`@/views/user/HealthNewsDetail.vue`)
  },
  {
    path: "/health-record",
    name: 'healthRecord',
    component: () => import(`@/views/user/HealthRecord.vue`)
  },
  {
    path: "/my-diet",
    name: 'MyDiet',
    component: () => import(`@/views/user/MyDiet.vue`)
  },
  {
    path: "/register",
    component: () => import(`@/views/register/Register.vue`)
  },
  {
    path: "/admin",
    component: () => import(`@/views/admin/Home.vue`),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: "/admin-layout",
        name: '仪表盘',
        icon: 'el-icon-pie-chart',
        show: true,
        component: () => import(`@/views/admin/Main.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/user-manage",
        name: '用户管理',
        show: true,
        icon: 'el-icon-user',
        component: () => import(`@/views/admin/UserManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/health-news-manage",
        name: '健康资讯管理',
        show: true,
        icon: 'el-icon-tickets',
        component: () => import(`@/views/admin/HealthNewsManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/health-model-manage",
        name: '健康模型管理',
        show: true,
        icon: 'el-icon-takeaway-box',
        component: () => import(`@/views/admin/HealthModelManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/health-record-manage",
        name: '健康记录管理',
        show: true,
        icon: 'el-icon-c-scale-to-original',
        component: () => import(`@/views/admin/HealthRecordManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/evaluations-manage",
        name: '评论管理',
        show: true,
        icon: 'el-icon-chat-dot-round',
        component: () => import(`@/views/admin/EvaluationsManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/recipe-manage",
        name: '食谱管理',
        show: true,
        icon: 'el-icon-tickets',
        component: () => import(`@/views/admin/RecipeManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/diet-history-manage",
        name: '饮食记录',
        show: true,
        icon: 'el-icon-shopping-cart-full',
        component: () => import(`@/views/admin/DietHistoryManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/update-password",
        name: '修改个人密码',
        show: false, // 不在导航栏里面显示
        component: () => import(`@/views/admin/UpdatePassword.vue`),
        meta: { requireAuth: true },
      },
    ]
  },
  {
    path: "/user",
    component: () => import(`@/views/user/Main.vue`),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: "/home",
        name: '首页',
        component: () => import(`@/views/user/Home.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/my-goal",
        name: '我的目标',
        component: () => import(`@/views/user/MyGoal.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/recipe-list",
        name: '食谱列表',
        component: () => import(`@/views/user/RecipeList.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/health-data",
        name: '健康数据',
        component: () => import(`@/views/user/HealthData.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/collection-folder",
        name: '收藏夹',
        component: () => import(`@/views/user/CollectionFolder.vue`),
        meta: { requireAuth: true },
      },
      {
        path: 'record-choice',
        name: 'RecordChoice',
        component: () => import(`@/views/user/RecordChoice.vue`),
        meta: { title: '选择记录方式' }
      },
      {
        path: 'bluetooth-sync',
        name: 'BluetoothSync',
        component: () => import('@/views/user/BluetoothSync.vue'),
        meta: { title: '蓝牙同步' }
      },
        {
         path: '/ai-assistant',
         name: 'AiAssistant',
         component: () => import('@/views/user/AiAssistant.vue'), // 确保路径对应刚才创建的文件
         meta: { title: 'AI 智能助手' }
         },
         {
          path: '/ai-report',
          name: 'AiReport',
          component: () => import('@/views/user/AiReport.vue'), // 确保路径正确
          meta: { title: 'AI 智能报告', icon: 'el-icon-magic-stick' }
          }
    ]
  }
];
const router = new VueRouter({
  routes,
  mode: 'history'
});
router.beforeEach((to, from, next) => {
  // 放行登录页和注册页
  if (to.path === '/login' || to.path === '/register') {
    return next();
  }

  // 检查需要认证的路由
  if (to.matched.some(record => record.meta.requireAuth)) {
    const token = getToken();

    // 未登录情况处理
    if (!token) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath } // 记录目标路由
      });
    }

    // 已登录时的权限检查
    try {
      const role = parseInt(getRole());

      // 管理员路径检查
      if (to.matched[0].path === '/admin' && role !== 1) {
        clearToken();
        return next("/login"); //返回登录页
      }

      // 用户路径检查
      if (to.matched[0].path === '/user' && role !== 2) {
        clearToken();
        return next("/login"); //返回登录页
      }

      return next();
    } catch (error) {
      console.error('权限检查失败:', error);
      return next('/login');
    }
  }

  // 普通页面直接放行
  next();
});
export default router;
