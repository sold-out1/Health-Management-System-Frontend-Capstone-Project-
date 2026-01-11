<template>
  <div class="health-news-container">
    <div class="left">
      <div class="recommend">
        <Carousel
          @obj-detail="healthNewsChange"
          :carouselItems="carouselItems"
        />
      </div>

      <div class="content">
        <div
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <div class="left-type">
            <!-- 资讯类别 -->
            <div class="types">
              <div
                v-for="(type, index) in healthNewsTypeList"
                :key="index"
                class="type-item"
                :style="{
                  backgroundColor:
                    selectedType.value === type.value
                      ? 'rgb(107, 184, 255)'
                      : '',
                  color:
                    selectedType.value === type.value
                      ? 'rgb(255,255,255)'
                      : ''
                }"
                @click="typeChange(type)"
              >
                {{ type.label }}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <AutoInput
              style="width: 200px;"
              placeholder="搜索健康资讯"
              @listener="listener"
            />
          </div>
        </div>

        <!-- 资讯列表 -->
        <div>
          <div class="health-news">
            <div v-if="!healthNewsList.length">
              <el-empty description="暂无资讯信息"></el-empty>
            </div>

            <div
              v-for="(healthNews, index) in healthNewsList"
              :key="index"
              class="item"
              @click="healthNewsChange(healthNews)"
            >
              <img class="cover" :src="healthNews.cover" alt="" />

              <span class="view-count">
                <i class="el-icon-view"></i>{{ healthNews.viewCount }}
              </span>

              <div class="title">{{ healthNews.title }}</div>
            </div>
          </div>

          <div class="pager">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="healthNewsQueryDto.current"
              :page-sizes="[10, 20]"
              :page-size="healthNewsQueryDto.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <h3 style="margin-top: 0; margin-left: 8px;">最热资讯</h3>

      <div
        v-for="(healthNews, index) in healthNewsTopList"
        :key="index"
        class="item"
        @click="healthNewsChange(healthNews)"
      >
        <img class="cover" :src="healthNews.cover" alt="" />
        <div class="title">{{ healthNews.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import AutoInput from "@/components/AutoInput.vue";
import Carousel from "@/components/Carousel";

export default {
  components: { Carousel, AutoInput },

  data() {
    return {
      carouselItems: [],
      selectedType: {},
      healthNewsTypeList: [],
      healthNewsList: [],
      healthNewsTopList: [],
      total: 0,
      healthNewsQueryDto: {
        typeId: null,
        current: 1,
        size: 10
      },
      defaultRecommendCount: 3
    };
  },

  created() {
    this.fetchHealthNewsTypes();
    this.fetchRecommendHealthNews(this.defaultRecommendCount);
    this.fetchHealthNewsTop(1, 3);
  },

  methods: {
    listener(text) {
      this.healthNewsQueryDto.title = text;
      this.fetchHealthNews();
    },

    healthNewsChange(healthNews) {
      window.open(`/health-news-detail?id=${healthNews.id}`);
    },

    handleSizeChange(size) {
      this.healthNewsQueryDto.size = size;
      this.healthNewsQueryDto.current = 1;
      this.fetchHealthNews();
    },

    handleCurrentChange(current) {
      this.healthNewsQueryDto.current = current;
      this.fetchHealthNews();
    },

    typeChange(type) {
      this.selectedType = type;
      this.healthNewsQueryDto.typeId = type.value;
      this.fetchHealthNews();
    },

    async fetchRecommendHealthNews(count) {
      try {
        const { data } = await this.$axios.get(
          `/health-news/recommend/${count}`
        );
        this.carouselItems = data.map(entity => ({
          id: entity.id,
          title: entity.title,
          subtitle: entity.summary,
          image: entity.cover
        }));
      } catch (error) {
        this.$message.info(error.message);
      }
    },

    async fetchHealthNewsTypes() {
      try {
        const { data } = await this.$axios.get(
          "/health-news/fetchHealthNewsTypes"
        );
        this.healthNewsTypeList = data;
        this.healthNewsTypeList.unshift({ value: null, label: "全部" });
        this.typeChange(this.healthNewsTypeList[0]);
      } catch (error) {
        this.$message.info(error.message);
      }
    },

    async fetchHealthNews() {
      try {
        const { data, total } = await this.$axios.post(
          "/health-news/list",
          this.healthNewsQueryDto
        );
        this.healthNewsList = data;
        this.total = total;
      } catch (error) {
        this.$message.info(error.message);
      }
    },

    async fetchHealthNewsTop(current, size) {
      try {
        const queryDto = {
          current,
          size,
          sortField: "viewCount"
        };
        const { data } = await this.$axios.post(
          "/health-news/list",
          queryDto
        );
        this.healthNewsTopList = data;
      } catch (error) {
        this.$message.info(error.message);
      }
    }
  }
};
</script>
<style scoped lang="scss">
.health-news-container {
display: flex;
  gap: 30px;
  margin-block: 30px;
  

  .left {
    width: 80%;
    box-sizing: border-box;
  }

  .right {
    width: 20%;
    box-sizing: border-box;
    box-shadow: 0 4px 6px rgb(240, 240, 240);
    padding: 20px;

    .item {
      margin-bottom: 10px;
      cursor: pointer;
      padding: 10px;

      &:hover {
        transform: translateY(-2px);
      }

      .cover {
        width: 100%;
        height: 110px;
        border-radius: 5px;
      }
    }
  }
// .recommend {
//   background: linear-gradient(90deg, #6bb8ff, #57aaff);
//   border-radius: 8px;
// }

  .content {
    .left-type {
      .types {
        padding-block: 20px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 20px;

        .type-item {
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;

          &:hover {
            background-color: rgb(246, 246, 246);
          }
        }
      }
    }

    .pager {
      display: flex;
      justify-content: flex-end;
    }

    .health-news {
      display: flex;
      flex-wrap: wrap;
      padding: 20px 0;
      gap: 15px;
    }

    .health-news .item {
      flex: 0 0 calc(20% - 15px);
      max-width: calc(20% - 15px);
      cursor: pointer;
      transition: transform 0.3s ease;
      position: relative;
    }

    .view-count {
      position: absolute;
      top: 0;
      left: 0;
      color: #fff;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      background-color: rgba(0, 0, 0, 0.6);
      border-top-left-radius: 5px;
      border-bottom-right-radius: 5px;

      i {
        margin-right: 4px;
      }
    }

    .health-news .item:hover {
      transform: translateY(-5px);
    }

    .health-news .cover {
      width: 100%;
      height: 110px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .health-news .title {
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 5px;
    }
  }
}
</style>