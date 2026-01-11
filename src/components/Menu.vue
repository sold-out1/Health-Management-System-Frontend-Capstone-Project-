<template>
  <div class="menu-wrapper">

    <!-- Logo -->
    <div class="logo">
      <img src="/logo.png" />
      <span class="logo-title">个人健康管理系统</span>
    </div>

    <!-- 主菜单 -->
    <ul class="menu" :style="{ backgroundColor: bag }">
      <li
        v-for="(item, index) in routes"
        :key="index"
        v-if="item.show"
        class="menu-item"
        :class="{ active: activeIndex === item.path }"
        @click="handleSelect(item.path)"
      >
        <div class="active-line" />
        <i :class="item.icon" class="menu-icon"></i>
        <span class="menu-title">{{ item.name }}</span>
      </li>
    </ul>

  </div>
</template>

<script>
export default {
  name: "Menu",
  props: {
    routes: { type: Array, required: true },
    bag: { type: String, default: "#ffffff" }
  },
  data() {
    return {
      activeIndex: ""
    };
  },
  created() {
    const saveLastPath = sessionStorage.getItem("activeMenuItem");

    if (!saveLastPath) {
      this.handleSelect(this.routes[0].path);
    } else {
      this.handleSelect(saveLastPath);
    }
  },
  methods: {
    handleSelect(index) {
      this.activeIndex = index;

      this.$emit("select", index);
      const routeObj = this.routes.find(r => r.path === index);
      this.$emit("route-listener", routeObj);

      sessionStorage.setItem("activeMenuItem", index);
    }
  }
};
</script>

<style scoped lang="scss">

.menu-wrapper {
  width: 100%;
  padding-top: 10px;
  box-sizing: border-box;
}

/* Logo区域 */
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  user-select: none;
  gap: 10px;

  img {
    width: 32px;
    height: 32px;
  }

  .logo-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3a4a;
  }
}

/* 菜单容器 */
.menu {
  list-style: none;
  padding: 14px 10px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 每一项 */
.menu-item {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  cursor: pointer;
  margin-bottom: 6px;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  position: relative;
  transition: all 0.18s ease;
  overflow: hidden;

  &:hover {
    background: #f1f5f9;
  }

  .menu-icon {
    margin-right: 10px;
    font-size: 18px;
  }

  .active-line {
    position: absolute;
    left: 0;
    width: 3px;
    height: 0;
    background: #3b82f6;
    border-radius: 0 4px 4px 0;
    transition: height 0.25s ease;
  }
}

/* 选中样式 */
.active {
  background: #e8f1ff;
  color: #1e3a8a;
  font-weight: 600;

  .active-line {
    height: 100%;
  }

  .menu-icon {
    color: #1e3a8a;
  }
}

/* 收缩模式（逻辑保留） */
.menu.collapsed .menu-item {
  justify-content: center;
  padding: 0;
}

.menu.collapsed .menu-icon {
  margin-right: 0;
}
</style>
