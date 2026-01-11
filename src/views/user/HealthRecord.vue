<template>
  <div class="health-record-detail-container">
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
                <i class="el-icon-notebook-2 header-icon"></i>
                <span class="header-title">健康记录</span>
                <span class="header-subtitle">记录您的健康数据</span>
              </div>
            </template>
          </el-page-header>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧模型选择区域 -->
      <div class="model-selection-section">
        <div class="selection-card">
          <div class="card-header">
            <div class="header-title">
              <i class="el-icon-s-data"></i>
              <span>选择健康模型</span>
            </div>
            <div class="header-description">
              <span>选择需要记录的健康指标</span>
            </div>
          </div>
          <div class="card-body">
            <UserHealthModel @selected="modelSelected" />
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
                <span class="title-text">记录健康数据</span>
              </div>
              <div class="action-section" @click="modelList = []">
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
              <span>填写各项健康指标的具体数值</span>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-content">
            <!-- 空状态 -->
            <div v-if="!modelList.length" class="empty-state">
              <div class="empty-content">
                <i class="el-icon-document-empty empty-icon"></i>
                <p class="empty-title">未选择健康模型</p>
                <p class="empty-description">请从左侧选择需要记录的健康指标</p>
              </div>
            </div>

            <!-- 模型列表 -->
            <div class="model-list" v-if="modelList.length">
              <div 
                class="model-item" 
                v-for="(healthModel, index) in modelList" 
                :key="index"
              >
                <div class="model-header">
                  <div class="model-name">
                    <i class="el-icon-monitor"></i>
                    <span class="name-text">{{ healthModel.name }}</span>
                    <span class="model-unit" v-if="healthModel.unit">
                      ({{ healthModel.unit }})
                    </span>
                  </div>
                  <div class="model-tooltip">
                    <el-tooltip 
                      class="item" 
                      effect="dark" 
                      :content="healthModel.detail || '暂无详细说明'" 
                      placement="top"
                    >
                      <i class="el-icon-question tooltip-icon"></i>
                    </el-tooltip>
                  </div>
                </div>
                
                <div class="model-input">
                  <el-input 
                    v-model="healthModel.value" 
                    :placeholder="` `"
                    class="custom-input"
                    @keyup.enter="saveHealthRecord"
                  >
                    <!-- <template #prefix>
                      <i class="el-icon-edit"></i>
                    </template> -->
                    <template #append>
                      <span class="input-unit">{{ healthModel.unit || '单位' }}</span>
                    </template>
                  </el-input>
                </div>

                <!-- 阈值提示 -->
                <div class="threshold-hint" v-if="healthModel.normalValue">
                  <i class="el-icon-info"></i>
                  <span class="hint-text">
                    参考范围：{{ healthModel.normalValue }}
                  </span>
                </div>
              </div>

              <!-- 提交按钮 -->
              <div class="submit-section">
                <el-button 
                  type="primary" 
                  class="submit-button"
                  @click="saveHealthRecord"
                  :loading="loading"
                >
                  <i class="el-icon-success"></i>
                  <span class="button-text">立即保存记录</span>
                </el-button>
                <p class="submit-hint">
                  将保存 {{ modelList.length }} 条健康记录
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
import UserHealthModel from '@/views/user/UserHealthModel';

export default {
  components: { UserHealthModel },
  name: "HealthRecord",
  data() {
    return {
      modelList: [], // 选中的模型项
      loading: false,
    }
  },
  methods: {
    async saveHealthRecord() {
      if (this.modelList.length === 0) {
        this.$message.warning('请先选择健康模型');
        return;
      }

      // 验证输入
      const invalidItems = this.modelList.filter(item => 
        !item.value || isNaN(item.value)
      );
      
      if (invalidItems.length > 0) {
        this.$message.error('请填写有效的数值');
        return;
      }

      this.loading = true;
      try {
        const healthRecordList = this.modelList.map(healthModel => ({
          healthModelId: healthModel.id,
          value: healthModel.value
        }));

        const { message } = await this.$axios.post('/health-record/batchSave', healthRecordList);
        
        this.$notify.success({
          title: '操作成功',
          message: message,
          duration: 2000,
          position: 'bottom-right'
        });

        // 延迟返回首页，让用户看到成功提示
        setTimeout(() => {
          this.$router.push('/user');
        }, 1500);
      } catch (error) {
        console.error('健康记录异常:', error);
        this.$message.error(error.message || '保存失败，请重试');
      } finally {
        this.loading = false;
      }
    },

    modelSelected(model) {
      // 检查是否已存在
      const exists = this.modelList.some(item => item.id === model.id);
      
      if (exists) {
        this.$notify.info({
          title: '提示',
          message: '该健康指标已添加',
          duration: 1500,
          position: 'bottom-right'
        });
        return;
      }

      // 添加新模型，确保有value属性
      this.modelList.push({
        ...model,
        value: ''
      });

      this.$notify.success({
        title: '添加成功',
        message: `已添加${model.name}`,
        duration: 1500,
        position: 'bottom-right'
      });
    },

    goBack() {
      if (this.modelList.length > 0) {
        this.$confirm('您有未保存的健康记录，确定要离开吗？', '提示', {
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
    }
  }
}
</script>

<style scoped lang="scss">
.health-record-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f9ff 0%, #e6f2ff 100%);
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
              color: #6bb8ff;
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
            color: #6bb8ff;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
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

  /* 左侧模型选择区域 */
  .model-selection-section {
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
            color: #6bb8ff;
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
              color: #6bb8ff;
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
              background: rgba(107, 184, 255, 0.1);
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:hover {
                background: rgba(107, 184, 255, 0.2);
                transform: translateY(-1px);
                
                i {
                  transform: rotate(180deg);
                }
              }
              
              i {
                font-size: 16px;
                color: #6bb8ff;
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
              color: #e0e0e0;
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
        
        /* 模型列表 */
        .model-list {
          .model-item {
            background: #fafcff;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e8f4ff;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #6bb8ff;
              box-shadow: 0 4px 15px rgba(107, 184, 255, 0.15);
              transform: translateY(-2px);
            }
            
            .model-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              
              .model-name {
                display: flex;
                align-items: center;
                gap: 10px;
                
                i {
                  font-size: 18px;
                  color: #57aaff;
                }
                
                .name-text {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                }
                
                .model-unit {
                  font-size: 14px;
                  color: #666;
                  font-weight: 500;
                }
              }
              
              .model-tooltip {
                .tooltip-icon {
                  font-size: 16px;
                  color: #999;
                  cursor: pointer;
                  transition: color 0.3s ease;
                  
                  &:hover {
                    color: #57aaff;
                  }
                }
              }
            }
            
            .model-input {
              ::v-deep .custom-input {
                .el-input__inner {
                  border-radius: 12px;
                  border: 2px solid #e8f4ff;
                  padding: 12px 15px;
                  font-size: 16px;
                  height: 48px;
                  transition: all 0.3s ease;
                  
                  &:focus {
                    border-color: #57aaff;
                    box-shadow: 0 0 0 2px rgba(87, 170, 255, 0.2);
                  }
                }
                
                .el-input__prefix {
                  display: flex;
                  align-items: center;
                  padding-left: 15px;
                  
                  i {
                    color: #57aaff;
                    font-size: 18px;
                  }
                }
                
                .el-input-group__append {
                  background: rgba(107, 184, 255, 0.1);
                  border: 2px solid #e8f4ff;
                  border-left: none;
                  border-radius: 0 12px 12px 0;
                  
                  .input-unit {
                    color: #57aaff;
                    font-weight: 600;
                    padding: 0 15px;
                  }
                }
              }
            }
            
            .threshold-hint {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 10px;
              padding: 8px 12px;
              background: rgba(103, 194, 58, 0.1);
              border-radius: 8px;
              border: 1px solid rgba(103, 194, 58, 0.2);
              
              i {
                color: #67C23A;
                font-size: 14px;
              }
              
              .hint-text {
                font-size: 13px;
                color: #67C23A;
                font-weight: 500;
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
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border: none;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(107, 184, 255, 0.4);
              background: linear-gradient(135deg, #57aaff, #6bb8ff);
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
  .health-record-detail-container {
    padding: 15px;
    
    .navigation-section {
      .navigation-content {
        padding: 20px;
      }
    }
    
    .main-content {
      gap: 20px;
    }
    
    .model-selection-section,
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
      }
    }
  }
}
</style>