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
              :page-sizes="[8, 16]"
              :page-size="healthNewsQueryDto.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧最热资讯 -->
    <div class="right">
      <div class="hot-news-header">
        <i class="el-icon-fire"></i>
        <span>最热资讯</span>
        <span class="hot-subtitle">实时热度榜单</span>
      </div>
      
      <div class="hot-news-list">
        <div
          v-for="(healthNews, index) in healthNewsTopList"
          :key="index"
          class="hot-news-item"
          @click="healthNewsChange(healthNews)"
        >
          <div class="hot-rank">{{ index + 1 }}</div>
          <div class="hot-content">
            <div class="hot-img-wrapper">
              <img 
                class="hot-cover" 
                :src="healthNews.cover" 
                :alt="healthNews.title"
                @error="handleImageError"
              />
            </div>
            <div class="hot-details">
              <h4 class="hot-title">{{ healthNews.title }}</h4>
              <div class="hot-meta">
                <span class="hot-views">
                  <i class="el-icon-view"></i>
                  {{ healthNews.viewCount || 0 }}
                </span>
                <span class="hot-time" v-if="healthNews.createTime">
                  <i class="el-icon-time"></i>
                  {{ formatTime(healthNews.createTime) }}
                </span>
              </div>
              <div class="hot-tags">
                <span class="hot-tag" v-if="healthNews.typeName">{{ healthNews.typeName }}</span>
                <span class="hot-tag" v-else>热门资讯</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="healthNewsTopList.length === 0" class="empty-hot-news">
        <i class="el-icon-star-off"></i>
        <p>暂无热门资讯</p>
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
        size: 8
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
    },
    
    // 图片加载错误处理
    handleImageError(event) {
      // 设置默认图片
      event.target.src = 'https://via.placeholder.com/300x200/6bb8ff/ffffff?text=健康资讯';
    },
    
    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '';
      const date = new Date(timeString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  }
};
</script>

<style scoped lang="scss">
.health-news-container {
  display: flex;
  gap: 30px;
  margin-block: 30px;
  padding: 0 20px;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;

  .left {
    flex: 1;
    min-width: 0; /* 防止内容溢出 */
  }

  /* 右侧最热资讯 */
  .right {
    width: 320px;
    flex-shrink: 0; /* 防止右侧被压缩 */
    position: sticky;
    top: 30px;
    align-self: flex-start;

    .hot-news-header {
      background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 25px;
      color: white;
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
      display: flex;
      flex-direction: column;
      gap: 8px;

      i {
        font-size: 24px;
        margin-bottom: 5px;
      }

      span:first-of-type {
        font-size: 20px;
        font-weight: 600;
      }

      .hot-subtitle {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 300;
      }
    }

    .hot-news-list {
      .hot-news-item {
        background: #fff;
        border-radius: 14px;
        cursor: pointer;
        margin-bottom: 18px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        position: relative;
        display: flex;
        border: 1px solid #f0f0f0;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(255, 107, 107, 0.2);
          border-color: rgba(255, 107, 107, 0.3);

          .hot-rank {
            background: #ff6b6b;
            color: white;
          }

          .hot-title {
            color: #ff6b6b;
          }
        }

        .hot-rank {
          width: 40px;
          background: linear-gradient(135deg, #f5f5f5, #eaeaea);
          color: #666;
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .hot-content {
          flex: 1;
          display: flex;
          padding: 18px;

          .hot-img-wrapper {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 10px;
            margin-right: 15px;
            border: 1px solid #f0f0f0;
            
            .hot-cover {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }
          }

          .hot-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .hot-title {
              font-size: 15px;
              font-weight: 600;
              line-height: 1.4;
              color: #333;
              margin-bottom: 8px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              transition: color 0.3s ease;
            }

            .hot-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #888;
              margin-bottom: 8px;

              span {
                display: flex;
                align-items: center;

                i {
                  margin-right: 4px;
                  font-size: 13px;
                }
              }
            }

            .hot-tags {
              .hot-tag {
                display: inline-block;
                padding: 3px 8px;
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              }
            }
          }
        }

        &:hover .hot-cover {
          transform: scale(1.05);
        }

        &:nth-child(1) .hot-rank {
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
          color: white;
        }

        &:nth-child(2) .hot-rank {
          background: linear-gradient(135deg, #ffa726, #ffb74d);
          color: white;
        }

        &:nth-child(3) .hot-rank {
          background: linear-gradient(135deg, #ffd166, #ffe394);
          color: #333;
        }
      }
    }

    .empty-hot-news {
      background: #f9f9f9;
      border-radius: 14px;
      padding: 40px 20px;
      text-align: center;
      color: #999;
      border: 2px dashed #e0e0e0;

      i {
        font-size: 48px;
        margin-bottom: 15px;
        color: #ccc;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  }

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
      padding: 20px 0;
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

      @media (max-width: 1600px) {
        flex: 0 0 calc(25% - 15px);
        max-width: calc(25% - 15px);
      }

      @media (max-width: 1200px) {
        flex: 0 0 calc(33.333% - 15px);
        max-width: calc(33.333% - 15px);
      }

      @media (max-width: 992px) {
        flex: 0 0 calc(50% - 15px);
        max-width: calc(50% - 15px);
      }

      @media (max-width: 768px) {
        flex: 0 0 100%;
        max-width: 100%;
      }
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
      height: 140px;
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

  .recommend {
    margin-bottom: 20px;
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .health-news-container {
    flex-direction: column;
    gap: 30px;
    padding: 0 15px;

    .left {
      width: 100%;
    }

    .right {
      width: 100%;
      position: static;
      
      .hot-news-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        
        .hot-news-item {
          margin-bottom: 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .health-news-container {
    padding: 0 10px;
    
    .right {
      .hot-news-list {
        grid-template-columns: 1fr;
      }
    }
  }
  
  .content {
    .left-type {
      .types {
        gap: 10px !important;
        
        .type-item {
          padding: 5px 10px !important;
          font-size: 14px;
        }
      }
    }
  }
}
</style>