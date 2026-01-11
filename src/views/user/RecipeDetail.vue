<template>
    <div class="recipe-detail-container">
        <!-- 左侧食谱详情内容 -->
        <div class="recipe-content-wrapper">
            <!-- 返回和标题区域 -->
            <div class="recipe-header">
                <div class="header-card">
                    <div class="header-left" @click="goBack">
                        <i class="el-icon-arrow-left"></i>
                        <span>返回</span>
                    </div>
                </div>

                <!-- 食谱主标题 -->
                <div class="recipe-main-title">
                    <i class="el-icon-knife-fork"></i>
                    <span>{{ recipe.name }}</span>
                </div>

                <!-- 作者信息卡片 -->
                <div class="author-info-card">
                    <div class="author-avatar">
                        <img :src="recipe.avatar" alt="作者头像" @error="handleAvatarError" />
                    </div>
                    <div class="author-details">
                        <div class="author-name">{{ recipe.username || '美食达人' }}</div>
                        <div class="publish-info">
                            <span class="publish-time">
                                <i class="el-icon-time"></i>
                                发布于 {{ recipe.createTime }}
                            </span>
                            <span class="recipe-category" v-if="recipe.categoryName">
                                <i class="el-icon-folder-opened"></i>
                                {{ recipe.categoryName }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 食谱内容区域 -->
            <div class="recipe-content-section">
                <div class="content-card">
                    <div class="card-header">
                        <i class="el-icon-notebook-2"></i>
                        <span>食谱详情</span>
                    </div>
                    <div class="recipe-content" v-html="recipe.content"></div>
                </div>
            </div>

            <!-- 互动功能区域 -->
            <div class="interaction-section">
                <div class="interaction-header">
                    <i class="el-icon-data-analysis"></i>
                    <!-- <span>食谱热度指数</span> -->
                </div>
                <FlowIndex :contentId="Number(id)" contentModule="RECIPE" />
            </div>

            <!-- 评论区域 -->
            <div class="comment-section">
                <div class="comment-header">
                    <i class="el-icon-chat-dot-square"></i>
                    <span>用户评价</span>
                    <!-- <span class="comment-count">({{ recipe.commentCount || 0 }})</span> -->
                </div>
                <Evaluations 
                    :userId="userId" 
                    :avatar="avatar" 
                    contentType="HEALTH-NEWS" 
                    :contentId="Number(id)" 
                />
            </div>
        </div>

        <!-- 右侧推荐食谱 -->
        <div class="recipe-sidebar">
            <div class="recommend-header">
                <i class="el-icon-star-on"></i>
                <span>推荐食谱</span>
                <span class="recommend-subtitle">更多美味选择</span>
            </div>
            
            <div class="recommend-list">
                <div 
                    v-for="(recipe, index) in recipeRecommendList" 
                    :key="index" 
                    class="recommend-item" 
                    @click="recipeClick(recipe)"
                >
                    <div class="item-rank">{{ index + 1 }}</div>
                    <div class="item-content">
                        <div class="item-img-wrapper">
                            <img 
                                class="item-cover" 
                                :src="recipe.cover" 
                                alt="推荐食谱封面"
                                @error="handleImageError"
                            />
                        </div>
                        <div class="item-details">
                            <h4 class="item-title">{{ recipe.name }}</h4>
                            <div class="item-meta">
                                <span class="item-author">
                                    <i class="el-icon-user"></i>
                                    {{ recipe.username || '厨友' }}
                                </span>
                                <span class="item-views" v-if="recipe.viewCount">
                                    <i class="el-icon-view"></i>
                                    {{ recipe.viewCount }}
                                </span>
                            </div>
                            <div class="item-tags" v-if="recipe.categoryName">
                                <span class="item-tag">{{ recipe.categoryName }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div v-if="recipeRecommendList.length === 0" class="empty-recommend">
                <i class="el-icon-fork-spoon"></i>
                <p>暂无推荐食谱</p>
            </div>
        </div>
    </div>
</template>

<script>
import Evaluations from "@/components/Evaluations"
import FlowIndex from "@/components/FlowIndex"

export default {
    components: { Evaluations, FlowIndex },
    name: "recipeDetail",
    data() {
        return {
            id: null,
            recipe: {},
            userId: 0,
            avatar: '',
            recommendCount: 3,
            recipeRecommendList: []
        }
    },
    async created() {
        await this.fetchUserBaseInfo();
        this.id = this.$router.currentRoute.query.id;
        this.fetchRecipeDetail(this.id);
        this.fetchRecommendRecipe(this.recommendCount);
    },
    methods: {
        recipeClick(recipe) {
            this.id = recipe.id;
            this.fetchRecipeDetail(recipe.id);
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        goBack() {
            this.$router.push('/user');
        },
        async fetchRecommendRecipe(count) {
            try {
                const { data } = await this.$axios.get(`/recipe/recommend/${count}`);
                this.recipeRecommendList = data;
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
        async fetchRecipeDetail(id) {
            try {
                const { data } = await this.$axios.get(`/recipe/${id}`);
                this.recipe = data;
            } catch (error) {
                console.error('查询食谱详情信息异常:', error);
            }
        },
        handleImageError(event) {
            event.target.src = 'https://via.placeholder.com/300x200/ff9a76/ffffff?text=食谱封面';
        },
        handleAvatarError(event) {
            event.target.src = 'https://via.placeholder.com/40x40/6bb8ff/ffffff?text=用户';
        }
    }
}
</script>

<style scoped lang="scss">
.recipe-detail-container {
    display: flex;
    min-height: 100vh;
    padding: 30px 120px;
    box-sizing: border-box;
    gap: 60px;
    background: linear-gradient(135deg, #fefaf7 0%, #f9f5f0 100%);

    /* 左侧食谱内容容器 */
    .recipe-content-wrapper {
        width: 75%;
        color: #333;

        /* 食谱头部区域 */
        .recipe-header {
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
                        background: linear-gradient(135deg, #ff9a76, #ff7b54);
                        color: white;
                        transform: translateX(-3px);
                        border-color: #ff7b54;
                        box-shadow: 0 4px 12px rgba(255, 123, 84, 0.2);
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

            .recipe-main-title {
                font-size: 30px;
                font-weight: 700;
                color: #1a1a1a;
                line-height: 1.4;
                margin-bottom: 25px;
                display: flex;
                align-items: center;
                gap: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;

                i {
                    color: #ff9a76;
                    font-size: 32px;
                    background: linear-gradient(135deg, #ff9a76, #ff7b54);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }

            .author-info-card {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px;
                background: linear-gradient(135deg, #fff, #fefaf7);
                border-radius: 16px;
                box-shadow: 0 4px 15px rgba(255, 154, 118, 0.1);
                border: 1px solid rgba(255, 154, 118, 0.1);

                .author-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .author-details {
                    flex: 1;

                    .author-name {
                        font-size: 18px;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 8px;
                    }

                    .publish-info {
                        display: flex;
                        gap: 20px;

                        span {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-size: 14px;
                            color: #666;

                            i {
                                font-size: 15px;
                                color: #ff9a76;
                            }
                        }

                        .recipe-category {
                            background: rgba(255, 154, 118, 0.1);
                            padding: 4px 12px;
                            border-radius: 12px;
                            color: #ff7b54;
                            font-weight: 500;
                        }
                    }
                }
            }
        }

        /* 食谱内容区域 */
        .recipe-content-section {
            .content-card {
                background: #fff;
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
                border: 1px solid #f0f0f0;

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #fefaf7;

                    i {
                        color: #ff9a76;
                        font-size: 24px;
                    }

                    span {
                        font-size: 20px;
                        font-weight: 600;
                        color: #333;
                    }
                }

                .recipe-content {
                    width: 100%;
                    line-height: 1.8;
                    font-size: 16px;

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
                            background: linear-gradient(to bottom, #ff9a76, #ff7b54);
                            border-radius: 2px;
                        }
                    }
                }
            }
        }

        /* 互动功能区域 */
        .interaction-section {
            background: #fff;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;

            .interaction-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #fefaf7;

                i {
                    color: #ff9a76;
                    font-size: 24px;
                }

                span {
                    font-size: 20px;
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
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;

            .comment-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #fefaf7;

                i {
                    color: #ff9a76;
                    font-size: 24px;
                }

                span {
                    font-size: 20px;
                    font-weight: 600;
                    color: #333;
                }

                .comment-count {
                    color: #ff7b54;
                    font-weight: 500;
                }
            }
        }
    }

    /* 右侧推荐食谱 */
    .recipe-sidebar {
        width: 25%;
        position: sticky;
        top: 30px;
        align-self: flex-start;

        .recommend-header {
            background: linear-gradient(135deg, #ff9a76, #ff7b54);
            border-radius: 14px;
            padding: 22px;
            margin-bottom: 25px;
            color: white;
            box-shadow: 0 6px 20px rgba(255, 154, 118, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            font-weight: 600;

            i {
                font-size: 22px;
            }

            .recommend-subtitle {
                margin-left: auto;
                font-size: 14px;
                opacity: 0.9;
                font-weight: 300;
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
                    box-shadow: 0 12px 25px rgba(255, 154, 118, 0.2);
                    border-color: rgba(255, 154, 118, 0.3);

                    .item-rank {
                        background: #ff9a76;
                        color: white;
                    }

                    .item-title {
                        color: #ff7b54;
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
                        border-radius: 12px;
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
                                background: rgba(255, 154, 118, 0.1);
                                color: #ff9a76;
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
                    background: linear-gradient(135deg, #ff9a76, #ff7b54);
                    color: white;
                }

                &:nth-child(2) .item-rank {
                    background: linear-gradient(135deg, #ffb574, #ffa04d);
                    color: white;
                }

                &:nth-child(3) .item-rank {
                    background: linear-gradient(135deg, #ffd7a6, #ffc98c);
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

/* 响应式设计 */
@media (max-width: 1200px) {
    .recipe-detail-container {
        padding: 20px 60px;
        gap: 40px;
    }
}

@media (max-width: 992px) {
    .recipe-detail-container {
        flex-direction: column;
        padding: 20px;
        gap: 30px;

        .recipe-content-wrapper {
            width: 100%;
        }

        .recipe-sidebar {
            width: 100%;
            position: static;
        }
    }
}

@media (max-width: 768px) {
    .recipe-detail-container {
        padding: 15px;

        .recipe-content-wrapper {
            .recipe-header {
                .recipe-main-title {
                    font-size: 24px;
                }

                .author-info-card {
                    flex-direction: column;
                    text-align: center;
                    gap: 15px;

                    .author-details {
                        text-align: center;

                        .publish-info {
                            flex-direction: column;
                            gap: 10px;
                        }
                    }
                }
            }

            .recipe-content-section,
            .interaction-section,
            .comment-section {
                padding: 20px;
            }
        }
    }
}
</style>