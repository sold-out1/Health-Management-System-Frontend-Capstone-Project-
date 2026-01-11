<template>
  <div class="admin-layout">

    <!-- 左侧导航 -->
    <aside class="sidebar">
      <Menu
        @route-listener="route"
        :routes="adminRoutes"
        :bag="menuBgColor"
        @select="handleRouteSelect"
      />
    </aside>

    <!-- 主内容区 -->
    <main class="content-area">

      <!-- 顶部导航栏 -->
      <div class="top-info">
        <div class="route-title">{{ activeRoute.name }}</div>

        <div class="user-info">
          <el-dropdown trigger="click" placement="bottom-end">
            <span class="el-dropdown-link">
              <div class="dropdown-info">
                <img :src="userInfo.avatar" />
                <span>{{ userInfo.username }}</span>
              </div>
            </span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="dialogPasswordVisible = true">
                修改密码
              </el-dropdown-item>

              <el-dropdown-item @click.native="handleLoginOut">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容呈现区（卡片式） -->
      <div class="page-wrapper">
        <div class="page-card">
          <router-view></router-view>
        </div>
      </div>

    </main>

    <!-- 修改密码弹窗 -->
    <el-dialog
      title="修改密码"
      :visible.sync="dialogPasswordVisible"
      :closeOnClickModal="false"
      width="35%"
    >
      <UpdatePassword />
    </el-dialog>

  </div>
</template>

<script>
import { get } from "@/utils/request"
import router from "@/router/index";
import { clearToken, clearRole, clearUserInfo, setUserInfo } from "@/utils/storage"
import Menu from '@/components/Menu.vue';
import UpdatePassword from '@/views/admin/UpdatePassword.vue';

export default {
  name: "admin-layout",
  components: { Menu, UpdatePassword },
  data() {
    return {
      dialogPasswordVisible: false,
      adminRoutes: [],
      userInfo: {},
      activeRoute: {},
      menuBgColor: "rgb(255,255,255)"
    };
  },
  created() {
    this.loadAdminRoutes();
    this.checkTokenAndLoadUser();
    this.handleRouteSelect('/adminLayout');
  },
  methods: {
    handleLoginOut() {
      clearToken();
      clearRole();
      clearUserInfo();
      this.$message.success("退出登录成功");
      this.$router.push("/login");
    },

    route(activeRoute) {
      this.activeRoute = activeRoute;
    },

    handleRouteSelect(routePath) {
      const route = this.adminRoutes.find(r => r.path === routePath);
      if (route && this.$route.path !== routePath) {
        this.activeRoute = { ...route };
        this.$router.push(routePath);
      }
    },

    loadAdminRoutes() {
      const adminRoute = router.options.routes.find(r => r.path === "/admin");
      this.adminRoutes = (adminRoute && adminRoute.children) || [];
    },

    async checkTokenAndLoadUser() {
      try {
        const response = await get("user/auth");

        if (response.code === 400) {
          clearToken();
          this.$router.push("/login");
        }

        this.userInfo = response.data;
        setUserInfo(this.userInfo);

      } catch (error) {
        clearToken();
        this.$router.push("/login");
      }
    }
  }
};
</script>

<style scoped lang="scss">

/* 整体布局 */
.admin-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f5f7fa; /* 背景浅灰 */
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;

  /* 左侧导航栏 */
  .sidebar {
    width: 220px;
    background: #ffffff;
    border-right: 1px solid #e6e9ef;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
    z-index: 10;
  }

  /* 右侧主体区域 */
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    /* 顶部导航栏（现代后台样式） */
    .top-info {
      height: 64px;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      border-bottom: 1px solid #e6e9ef;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);

      .route-title {
        font-size: 20px;
        font-weight: 600;
        color: #2d3a4a;
      }

      .dropdown-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: #ffffff;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        cursor: pointer;
        transition: 0.2s;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);

        &:hover {
          background: #f5f7fa;
        }

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        span {
          font-size: 15px;
          font-weight: 500;
          color: #1d3557;
        }
      }
    }

    /* 页面主内容区（居中 + 留白） */
    .page-wrapper {
      flex: 1;
      padding: 24px 32px;
      overflow-y: auto;

      .page-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        min-height: calc(100vh - 140px);
        animation: fadein 0.2s ease-out;
      }
    }
  }
}

/* 淡入动画 */
@keyframes fadein {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>
