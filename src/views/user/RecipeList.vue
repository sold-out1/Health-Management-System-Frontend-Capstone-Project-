<template>
    <div class="recipe-container">
        <!-- 左侧内容区域 -->
        <div class="content-wrapper">
            <!-- 筛选和搜索区域 -->
            <div class="filter-section">
                <div class="filter-header">
                    <i class="el-icon-knife-fork"></i>
                    <span class="filter-title">健康食谱发现</span>
                    <span class="filter-subtitle">探索营养美味的选择</span>
                </div>
                
                <div class="filter-content">
                    <!-- 食谱分类 -->
                    <div class="type-filter">
                        <div class="type-label">食谱分类:</div>
                        <div class="type-tags">
                            <div 
                                v-for="(type, index) in recipeTypesList"
                                :key="index"
                                class="type-tag"
                                :class="{ 'active': selectedType.value === type.value }"
                                @click="typeChange(type)"
                            >
                                <span>{{ type.label }}</span>
                                <i class="el-icon-check" v-if="selectedType.value === type.value"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 搜索框 -->
                    <div class="search-filter">
                        <div class="search-label">快速搜索:</div>
                        <div class="search-input-wrapper">
                            <AutoInput 
                                placeholder="搜索食谱名称、食材或做法..." 
                                @listener="listener"
                                class="recipe-search-input"
                            />
                            <div class="search-tips">
                                <i class="el-icon-search"></i>
                                <span>按回车或输入关键词搜索</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 食谱列表区域 -->
            <div class="recipe-list-section">
                <div class="list-header">
                    <div class="list-title">
                        <i class="el-icon-document"></i>
                        <span>食谱列表</span>
                        <span class="list-count">(共 {{ total }} 个食谱)</span>
                    </div>
                </div>
                
                <!-- 食谱网格 -->
                <div class="recipe-grid">
                    <!-- 空状态 -->
                    <div v-if="!recipeList.length" class="empty-recipe">
                        <div class="empty-content">
                            <i class="el-icon-fork-spoon"></i>
                            <p class="empty-text">暂无食谱信息</p>
                            <p class="empty-subtext">尝试其他分类或搜索关键词</p>
                        </div>
                    </div>
                    
                    <!-- 食谱卡片 -->
                    <div 
                        v-for="(recipe, index) in recipeList" 
                        :key="index"
                        class="recipe-card"
                        @click="recipeChange(recipe)"
                    >
                        <div class="card-cover">
                            <img :src="recipe.cover" alt="食谱封面" @error="handleImageError" />
                            <div class="cover-overlay">
                                <span class="view-recipe">查看食谱</span>
                            </div>
                        </div>
                        
                        <div class="card-content">
                            <div class="card-header">
                                <div class="user-info">
                                    <div class="user-avatar">
                                        <img :src="recipe.avatar" alt="用户头像" @error="handleAvatarError" />
                                    </div>
                                    <div class="user-name">{{ recipe.username || '美食达人' }}</div>
                                </div>
                                <div class="recipe-category" v-if="recipe.categoryName">
                                    <i class="el-icon-folder-opened"></i>
                                    {{ recipe.categoryName }}
                                </div>
                            </div>
                            
                            <div class="recipe-name">{{ recipe.name }}</div>
                            
                           
                        </div>
                    </div>
                </div>
                
                <!-- 分页组件 -->
                <div class="pagination-wrapper" v-if="total > 0">
                    <el-pagination 
                        @size-change="handleSizeChange" 
                        @current-change="handleCurrentChange"
                        :current-page="recipeQueryDto.current" 
                        :page-sizes="[4, 8, 10, 12]"
                        :page-size="recipeQueryDto.size" 
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total"
                        background
                        class="recipe-pagination"
                    ></el-pagination>
                </div>
            </div>
        </div>

        <!-- 右侧推荐区域 -->
        <div class="recommend-sidebar">
            <!-- 饮食记录入口 -->
            <div class="diet-record-card">
                <div class="record-header">
                    <div class="record-icon">
                        <i class="el-icon-data-line"></i>
                    </div>
                    <div class="record-content">
                        <div class="record-title">健康饮食，从此开始</div>
                        <div class="record-desc">记录每日饮食，掌握营养摄入</div>
                    </div>
                </div>
                <div class="record-actions">
                    <el-button 
                        type="primary" 
                        plain 
                        icon="el-icon-edit"
                        @click="toDietRecord"
                        class="record-btn"
                    >
                        去记录饮食
                        <i class="el-icon-arrow-right"></i>
                    </el-button>
                </div>
            </div>
            
            <!-- 推荐食谱 -->
            <div class="recommend-card">
                <div class="recommend-header">
                    <i class="el-icon-star-on"></i>
                    <span>推荐食谱</span>
                    <span class="recommend-subtitle">每日精选</span>
                </div>
                
                <div class="recommend-list">
                    <div 
                        v-for="(recipe, index) in recipeRecommendList"
                        :key="index"
                        class="recommend-item"
                        @click="recipeChange(recipe)"
                    >
                        <div class="item-rank">{{ index + 1 }}</div>
                        <div class="item-content">
                            <div class="item-cover">
                                <img :src="recipe.cover" alt="推荐食谱" @error="handleImageError" />
                            </div>
                            <div class="item-details">
                                <div class="item-title">{{ recipe.name }}</div>
                                <div class="item-meta">
                                    <span class="item-author">
                                        <i class="el-icon-user"></i>
                                        {{ recipe.username || '厨友' }}
                                    </span>
                                    <span class="item-views">
                                        <i class="el-icon-view"></i>
                                        {{ recipe.viewCount || 0 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 空状态 -->
                <div v-if="recipeRecommendList.length === 0" class="empty-recommend">
                    <i class="el-icon-fork-spoon"></i>
                    <p>暂无推荐食谱</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AutoInput from "@/components/AutoInput.vue";

export default {
    components: { AutoInput },
    data() {
        return {
            selectedType: {},
            recipeTypesList: [],
            recipeList: [],
            total: 0,
            recipeQueryDto: {
                typeId: null,
                current: 1,
                size: 4,
            },
            recipeRecommendList: [],
        }
    },
    created() {
        this.fetchRecipeTypes();
        this.fetchRecommendRecipe(3);
    },
    methods: {
        async fetchRecommendRecipe(count) {
            try {
                const { data } = await this.$axios.get(`/recipe/recommend/${count}`);
                this.recipeRecommendList = data;
            } catch (error) {
                this.$message.info(error.message);
            }
        },
        
        listener(text) {
            this.recipeQueryDto.name = text;
            this.fetchrecipe();
        },
        
        toDietRecord() {
            window.open('/my-diet', '_blank');
        },
        
        recipeChange(recipe) {
            window.open(`/recipe-detail?id=${recipe.id}`);
        },
        
        handleSizeChange(size) {
            this.recipeQueryDto.size = size;
            this.recipeQueryDto.current = 1;
            this.fetchrecipe();
        },
        
        handleCurrentChange(current) {
            this.recipeQueryDto.current = current;
            this.fetchrecipe();
        },
        
        typeChange(type) {
            this.selectedType = type;
            this.recipeQueryDto.typeId = type.value;
            this.fetchrecipe();
        },
        
        async fetchRecipeTypes() {
            try {
                const { data } = await this.$axios.get('/recipe/fetchRecipeTypeList');
                this.recipeTypesList = data;
                this.recipeTypesList.unshift({ value: null, label: "全部" });
                this.typeChange(this.recipeTypesList[0]);
            } catch (error) {
                this.$message.info(error.message);
            }
        },
        
        async fetchrecipe() {
            try {
                const { data, total } = await this.$axios.post('/recipe/listRecipe', this.recipeQueryDto);
                this.recipeList = data;
                this.total = total;
            } catch (error) {
                this.$message.info(error.message);
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
.recipe-container {
    display: flex;
    gap: 40px;
    padding: 30px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #fefaf7 0%, #f9f5f0 100%);
    
    // 左侧内容区域
    .content-wrapper {
        flex: 1;
        min-width: 0;
        
        // 筛选区域
        .filter-section {
            background: #fff;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(255, 154, 118, 0.1);
            border: 1px solid rgba(255, 154, 118, 0.1);
            
            .filter-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0f0f0;
                
                i {
                    font-size: 28px;
                    color: #ff9a76;
                    background: linear-gradient(135deg, #ff9a76, #ff7b54);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .filter-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #333;
                }
                
                .filter-subtitle {
                    font-size: 15px;
                    color: #666;
                    margin-left: auto;
                }
            }
            
            .filter-content {
                .type-filter {
                    margin-bottom: 25px;
                    
                    .type-label {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 15px;
                    }
                    
                    .type-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                        
                        .type-tag {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 10px 20px;
                            border-radius: 25px;
                            background: #f8f8f8;
                            color: #666;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            border: 2px solid transparent;
                            
                            &:hover {
                                background: #fff2ed;
                                color: #ff7b54;
                                transform: translateY(-2px);
                            }
                            
                            &.active {
                                background: linear-gradient(135deg, #ff9a76, #ff7b54);
                                color: white;
                                border-color: rgba(255, 154, 118, 0.3);
                                box-shadow: 0 6px 15px rgba(255, 154, 118, 0.2);
                                
                                i {
                                    font-size: 12px;
                                }
                            }
                        }
                    }
                }
                
                .search-filter {
                    .search-label {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 15px;
                    }
                    
                    .search-input-wrapper {
                        .recipe-search-input {
                            margin-bottom: 12px;
                        }
                        
                        .search-tips {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 13px;
                            color: #888;
                            
                            i {
                                color: #ff9a76;
                                font-size: 14px;
                            }
                        }
                    }
                }
            }
        }
        
        // 食谱列表区域
        .recipe-list-section {
            background: #fff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
            
            .list-header {
                padding: 25px 30px;
                background: linear-gradient(90deg, rgba(255, 250, 247, 0.5), rgba(249, 245, 240, 0.3));
                border-bottom: 1px solid #f0f0f0;
                
                .list-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    
                    i {
                        font-size: 22px;
                        color: #ff9a76;
                    }
                    
                    span {
                        font-size: 18px;
                        font-weight: 600;
                        color: #333;
                    }
                    
                    .list-count {
                        font-size: 14px;
                        color: #666;
                        font-weight: 400;
                    }
                }
            }
            
            .recipe-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 25px;
                padding: 30px;
                
                .empty-recipe {
                    grid-column: 1 / -1;
                    padding: 80px 20px;
                    text-align: center;
                    color: #999;
                    
                    .empty-content {
                        i {
                            font-size: 64px;
                            margin-bottom: 20px;
                            color: #e0e0e0;
                        }
                        
                        .empty-text {
                            font-size: 18px;
                            font-weight: 500;
                            margin-bottom: 8px;
                        }
                        
                        .empty-subtext {
                            font-size: 14px;
                            color: #ccc;
                        }
                    }
                }
                
                .recipe-card {
                    background: #fff;
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid #f0f0f0;
                    position: relative;
                    
                    &:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 40px rgba(255, 154, 118, 0.15);
                        border-color: rgba(255, 154, 118, 0.3);
                        
                        .card-cover {
                            .cover-overlay {
                                opacity: 1;
                            }
                            
                            img {
                                transform: scale(1.1);
                            }
                        }
                    }
                    
                    .card-cover {
                        position: relative;
                        height: 180px;
                        overflow: hidden;
                        
                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: transform 0.6s ease;
                        }
                        
                        .cover-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4));
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                            
                            .view-recipe {
                                background: rgba(255, 255, 255, 0.9);
                                color: #ff7b54;
                                padding: 8px 20px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: 600;
                            }
                        }
                    }
                    
                    .card-content {
                        padding: 20px;
                        
                        .card-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                            
                            .user-info {
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                
                                .user-avatar {
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    overflow: hidden;
                                    border: 2px solid #fff;
                                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                                    
                                    img {
                                        width: 100%;
                                        height: 100%;
                                        object-fit: cover;
                                    }
                                }
                                
                                .user-name {
                                    font-size: 14px;
                                    color: #666;
                                    font-weight: 500;
                                    max-width: 120px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                            }
                            
                            .recipe-category {
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 12px;
                                color: #888;
                                background: rgba(255, 154, 118, 0.1);
                                padding: 4px 10px;
                                border-radius: 12px;
                                
                                i {
                                    font-size: 12px;
                                }
                            }
                        }
                        
                        .recipe-name {
                            font-size: 17px;
                            font-weight: 600;
                            color: #333;
                            line-height: 1.4;
                            margin-bottom: 15px;
                            height: 48px;
                            overflow: hidden;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                        }
                        
                        .card-footer {
                            .recipe-stats {
                                display: flex;
                                justify-content: space-around;
                                padding-top: 15px;
                                border-top: 1px solid #f0f0f0;
                                
                                .stat-item {
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    font-size: 13px;
                                    color: #888;
                                    
                                    i {
                                        font-size: 14px;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            .pagination-wrapper {
                padding: 25px 30px;
                border-top: 1px solid #f0f0f0;
                background: #fefaf7;
                
                .recipe-pagination {
                    justify-content: center;
                }
            }
        }
    }
    
    // 右侧推荐区域
    .recommend-sidebar {
        width: 320px;
        flex-shrink: 0;
        
        .diet-record-card {
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 25px;
            color: white;
            box-shadow: 0 10px 30px rgba(87, 170, 255, 0.25);
            position: relative;
            overflow: hidden;
            
            &::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200px;
                height: 200px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
            }
            
            .record-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
                
                .record-icon {
                    i {
                        font-size: 32px;
                    }
                }
                
                .record-content {
                    .record-title {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }
                    
                    .record-desc {
                        font-size: 14px;
                        opacity: 0.9;
                    }
                }
            }
            
            .record-actions {
                position: relative;
                z-index: 1;
                
                .record-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    color: white;
                    font-weight: 600;
                    padding: 10px 20px;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
                    }
                    
                    i {
                        margin-left: 8px;
                    }
                }
            }
        }
        
        .recommend-card {
            background: #fff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
            
            .recommend-header {
                background: linear-gradient(135deg, #ff9a76, #ff7b54);
                padding: 22px;
                color: white;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 18px;
                font-weight: 600;
                
                .recommend-subtitle {
                    margin-left: auto;
                    font-size: 14px;
                    font-weight: 400;
                    opacity: 0.9;
                }
            }
            
            .recommend-list {
                padding: 20px;
                
                .recommend-item {
                    background: #fff;
                    border-radius: 16px;
                    cursor: pointer;
                    margin-bottom: 18px;
                    transition: all 0.3s ease;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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
                        
                        .item-cover {
                            width: 70px;
                            height: 70px;
                            flex-shrink: 0;
                            overflow: hidden;
                            border-radius: 12px;
                            margin-right: 15px;
                            border: 1px solid #f0f0f0;
                            
                            img {
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
                                
                                span {
                                    display: flex;
                                    align-items: center;
                                    
                                    i {
                                        margin-right: 4px;
                                        font-size: 13px;
                                    }
                                }
                            }
                        }
                    }
                    
                    &:hover .item-cover img {
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
                padding: 40px 20px;
                text-align: center;
                color: #999;
                
                i {
                    font-size: 48px;
                    margin-bottom: 15px;
                    color: #e0e0e0;
                }
                
                p {
                    font-size: 14px;
                    margin: 0;
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .recipe-container {
        flex-direction: column;
        padding: 20px;
        gap: 30px;
        
        .content-wrapper {
            width: 100%;
        }
        
        .recommend-sidebar {
            width: 100%;
            
            .diet-record-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
    }
}

@media (max-width: 768px) {
    .recipe-container {
        padding: 15px;
        
        .content-wrapper {
            .filter-section {
                padding: 20px;
                
                .filter-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .filter-content {
                    .type-tags {
                        justify-content: center;
                    }
                }
            }
            
            .recipe-list-section {
                .recipe-grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    padding: 20px;
                }
            }
        }
        
        .recommend-sidebar {
            .diet-record-card {
                flex-direction: column;
                text-align: center;
                gap: 20px;
            }
        }
    }
}
</style>