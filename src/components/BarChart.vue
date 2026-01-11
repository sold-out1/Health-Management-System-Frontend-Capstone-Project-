<template>
  <div class="bar-chart-container">
    <div class="chart-header">
      <span class="tag">{{ tag }}</span>
    </div>
    <div ref="chart" :style="{ width: '100%', height: height }" class="chart-wrapper"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'AnimatedBarChart',
  props: {
    height: { type: String, default: '300px' },
    tag: { type: String, default: '数据统计' },
    values: { type: Array, required: true },
    date: { type: Array, required: true },
    showControls: { type: Boolean, default: false },
    animationType: {
      type: String,
      default: 'ripple',
      validator: value => ['ripple', 'scale', 'bounce'].includes(value)
    }
  },
  data() {
    return {
      chart: null,
      currentAnimation: this.animationType,
      colorPalette: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'],
      resizeObserver: null,
      resizeTimer: null
    };
  },
  watch: {
    values: { deep: true, handler() { this.updateChart(); } },
    date: { deep: true, handler() { this.updateChart(); } }
  },
  mounted() {
    this.initChart();
    this.setupResizeObserver();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    this.cleanup();
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart) return;

      const option = {
        backgroundColor: 'transparent',
        grid: { left: '3%', right: '4%', top: '18%', bottom: '10%', containLabel: true },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => `
            <div style="padding:5px 10px;font-size:12px;">
              <div style="font-weight:bold;margin-bottom:5px">${params[0].name}</div>
              <div style="display:flex;align-items:center">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params[0].color};margin-right:5px"></span>
                ${params[0].seriesName}: <strong style="margin-left:5px">${params[0].value}</strong>
              </div>
            </div>`
        },
        xAxis: {
          type: 'category',
          data: this.date,
          axisLine: { lineStyle: { color: '#6B7280', type: 'dashed' } },
          axisTick: { alignWithLabel: true, lineStyle: { type: 'dashed', color: '#6B7280' } },
          axisLabel: { color: '#6B7280', interval: 0, rotate: this.date.length > 10 ? 45 : 0, fontSize: 12 },
          splitLine: { show: true, lineStyle: { type: 'dashed', color: '#E5E7EB' } }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#6B7280', type: 'dashed' } },
          axisTick: { lineStyle: { type: 'dashed', color: '#6B7280' } },
          axisLabel: { color: '#6B7280', fontSize: 12 },
          splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
        },
        series: [{
          name: this.tag,
          type: 'bar',
          barWidth: '60%',
          data: this.values,
          itemStyle: {
            color: params => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: this.colorPalette[params.dataIndex % this.colorPalette.length] },
              { offset: 1, color: this.colorPalette[(params.dataIndex + 4) % this.colorPalette.length] }
            ]),
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0,0,0,0.08)',
            shadowBlur: 6,
            shadowOffsetY: 3
          },
          label: {
            show: true,
            position: 'top',
            color: '#1F2937',
            fontSize: 12,
            formatter: '{c}'
          },
          emphasis: {
            itemStyle: { shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 12, shadowOffsetY: 5 }
          },
          animationType: this.currentAnimation,
          animationDuration: 1500,
          animationEasing: this.getAnimationEasing()
        }],
        dataZoom: this.date.length > 10 ? [{
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 40,
          height: 15,
          bottom: 5,
          handleSize: 0,
          backgroundColor: '#F3F4F6',
          dataBackground: { lineStyle: { color: '#D1D9E6', width: 1 }, areaStyle: { color: '#E5E7EB' } },
          fillerColor: 'rgba(84, 112, 198, 0.2)',
          borderColor: '#E5E7EB'
        }] : []
      };

      this.chart.setOption(option, true);
    },
    getAnimationEasing() {
      switch (this.currentAnimation) {
        case 'ripple': return 'elasticOut';
        case 'scale': return 'cubicOut';
        case 'bounce': return 'bounceOut';
        default: return 'cubicOut';
      }
    },
    handleResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => { this.chart && this.chart.resize(); }, 200);
    },
    setupResizeObserver() {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this.$refs.chart);
      }
    },
    cleanup() {
      if (this.chart) { this.chart.dispose(); this.chart = null; }
      if (this.resizeObserver) { this.resizeObserver.disconnect(); this.resizeObserver = null; }
      if (this.resizeTimer) { clearTimeout(this.resizeTimer); this.resizeTimer = null; }
      window.removeEventListener('resize', this.handleResize);
    }
  }
};
</script>

<style scoped lang="scss">
.bar-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff; /* 白色卡片风格 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;

  .chart-header {
    padding: 16px 20px;
    font-size: 20px;
    font-weight: 600;
    color: #1E3A8A; /* 深蓝色标题 */
  }

  .chart-wrapper {
    flex: 1;
    padding: 10px 20px;
  }
}

@media (max-width: 768px) {
  .bar-chart-container {
    .chart-header {
      font-size: 18px;
      padding: 12px 15px;
    }
  }
}
</style>
