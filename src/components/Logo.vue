<template>
  <div class="logo-container">
    <img
      src="/logo.png"
      alt="Logo"
      class="logo-image"
      :style="{ width: logoSize + 'px', height: logoSize + 'px' }"
    >

    <transition name="fade">
      <span
        v-if="!collapsed"
        class="logo-text"
        :style="{
          color: textColor,
          fontSize: fontSize + 'px',
          opacity: textOpacity
        }"
      >
        {{ sysName }}
      </span>
    </transition>
  </div>
</template>

<script>
export default {
  name: "AppLogo",
  props: {
    sysName: {
      type: String,
      default: ""
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    textColor: {
      type: String,
      default: "rgb(51,51,51)"
    },
    logoSize: {
      type: Number,
      default: 34   // 让 logo 稍微大一点更协调
    },
    fontSize: {
      type: Number,
      default: 20  // 让标题看起来更精致
    }
  },
  data() {
    return {
      textOpacity: 1
    };
  },
  watch: {
    collapsed(newVal) {
      if (newVal) {
        this.textOpacity = 0;
      } else {
        setTimeout(() => {
          this.textOpacity = 1;
        }, 10);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.logo-container {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 14px;
  gap: 10px;
  user-select: none;
  overflow: hidden;
}

/* logo 加一点圆角 + 阴影 更现代 */
.logo-image {
  flex-shrink: 0;
  border-radius: 10px;
  /* 轻微阴影，提升质感 */
  box-shadow: 0 0 4px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.logo-text {
  font-weight: 600;
  letter-spacing: 0.5px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  white-space: nowrap;
  transition: all 0.3s ease;
}

/* 文字淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
