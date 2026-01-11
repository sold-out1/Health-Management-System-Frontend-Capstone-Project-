<template>
  <div class="diet-record-container">
    <!-- 头部导航区域 -->
    <div class="navigation-section">
      <div class="navigation-content">
        <div class="nav-header">
          <el-page-header 
            @back="goBack" 
            class="custom-page-header"
          >
            <template #content>
              <div class="header-content">
                <i class="el-icon-food header-icon"></i>
                <span class="header-title">记录饮食</span>
                <span class="header-subtitle">追踪您的每日饮食摄入</span>
              </div>
            </template>
          </el-page-header>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧食谱选择区域 -->
      <div class="recipe-selection-section">
        <div class="selection-card">
          <div class="card-header">
            <div class="header-title">
              <i class="el-icon-menu"></i>
              <span>选择食谱</span>
            </div>
            <div class="header-description">
              <span>选择您摄入的食物或菜品</span>
            </div>
          </div>
          <div class="card-body">
            <UserRecipe @selected="recipeSelected" />
          </div>
          
          <!-- 饮食历史 -->
          <div class="history-section">
            <div class="history-header">
              <i class="el-icon-time"></i>
              <span>最近饮食记录</span>
            </div>
            <div class="history-body">
              <UserDietHistory :notifyFlag="notifyFlag" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧记录区域 -->
      <div class="record-section">
        <div class="record-card">
          <!-- 记录区域标题 -->
          <div class="record-header">
            <div class="header-main">
              <div class="title-section">
                <i class="el-icon-edit-outline"></i>
                <span class="title-text">记录饮食摄入</span>
              </div>
              <div class="action-section" @click="recipeList = []">
                <el-tooltip 
                  class="item" 
                  effect="dark" 
                  content="清空选中项" 
                  placement="top"
                >
                  <div class="clear-button">
                    <i class="el-icon-s-open"></i>
                    <span class="button-text">清空</span>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="header-subtitle">
              <span>记录每种食物的摄入量</span>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-content">
            <!-- 空状态 -->
            <div v-if="!recipeList.length" class="empty-state">
              <div class="empty-content">
                <i class="el-icon-food empty-icon"></i>
                <p class="empty-title">未选择食谱</p>
                <p class="empty-description">请从左侧选择您摄入的食物或菜品</p>
              </div>
            </div>

            <!-- 食谱列表 -->
            <div class="recipe-list" v-if="recipeList.length">
              <div 
                class="recipe-item" 
                v-for="(recipe, index) in recipeList" 
                :key="index"
              >
                <div class="recipe-header">
                  <div class="recipe-name">
                    <i class="el-icon-dish"></i>
                    <span class="name-text">{{ recipe.name }}</span>
                  </div>
                  <div class="recipe-info">
                    <span class="calorie-info" v-if="recipe.calories">
                      <i class="el-icon-fire"></i>
                      {{ recipe.calories }} 千卡/100g
                    </span>
                  </div>
                </div>
                
                <div class="recipe-input">
                  <el-input 
                    v-model="recipe.value" 
                    placeholder="请输入食用量（单位：克）"
                    class="custom-input"
                    type="number"
                    min="0"
                    @keyup.enter="saveDiet"
                  >
                    <template #prefix>
                      <i class="el-icon-scale"></i>
                    </template>
                    <template #append>
                      <span class="input-unit">克(g)</span>
                    </template>
                  </el-input>
                </div>

                <!-- 计算提示 -->
                <div class="calorie-hint" v-if="recipe.calories && recipe.value">
                  <i class="el-icon-calculator"></i>
                  <span class="hint-text">
                    约 {{ Math.round(recipe.calories * recipe.value / 100) }} 千卡
                  </span>
                </div>
              </div>

              <!-- 饮食记录内容 -->
              <div class="remark-section">
                <div class="remark-header">
                  <i class="el-icon-edit"></i>
                  <span class="remark-title">饮食记录内容</span>
                </div>
                <div class="remark-input">
                  <el-input 
                    type="textarea" 
                    :rows="3" 
                    placeholder="添加记录内容，如：用餐时间、用餐地点、感受等..."
                    v-model="detail"
                    class="custom-textarea"
                    maxlength="200"
                    show-word-limit
                  >
                  </el-input>
                </div>
              </div>

              <!-- 统计信息 -->
              <div class="statistics-section" v-if="recipeList.length">
                <div class="statistics-card">
                  <div class="statistics-header">
                    <i class="el-icon-s-data"></i>
                    <span>本次摄入统计</span>
                  </div>
                  <div class="statistics-content">
                    <div class="stat-item">
                      <span class="stat-label">食物种类</span>
                      <span class="stat-value">{{ recipeList.length }} 种</span>
                    </div>
                    <!--  -->
                    <div class="stat-item">
                      <span class="stat-label">记录内容</span>
                      <span class="stat-value" :class="{'no-remark': !detail}">
                        {{ detail ? '已添加' : '未添加' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 提交按钮 -->
              <div class="submit-section">
                <el-button 
                  type="primary" 
                  class="submit-button"
                  @click="saveDiet"
                  :loading="loading"
                >
                  <i class="el-icon-success"></i>
                  <span class="button-text">保存饮食记录</span>
                </el-button>
                <p class="submit-hint">
                  将记录 {{ recipeList.length }} 种食物的摄入
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserRecipe from '@/views/user/UserRecipe';
import UserDietHistory from '@/views/user/UserDietHistory';

export default {
  components: { UserRecipe, UserDietHistory },
  name: "DietRecord",
  data() {
    return {
      recipeList: [],
      detail: '',
      notifyFlag: false,
      loading: false,
    }
  },
  methods: {
    async saveDiet() {
      if (this.recipeList.length === 0) {
        this.$message.warning('请先选择食谱');
        return;
      }

      // 验证输入
      const invalidItems = this.recipeList.filter(item => 
        !item.value || isNaN(item.value) || Number(item.value) <= 0
      );
      
      if (invalidItems.length > 0) {
        this.$message.error('请填写有效的摄入量（大于0的数字）');
        return;
      }

      this.loading = true;
      try {
        const recipeList = this.recipeList.map(recipe => ({
          recipeId: recipe.id,
          detail: this.detail,
          value: recipe.value
        }));

        const { message } = await this.$axios.post('/diet-history/save', recipeList);
        
        this.$notify.success({
          title: '操作成功',
          message: message,
          duration: 2000,
          position: 'bottom-right'
        });

        // 重置数据
        this.recipeList = [];
        this.detail = '';
        this.notifyFlag = !this.notifyFlag;
        
      } catch (error) {
        console.error('饮食记录异常:', error);
        this.$message.error(error.message || '保存失败，请重试');
      } finally {
        this.loading = false;
      }
    },

    recipeSelected(recipe) {
      // 检查是否已存在
      const exists = this.recipeList.some(item => item.id === recipe.id);
      
      if (exists) {
        this.$notify.info({
          title: '提示',
          message: '该食谱已添加',
          duration: 1500,
          position: 'bottom-right'
        });
        return;
      }

      // 添加新食谱，确保有value属性
      this.recipeList.push({
        ...recipe,
        value: ''
      });

      this.$notify.success({
        title: '添加成功',
        message: `已添加${recipe.name}`,
        duration: 1500,
        position: 'bottom-right'
      });
    },

    goBack() {
      if (this.recipeList.length > 0 || this.detail) {
        this.$confirm('您有未保存的饮食记录，确定要离开吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$router.push('/user');
        }).catch(() => {});
      } else {
        this.$router.push('/user');
      }
    },

    calculateTotalCalories() {
      return this.recipeList.reduce((total, recipe) => {
        if (recipe.calories && recipe.value) {
          return total + Math.round(recipe.calories * recipe.value / 100);
        }
        return total;
      }, 0);
    }
  }
}
</script>

<style scoped lang="scss">
.diet-record-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fefaf7 0%, #f9f5f0 100%);
  padding: 20px;
  box-sizing: border-box;

  /* 导航区域 */
  .navigation-section {
    margin-bottom: 25px;
    
    .navigation-content {
      background: #fff;
      border-radius: 20px;
      padding: 25px 30px;
      box-shadow: 0 8px 25px rgba(107, 184, 255, 0.1);
      border: 1px solid rgba(107, 184, 255, 0.1);
      
      .nav-header {
        ::v-deep .custom-page-header {
          .el-page-header__left {
            .el-icon-back {
              font-size: 20px;
              color: #ffb36b;
            }
            
            .el-page-header__title {
              font-size: 16px;
              color: #666;
              font-weight: 500;
            }
          }
          
          .el-page-header__content {
            width: 100%;
          }
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 15px;
          
          .header-icon {
            font-size: 28px;
            color: #ff9800;
            background: linear-gradient(135deg, #ff9800, #ffb74d);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .header-title {
            font-size: 24px;
            font-weight: 700;
            color: #333;
          }
          
          .header-subtitle {
            font-size: 15px;
            color: #666;
            font-weight: 500;
            margin-left: auto;
            padding-right: 20px;
          }
        }
      }
    }
  }

  /* 主要内容区域 */
  .main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }

  /* 左侧食谱选择区域 */
  .recipe-selection-section {
    .selection-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(107, 184, 255, 0.1);
      border: 1px solid rgba(107, 184, 255, 0.1);
      height: 100%;
      
      .card-header {
        padding: 25px 30px;
        background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
        border-bottom: 1px solid #f0f0f0;
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          i {
            font-size: 22px;
            color: #ff9800;
          }
          
          span {
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }
        }
        
        .header-description {
          span {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      .card-body {
        padding: 25px 30px;
        max-height: 400px;
        overflow-y: auto;
        
        /* 自定义滚动条 */
        &::-webkit-scrollbar {
          width: 6px;
        }
        
        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
          
          &:hover {
            background: #a8a8a8;
          }
        }
      }
      
      .history-section {
        border-top: 1px solid #f0f0f0;
        margin-top: 20px;
        
        .history-header {
          padding: 20px 30px;
          background: #fafcff;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 10px;
          
          i {
            font-size: 18px;
            color: #ff9800;
          }
          
          span {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }
        
        .history-body {
          padding: 20px 30px;
          max-height: 300px;
          overflow-y: auto;
        }
      }
    }
  }

  /* 右侧记录区域 */
  .record-section {
    .record-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(107, 184, 255, 0.1);
      border: 1px solid rgba(107, 184, 255, 0.1);
      height: 100%;
      
      .record-header {
        padding: 25px 30px;
        background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
        border-bottom: 1px solid #f0f0f0;
        
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .title-section {
            display: flex;
            align-items: center;
            gap: 12px;
            
            i {
              font-size: 22px;
              color: #ff9800;
            }
            
            .title-text {
              font-size: 18px;
              font-weight: 600;
              color: #333;
            }
          }
          
          .action-section {
            .clear-button {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              background: rgba(255, 152, 0, 0.1);
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:hover {
                background: rgba(255, 152, 0, 0.2);
                transform: translateY(-1px);
                
                i {
                  transform: rotate(180deg);
                }
              }
              
              i {
                font-size: 16px;
                color: #ff9800;
                transition: transform 0.3s ease;
              }
              
              .button-text {
                font-size: 14px;
                color: #666;
                font-weight: 500;
              }
            }
          }
        }
        
        .header-subtitle {
          span {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      .input-content {
        padding: 30px;
        
        /* 空状态 */
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          
          .empty-content {
            .empty-icon {
              font-size: 64px;
              color: #ffd54f;
              margin-bottom: 20px;
            }
            
            .empty-title {
              font-size: 18px;
              color: #999;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .empty-description {
              font-size: 14px;
              color: #ccc;
            }
          }
        }
        
        /* 食谱列表 */
        .recipe-list {
          .recipe-item {
            background: #fffbf0;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #ffeaa7;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #ff9800;
              box-shadow: 0 4px 15px rgba(255, 152, 0, 0.15);
              transform: translateY(-2px);
            }
            
            .recipe-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              
              .recipe-name {
                display: flex;
                align-items: center;
                gap: 10px;
                
                i {
                  font-size: 18px;
                  color: #ff9800;
                }
                
                .name-text {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                }
              }
              
              .recipe-info {
                .calorie-info {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  color: #ff9800;
                  background: rgba(255, 152, 0, 0.1);
                  padding: 4px 10px;
                  border-radius: 12px;
                  
                  i {
                    font-size: 14px;
                  }
                }
              }
            }
            
            .recipe-input {
              ::v-deep .custom-input {
                .el-input__inner {
                  border-radius: 12px;
                  border: 2px solid #ffeaa7;
                  padding: 12px 15px;
                  font-size: 16px;
                  height: 48px;
                  transition: all 0.3s ease;
                  
                  &:focus {
                    border-color: #ff9800;
                    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
                  }
                }
                
                .el-input__prefix {
                  display: flex;
                  align-items: center;
                  padding-left: 15px;
                  
                  i {
                    color: #ff9800;
                    font-size: 18px;
                  }
                }
                
                .el-input-group__append {
                  background: rgba(255, 152, 0, 0.1);
                  border: 2px solid #ffeaa7;
                  border-left: none;
                  border-radius: 0 12px 12px 0;
                  
                  .input-unit {
                    color: #ff9800;
                    font-weight: 600;
                    padding: 0 15px;
                  }
                }
              }
            }
            
            .calorie-hint {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 10px;
              padding: 8px 12px;
              background: rgba(255, 87, 34, 0.1);
              border-radius: 8px;
              border: 1px solid rgba(255, 87, 34, 0.2);
              
              i {
                color: #ff5722;
                font-size: 14px;
              }
              
              .hint-text {
                font-size: 13px;
                color: #ff5722;
                font-weight: 500;
              }
            }
          }
        }
        
        /* 备注区域 */
        .remark-section {
          background: #f8f9ff;
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #e8f4ff;
          
          .remark-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            
            i {
              font-size: 18px;
              color: #6bb8ff;
            }
            
            .remark-title {
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }
          }
          
          .remark-input {
            ::v-deep .custom-textarea {
              .el-textarea__inner {
                border-radius: 12px;
                border: 2px solid #e8f4ff;
                padding: 12px 15px;
                font-size: 14px;
                transition: all 0.3s ease;
                
                &:focus {
                  border-color: #6bb8ff;
                  box-shadow: 0 0 0 2px rgba(107, 184, 255, 0.2);
                }
              }
            }
          }
        }
        
        /* 统计信息 */
        .statistics-section {
          .statistics-card {
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border-radius: 15px;
            padding: 20px;
            color: white;
            
            .statistics-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 20px;
              
              i {
                font-size: 20px;
              }
              
              span {
                font-size: 16px;
                font-weight: 600;
              }
            }
            
            .statistics-content {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 15px;
              
              .stat-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
                
                .stat-label {
                  font-size: 13px;
                  opacity: 0.9;
                }
                
                .stat-value {
                  font-size: 16px;
                  font-weight: 600;
                  
                  &.calorie-value {
                    color: #ffeb3b;
                  }
                  
                  &.no-remark {
                    opacity: 0.7;
                    font-style: italic;
                  }
                }
              }
            }
          }
        }
        
        /* 提交区域 */
        .submit-section {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          margin-top: 20px;
          
          .submit-button {
            padding: 14px 40px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 12px;
            background: linear-gradient(135deg, #ff9800, #ffb74d);
            border: none;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
              background: linear-gradient(135deg, #ffb74d, #ff9800);
            }
            
            &:active {
              transform: translateY(0);
            }
            
            i {
              font-size: 18px;
              margin-right: 8px;
            }
          }
          
          .submit-hint {
            margin-top: 12px;
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .diet-record-container {
    padding: 15px;
    
    .navigation-section {
      .navigation-content {
        padding: 20px;
      }
    }
    
    .main-content {
      gap: 20px;
    }
    
    .recipe-selection-section,
    .record-section {
      .selection-card,
      .record-card {
        .card-header,
        .record-header {
          padding: 20px;
        }
        
        .card-body,
        .input-content {
          padding: 20px;
        }
        
        .history-section {
          .history-header,
          .history-body {
            padding: 15px 20px;
          }
        }
      }
    }
    
    .statistics-section {
      .statistics-card {
        .statistics-content {
          grid-template-columns: 1fr !important;
        }
      }
    }
  }
}
</style>