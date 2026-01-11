<template>
  <div class="dashboard-container">

    <div class="left">
      <!-- 静态数据 -->
      <div class="static-count">
        <div class="item">
          <div class="count">{{ staticCount.userCount }}人</div>
          <div class="label">存量用户</div>
        </div>
        <div class="item">
          <div class="count">{{ staticCount.modelCount }}套</div>
          <div class="label">收录模型</div>
        </div>
        <div class="item">
          <div class="count">{{ staticCount.healthNewsCount }}篇</div>
          <div class="label">收录资讯</div>
        </div>
        <div class="item">
          <div class="count">{{ staticCount.recipeCount }}本</div>
          <div class="label">收录食谱</div>
        </div>
      </div>

      <!-- 模型收录情况 - 折线图 -->
      <div class="chart-card">
        <LineChart
          :tooltipFormatter="customTooltip"
          @on-selected="onSelected"
          :height="lineChartHeight"
          :tag="lineChartTag"
          :values="values"
          :date="dateList"
        />
      </div>
    </div>

    <div class="right">
      <!-- 饼图卡片 -->
      <div class="chart-card">
        <PieCharts
          tag="资讯内容占比"
          value-format="{name}"
          tooltip-format="【{name}】分类下有{value}篇资讯，占比{percent}%"
          :height="pieHeight"
          :types="newsTypes"
          :values="newsValues"
        />
      </div>

      <div class="chart-card">
        <PieCharts
          tag="食谱内容占比"
          value-format="{name}"
          tooltip-format="【{name}】分类下有{value}本食谱，占比{percent}%"
          :height="pieHeight"
          :types="recipeTypes"
          :values="recipeValues"
        />
      </div>
    </div>

  </div>
</template>

<script>
import LineChart from '@/components/LineChart.vue';
import PieCharts from '@/components/PieCharts.vue';

export default {
  components: { LineChart, PieCharts },
  data() {
    return {
      values: [19, 20],
      dateList: ['8-2', '8-3'],
      lineChartHeight: '430px',
      lineChartTag: '健康模型收录情况',
      staticCount: {},
      days: 365, // 默认查询一年
      newsTypes: [],
      newsValues: [],
      pieHeight: '245px',
      recipeTypes: [],
      recipeValues: [],
    }
  },
  created() {
    this.fetchStaticCount();
    this.fetchModelInfo();
    this.fetchNewsContentType();
    this.fetchRecipeContentType();
  },
  methods: {
    customTooltip(params) {
      return `
        <div style="padding: 5px 10px;">
          <div>${params[0].axisValue}</div>
          <div>当天收录模型：${params[0].data}（套）</div>
        </div>`;
    },
    onSelected(days) {
      this.days = days;
      this.fetchModelInfo();
    },
    async fetchStaticCount() {
      try {
        const { data } = await this.$axios.get('/dashboard/staticCount');
        this.staticCount = data;
      } catch (error) {
        console.log("仪表盘 - 查询静态数据异常：", error);
      }
    },
    async fetchNewsContentType() {
      try {
        const { data } = await this.$axios.get('/dashboard/newsContentType');
        this.newsTypes = data.map(e => e.typeName);
        this.newsValues = data.map(e => e.count);
      } catch (error) {
        console.log("仪表盘 - 查询健康资讯内容类型异常：", error);
      }
    },
    async fetchRecipeContentType() {
      try {
        const { data } = await this.$axios.get('/dashboard/recipeContentType');
        this.recipeTypes = data.map(e => e.typeName);
        this.recipeValues = data.map(e => e.count);
      } catch (error) {
        console.log("仪表盘 - 查询食谱内容类型异常：", error);
      }
    },
    async fetchModelInfo() {
      try {
        const { data } = await this.$axios.get(`/dashboard/modelInfo/${this.days}`);
        this.values = data.map(e => e.count);
        this.dateList = data.map(e => e.name);
      } catch (error) {
        console.log("折线图 - 查询模型收录情况异常：", error);
      }
    },
  }
};
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  gap: 30px;
  padding: 30px;
  box-sizing: border-box;
  overflow-x: hidden;

  .left {
    width: 65%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    /* 静态统计数据卡片 */
    .static-count {
      background-color: #ffffff;
      display: flex;
      justify-content: space-evenly;
      padding: 20px 15px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .count {
        font-size: 28px;
        font-weight: 600;
        color: #1e3a8a; /* 深蓝色，统一风格 */
      }

      .label {
        color: #6b7280;
        margin-top: 6px;
        font-size: 14px;
      }
    }

    /* 折线图卡片 */
    .chart-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
  }

  .right {
    width: 35%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .chart-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
  }
}
</style>
