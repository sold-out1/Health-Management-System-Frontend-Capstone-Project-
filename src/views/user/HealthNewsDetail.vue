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

            <div class="meta-info">
                <div class="meta-item">
                    <i class="el-icon-time"></i>
                    <span>发布于{{ healthNews.createTime }}</span>
                </div>
                <div class="meta-item">
                    <i class="el-icon-view"></i>
                    <span>{{ healthNews.viewCount }}人阅读</span>
                </div>
                <div class="meta-item">
                    <i class="el-icon-star-off"></i>
                    <span>{{ healthNews.upvoteCount }}人点赞</span>
                </div>
                <div class="meta-item">
                    <i class="el-icon-collection"></i>
                    <span>{{ healthNews.collectionCount }}人收藏</span>
                </div>
            </div>
            
            <div class="summary">{{ healthNews.summary }}</div>
            
            <div class="article-content" v-html="healthNews.content"></div>
            
            <!-- 互动功能区域 -->
            <div class="interaction-section">
                <div class="interaction-header">
                    <i class="el-icon-data-analysis"></i>
                    <!-- <span>内容热度指数</span> -->
                </div>
                <FlowIndex :contentId="Number(id)" contentModule="HEALTH_NEWS" />
            </div>
            
            <div class="comment-section">
                <div class="comment-header">
                    <i class="el-icon-chat-dot-square"></i>
                    <span>用户评价</span>
                    <!-- <span class="comment-count">({{ healthNews.commentCount || 0 }})</span> -->
                </div>
                <Evaluations 
                    :userId="userId" 
                    :avatar="avatar" 
                    contentType="HEALTH-NEWS" 
                    :contentId="Number(id)" 
                />
            </div>
        </div>
        
        <!-- 右侧推荐资讯 -->
        <div class="right">
            <div class="recommend-header">
                <i class="el-icon-folder-checked"></i>
                <span>相关推荐</span>
            </div>
            
            <div class="recommend-list">
                <div 
                    v-for="(news, index) in healthNewsList" 
                    :key="index" 
                    class="recommend-item" 
                    @click="healthNewsClick(news)"
                >
                    <div class="item-rank">{{ index + 1 }}</div>
                    <div class="item-content">
                        <div class="item-img-wrapper">
                            <img 
                                class="item-cover" 
                                :src="news.cover" 
                                :alt="news.title" 
                                @error="handleImageError"
                            />
                        </div>
                        <div class="item-details">
                            <h4 class="item-title">{{ news.title }}</h4>
                            <div class="item-meta">
                                <span class="item-time">
                                    <i class="el-icon-time"></i>
                                    {{ formatDate(news.createTime) }}
                                </span>
                                <span class="item-views">
                                    <i class="el-icon-view"></i>
                                    {{ news.viewCount || 0 }}
                                </span>
                            </div>
                            <div class="item-tags">
                                <span class="item-tag">{{ news.typeName || '健康资讯' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div v-if="healthNewsList.length === 0" class="empty-recommend">
                <i class="el-icon-reading"></i>
                <p>暂无相关推荐</p>
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
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        },
        handleImageError(event) {
            // 设置默认图片
            event.target.src = 'https://via.placeholder.com/300x200/6bb8ff/ffffff?text=健康资讯';
        }
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
      margin-bottom: 25px;

      .header-card {
        margin-bottom: 20px;
        
        .header-left {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #666;
          background: #fff;
          border: 1px solid #e8e8e8;
          font-weight: 500;
          
          &:hover {
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            color: white;
            transform: translateX(-3px);
            border-color: #57aaff;
            box-shadow: 0 4px 12px rgba(87, 170, 255, 0.2);
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
        font-size: 30px;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.4;
        padding-bottom: 15px;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    /* 元信息区域 */
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 25px;
      padding: 15px 20px;
      background: linear-gradient(135deg, #f8faff, #f0f7ff);
      border-radius: 12px;
      border: 1px solid #e6f2ff;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #555;
        font-size: 14px;

        i {
          color: #57aaff;
          font-size: 16px;
        }

        span {
          font-weight: 500;
        }
      }
    }

    /* 摘要区：淡蓝气泡卡片 */
    .summary {
      background: linear-gradient(135deg, rgba(107, 184, 255, 0.1) 0%, rgba(107, 184, 255, 0.05) 100%);
      padding: 22px 24px;
      border-radius: 14px;
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.7;
      border-left: 4px solid #57aaff;
      color: #444;
      box-shadow: 0 4px 12px rgba(107, 184, 255, 0.08);
      position: relative;
      
      &:before {
        content: '📌';
        position: absolute;
        left: -12px;
        top: 22px;
        font-size: 18px;
        background: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #57aaff;
      }
    }

    /* 内容区优化 */
    .article-content {
      width: 100%;
      line-height: 1.8;
      font-size: 16px;
      margin-bottom: 40px;
      padding: 30px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

      img {
        max-width: 100%;
        border-radius: 12px;
        margin: 15px 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      p {
        margin-bottom: 1.5em;
        color: #333;
      }

      h1, h2, h3, h4 {
        color: #222;
        margin: 1.8em 0 1em;
        font-weight: 600;
        position: relative;
        padding-left: 15px;
        
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.3em;
          bottom: 0.3em;
          width: 4px;
          background: linear-gradient(to bottom, #57aaff, #6bb8ff);
          border-radius: 2px;
        }
      }
    }

    /* 互动功能区域 */
    .interaction-section {
      background: #fff;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e8f4ff;

      .interaction-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f7ff;

        i {
          color: #57aaff;
          font-size: 22px;
        }

        span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    /* 评论区域 */
    .comment-section {
      background: #fff;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e8f4ff;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f7ff;

        i {
          color: #57aaff;
          font-size: 22px;
        }

        span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .comment-count {
          color: #ff6b6b;
          font-weight: 500;
        }
      }
    }
  }

  /* 右侧推荐资讯 */
  .right {
    width: 25%;
    position: sticky;
    top: 30px;
    align-self: flex-start;

    .recommend-header {
      background: linear-gradient(135deg, #57aaff, #6bb8ff);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 25px;
      color: white;
      box-shadow: 0 6px 20px rgba(87, 170, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 600;

      i {
        font-size: 22px;
      }
    }

    .recommend-list {
      .recommend-item {
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
          box-shadow: 0 12px 25px rgba(87, 170, 255, 0.2);
          border-color: rgba(87, 170, 255, 0.3);

          .item-rank {
            background: #57aaff;
            color: white;
          }

          .item-title {
            color: #57aaff;
          }
        }

        .item-rank {
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

        .item-content {
          flex: 1;
          display: flex;
          padding: 18px;

          .item-img-wrapper {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 10px;
            margin-right: 15px;
            border: 1px solid #f0f0f0;
            
            .item-cover {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }
          }

          .item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .item-title {
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

            .item-meta {
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

            .item-tags {
              .item-tag {
                display: inline-block;
                padding: 3px 8px;
                background: rgba(87, 170, 255, 0.1);
                color: #57aaff;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              }
            }
          }
        }

        &:hover .item-cover {
          transform: scale(1.05);
        }

        &:nth-child(1) .item-rank {
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
          color: white;
        }

        &:nth-child(2) .item-rank {
          background: linear-gradient(135deg, #4ecdc4, #6de0d8);
          color: white;
        }

        &:nth-child(3) .item-rank {
          background: linear-gradient(135deg, #ffd166, #ffe394);
          color: #333;
        }
      }
    }

    .empty-recommend {
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
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .detail-container {
    padding: 20px 60px;
    gap: 40px;
  }
}

@media (max-width: 992px) {
  .detail-container {
    flex-direction: column;
    padding: 20px;
    gap: 30px;

    .content-wrapper {
      width: 100%;
    }

    .right {
      width: 100%;
      position: static;
    }
  }
}
</style>