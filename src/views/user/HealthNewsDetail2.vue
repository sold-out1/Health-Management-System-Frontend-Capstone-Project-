<template>
    <div class="detail-container">
        <div class="content-wrapper">
            <div class="title-area">
                <div class="header-card">
                    <div class="header-left" @click="goBack">
                        <i class="el-icon-arrow-left"></i>
                        <span>返回</span>
                    </div>
                </div>

                <div class="main-title">
                    {{ healthNews.title }}
                </div>
            </div>

            <div class="time">
                <div>发布于{{ healthNews.createTime }}</div>
                <div>{{ healthNews.viewCount }}人阅读</div>
                <div>{{ healthNews.upvoteCount }}人点赞</div>
                <div>{{ healthNews.collectionCount }}人收藏</div>
            </div>
            
            <div class="summary">{{ healthNews.summary }}</div>
            <div class="article-content" v-html="healthNews.content"></div>
            
            <div>
                <FlowIndex :contentId="Number(id)" contentModule="HEALTH_NEWS" />
            </div>
            <div>
                <Evaluations 
                    :userId="userId" 
                    :avatar="avatar" 
                    contentType="HEALTH-NEWS" 
                    :contentId="Number(id)" 
                />
            </div>
        </div>
        
        <div class="right">
            <h3 style="margin-top: 0; margin-left: 8px;">推荐资讯</h3>
            <div 
                v-for="(news, index) in healthNewsList" 
                :key="index" 
                class="item" 
                @click="healthNewsClick(news)"
            >
                <img class="cover" :src="news.cover" alt="推荐资讯封面" />
                <div class="title">{{ news.title }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import Evaluations from "@/components/Evaluations"
import FlowIndex from "@/components/FlowIndex"

export default {
    components: { 
        Evaluations, 
        FlowIndex 
    },
    name: "HealthNewsDetail",
    data() {
        return {
            id: null,
            healthNews: {},
            userId: 0,
            avatar: '',
            healthNewsList: [],
        }
    },
    async created() {
        await this.fetchUserBaseInfo();
        this.id = this.$router.currentRoute.query.id;
        this.fetchHealthNewsDetail(this.id);
        this.fetchRecommendHealthNews(4);
    },
    methods: {
        healthNewsClick(healthNews) {
            this.id = healthNews.id;
            this.fetchHealthNewsDetail(healthNews.id);
        },
        goBack() {
            this.$router.push('/user');
        },
        async fetchRecommendHealthNews(count) {
            try {
                const { data } = await this.$axios.get(`/health-news/recommend/${count}`);
                this.healthNewsList = data;
            } catch (error) {
                this.$message.info(error.message);
            }
        },
        async fetchUserBaseInfo() {
            try {
                const { data } = await this.$axios.get(`/user/auth`);
                this.userId = data.id;
                this.avatar = data.avatar;
            } catch (error) {
                console.error('查询用户信息异常:', error);
            }
        },
        async fetchHealthNewsDetail(id) {
            try {
                const { data } = await this.$axios.get(`/health-news/${id}`);
                this.healthNews = data;
            } catch (error) {
                console.error('查询健康资讯信息异常:', error);
            }
        },
    }
}
</script>

<style scoped lang="scss">
.detail-container {
  display: flex;
  min-height: 100vh;
  padding: 30px 120px;
  box-sizing: border-box;
  gap: 60px;

  /* 左侧文章内容容器 */
  .content-wrapper {
    width: 75%;
    color: #333;

    /* 标题区：小米风卡片 */
    .title-area {
      margin-bottom: 20px;

      .header-card {
        margin-bottom: 15px;
        
        .header-left {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #666;
          
          &:hover {
            background: rgba(107, 184, 255, 0.15);
            color: #57aaff;
            transform: translateX(-3px);
          }
          
          i {
            margin-right: 8px;
            font-size: 18px;
          }
          
          span {
            font-size: 16px;
            font-weight: 500;
          }
        }
      }

      .main-title {
        font-size: 26px;
        font-weight: 600;
        color: #222;
        line-height: 1.4;
      }
    }

    /* 时间信息 */
    .time {
      font-size: 14px;
      margin-bottom: 20px;
      display: flex;
      gap: 16px;
      color: #666;

      div {
        display: flex;
        align-items: center;
        gap: 4px;

        &::before {
          content: "•";
          color: #57aaff;
          font-weight: bold;
        }
      }
    }

    /* 摘要区：淡蓝气泡卡片 */
    .summary {
      background: rgba(107, 184, 255, 0.1);
      padding: 18px 20px;
      border-radius: 12px;
      font-size: 15px;
      margin-bottom: 25px;
      line-height: 1.6;
      border-left: 3px solid #57aaff;
    }

    /* 内容区优化 */
    .article-content {
      width: 100%;
      line-height: 1.8;
      font-size: 16px;
      margin-bottom: 30px;

      img {
        max-width: 100%;
        border-radius: 10px;
        margin: 8px 0;
      }
    }
  }

  /* 右侧推荐资讯 */
  .right {
    width: 25%;

    h3 {
      margin-top: 0;
      margin-left: 5px;
      margin-bottom: 15px;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }

    .item {
      background: #fff;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      margin-bottom: 15px;
      transition: 0.3s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(107, 184, 255, 0.2);
      }

      .cover {
        width: 100%;
        height: 110px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 8px;
      }

      .title {
        font-size: 15px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #333;
      }
    }
  }
}
</style>