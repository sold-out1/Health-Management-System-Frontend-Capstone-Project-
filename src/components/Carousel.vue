<template>
  <div class="hero-carousel-container">
    <div v-if="carouselItems.length === 0">
      暂无轮播图数据
    </div>
    <div v-else>
      <div class="title">
        {{ carouselItems[currentCarouselIndex].title }}
      </div>
      <div class="summary">
        {{ carouselItems[currentCarouselIndex].subtitle }}
        <span @click="handleDetail(carouselItems[currentCarouselIndex])">
          <i class="el-icon-document-copy"></i>查看详情
        </span>
      </div>
      <div class="cover-point">
        <div class="item-point">
          <img
            v-for="(item, index) in carouselItems"
            :key="index"
            :src="item.image"
            :alt="item.title"
            :style="{ border: currentCarouselIndex === index ? '2px solid rgb(23, 197, 116)' : '' }"
            @click="changeCarousel(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HeroCarousel",
  props: {
    showBtn: {
      type: Boolean,
      default: true
    },
    containerHeight: {
      type: String,
      default: 'auto'
    },
    carouselItems: {
      type: Array,
      default: () => [],
      validator: value => value.every(item => item.image && item.title && item.subtitle)
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      currentCarouselIndex: 0,
      carouselInterval: null
    }
  },
  computed: {
    currentItem() {
      return this.carouselItems[this.currentCarouselIndex] || {}
    }
  },
  mounted() {
    this.startCarousel()
  },
  beforeDestroy() {
    clearInterval(this.carouselInterval)
  },
  methods: {
    handleDetail(obj) {
      this.$emit('obj-detail', obj)
    },
    changeCarousel(index) {
      this.currentCarouselIndex = index
      this.resetCarousel()
    },
    startCarousel() {
      if (this.carouselItems.length <= 1) return
      
      this.carouselInterval = setInterval(() => {
        this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselItems.length
      }, this.interval)
    },
    resetCarousel() {
      clearInterval(this.carouselInterval)
      this.startCarousel()
    }
  }
}
</script>

<style scoped lang="scss">
.hero-carousel-container {
    font-size: 12px;
    padding: 30px;
    border-radius: 15px;
    /* 保留你的蓝色渐变 */
    background: linear-gradient(90deg, #6bb8ff, #57aaff);
    color: #fff;
    overflow: hidden;
    position: relative;

    /* ✨ 轮播淡入动画 */
    .title, .summary {
        animation: fadeUp 0.5s ease forwards;
        opacity: 0;
        transform: translateY(10px);
    }

    .title {
        animation-delay: 0.05s;
        font-size: 26px;
        font-weight: 600;
        min-height: 50px;
    }

    .summary {
        animation-delay: 0.15s;
        font-size: 16px;
        margin-block: 10px;
        line-height: 30px;
        min-height: 70px;

        span {
            display: inline-block;
            background-color: rgb(245, 245, 46);
            padding: 4px 10px;
            border-radius: 20px;
            cursor: pointer;
            color: rgb(51, 51, 51);
            font-size: 14px;
            transition: all 0.2s ease;

            &:hover {
                background-color: rgb(237, 237, 12);
                transform: translateY(-2px);
                box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            }
        }
    }

    .cover-point {
        display: flex;
        justify-content: flex-end;

        .item-point {
            display: flex;
            background-color: rgba(255, 255, 255, 0.15);
            padding: 8px;
            border-radius: 6px;
            gap: 8px;
            backdrop-filter: blur(4px);

            img {
                width: 60px;
                height: 40px;
                border-radius: 6px;
                object-fit: cover;
                cursor: pointer;
                border: 2px solid rgba(255, 255, 255, 0.3);
                transition: all 0.25s ease;

                /* 鼠标 hover 效果 */
                &:hover {
                    transform: scale(1.08);
                    border-color: #ffffff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                }
            }

            /* 当前选中状态美化 */
            img[style*="2px solid rgb(23, 197, 116)"] {
                border-color: #fff !important;
                transform: scale(1.12);
                box-shadow: 0 0 10px rgba(255,255,255,0.8);
            }
        }
    }
}

/* ✨ 淡入+轻微上移动画 */
@keyframes fadeUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>