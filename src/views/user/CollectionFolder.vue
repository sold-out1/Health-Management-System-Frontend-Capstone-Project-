<template>
  <div class="collection-container">
    <!-- 页面头部 -->
    <div class="collection-header">
      <div class="header-content">
        <div class="header-title">
          <i class="el-icon-folder-checked header-icon"></i>
          <span class="title-text">我的收藏</span>
        </div>
        <div class="header-subtitle">
          <span class="subtitle-text">精心挑选，随时重温</span>
          <!-- <span class="collection-count">共收藏 {{ totalCount }} 项内容</span> -->
        </div>
      </div>
      
      <div class="header-tabs">
        <div 
          class="tab-item" 
          :class="{ 'active': activeTab === 'health' }"
          @click="switchTab('health')"
        >
          <i class="el-icon-news"></i>
          <span>健康资讯</span>
          <span class="tab-count" v-if="healthNewsCount > 0">{{ healthNewsCount }}</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ 'active': activeTab === 'recipe' }"
          @click="switchTab('recipe')"
        >
          <i class="el-icon-knife-fork"></i>
          <span>健康食谱</span>
          <span class="tab-count" v-if="recipeCount > 0">{{ recipeCount }}</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="collection-content">
      <!-- 健康资讯收藏 -->
      <div class="collection-section" v-show="activeTab === 'health'">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-news"></i>
            <span>收藏的健康资讯</span>
          </div>
          <div class="section-actions">
            <el-button 
              type="text" 
              icon="el-icon-s-operation" 
              @click="toggleHealthNewsView"
              class="view-toggle"
            >
              {{ healthNewsViewMode === 'grid' ? '列表视图' : '网格视图' }}
            </el-button>
          </div>
        </div>
        
        <div class="section-content" :class="`view-${healthNewsViewMode}`">
          <CollectionHealthNews 
            ref="healthNewsRef" 
            @update:count="updateHealthNewsCount"
          />
        </div>
      </div>

      <!-- 食谱收藏 -->
      <div class="collection-section" v-show="activeTab === 'recipe'">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-knife-fork"></i>
            <span>收藏的健康食谱</span>
          </div>
          <div class="section-actions">
            <el-button 
              type="text" 
              icon="el-icon-s-operation" 
              @click="toggleRecipeView"
              class="view-toggle"
            >
              {{ recipeViewMode === 'grid' ? '列表视图' : '网格视图' }}
            </el-button>
          </div>
        </div>
        
        <div class="section-content" :class="`view-${recipeViewMode}`">
          <CollectionRecipe 
            ref="recipeRef" 
            @update:count="updateRecipeCount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CollectionHealthNews from "@/views/user/CollectionHealthNews.vue";
import CollectionRecipe from "@/views/user/CollectionRecipe.vue";

export default {
  components: { 
    CollectionHealthNews,
    CollectionRecipe 
  },
  
  data() {
    return {
      activeTab: 'health', // 当前激活的标签页
      healthNewsCount: 0, // 健康资讯收藏数量
      recipeCount: 0, // 食谱收藏数量
      healthNewsViewMode: 'grid', // 健康资讯视图模式
      recipeViewMode: 'grid' // 食谱视图模式
    };
  },

  computed: {
    totalCount() {
      return this.healthNewsCount + this.recipeCount;
    }
  },

  methods: {
    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab;
    },
    
    // 切换健康资讯视图模式
    toggleHealthNewsView() {
      this.healthNewsViewMode = this.healthNewsViewMode === 'grid' ? 'list' : 'grid';
    },
    
    // 切换食谱视图模式
    toggleRecipeView() {
      this.recipeViewMode = this.recipeViewMode === 'grid' ? 'list' : 'grid';
    },
    
    // 更新健康资讯收藏数量
    updateHealthNewsCount(count) {
      this.healthNewsCount = count;
    },
    
    // 更新食谱收藏数量
    updateRecipeCount(count) {
      this.recipeCount = count;
    },
    
    // 刷新收藏数据
    refreshCollections() {
      if (this.$refs.healthNewsRef && this.$refs.healthNewsRef.refresh) {
        this.$refs.healthNewsRef.refresh();
      }
      if (this.$refs.recipeRef && this.$refs.recipeRef.refresh) {
        this.$refs.recipeRef.refresh();
      }
    }
  },
  
  mounted() {
    // 页面加载时自动刷新数据
    this.$nextTick(() => {
      this.refreshCollections();
    });
  }
};
</script>

<style scoped lang="scss">
.collection-container {
  min-height: calc(100vh - 120px);
  padding: 30px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
  box-sizing: border-box;
  
  // 页面头部
  .collection-header {
    background: #fff;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 8px 25px rgba(87, 170, 255, 0.1);
    border: 1px solid rgba(107, 184, 255, 0.1);
    
    .header-content {
      margin-bottom: 25px;
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 12px;
        
        .header-icon {
          font-size: 32px;
          color: #6bb8ff;
          background: linear-gradient(135deg, #6bb8ff, #57aaff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .title-text {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          background: linear-gradient(135deg, #1a1a1a, #333);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      
      .header-subtitle {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .subtitle-text {
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }
        
        .collection-count {
          background: linear-gradient(135deg, rgba(107, 184, 255, 0.1), rgba(87, 170, 255, 0.05));
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 14px;
          color: #57aaff;
          font-weight: 600;
          border: 1px solid rgba(87, 170, 255, 0.2);
        }
      }
    }
    
    .header-tabs {
      display: flex;
      gap: 10px;
      border-bottom: 2px solid #f0f7ff;
      padding-bottom: 5px;
      
      .tab-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 12px 12px 0 0;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
        font-weight: 500;
        color: #666;
        position: relative;
        
        &:hover {
          background: rgba(107, 184, 255, 0.05);
          color: #57aaff;
        }
        
        &.active {
          background: linear-gradient(135deg, #6bb8ff, #57aaff);
          color: white;
          box-shadow: 0 4px 12px rgba(87, 170, 255, 0.3);
          
          .tab-count {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }
        }
        
        i {
          font-size: 18px;
        }
        
        .tab-count {
          background: rgba(107, 184, 255, 0.1);
          color: #57aaff;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
          min-width: 24px;
          text-align: center;
        }
      }
    }
  }
  
  // 主要内容区域
  .collection-content {
    .collection-section {
      background: #fff;
      border-radius: 20px;
      margin-bottom: 30px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 12px 30px rgba(87, 170, 255, 0.15);
        transform: translateY(-2px);
      }
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        border-bottom: 1px solid #f0f7ff;
        background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          
          i {
            font-size: 22px;
            color: #6bb8ff;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          span {
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }
        }
        
        .section-actions {
          .view-toggle {
            color: #57aaff;
            font-weight: 500;
            
            &:hover {
              color: #6bb8ff;
              background: rgba(107, 184, 255, 0.05);
            }
          }
        }
      }
      
      .section-content {
        padding: 25px 30px;
        
        &.view-grid {
          // 网格视图样式
        }
        
        &.view-list {
          // 列表视图样式
          padding: 0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .collection-container {
    padding: 20px;
    
    .collection-header {
      padding: 25px;
      
      .header-content {
        .header-title {
          .title-text {
            font-size: 24px;
          }
        }
      }
      
      .header-tabs {
        .tab-item {
          padding: 10px 20px;
          font-size: 15px;
        }
      }
    }
    
    .collection-content {
      .collection-section {
        .section-header {
          padding: 20px 25px;
          
          .section-title {
            span {
              font-size: 18px;
            }
          }
        }
        
        .section-content {
          padding: 20px 25px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .collection-container {
    padding: 15px;
    
    .collection-header {
      padding: 20px;
      border-radius: 16px;
      
      .header-content {
        .header-title {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          
          .title-text {
            font-size: 22px;
          }
        }
        
        .header-subtitle {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
      }
      
      .header-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
        
        .tab-item {
          padding: 10px 15px;
          font-size: 14px;
          white-space: nowrap;
        }
      }
    }
    
    .collection-content {
      .collection-section {
        border-radius: 16px;
        
        .section-header {
          padding: 18px 20px;
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
          
          .section-title {
            span {
              font-size: 16px;
            }
          }
          
          .section-actions {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }
        
        .section-content {
          padding: 18px 20px;
        }
      }
    }
  }
}

// 空状态样式
.empty-collection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #999;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    color: #ccc;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 16px;
    margin-bottom: 15px;
    color: #666;
  }
  
  .empty-action {
    color: #57aaff;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease;
    
    &:hover {
      color: #6bb8ff;
    }
  }
}
</style>