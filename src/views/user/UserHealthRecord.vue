<template>
  <div class="health-record-container">
    <!-- 头部筛选区域 -->
    <div class="filter-section">
      <div class="filter-header">
        <div class="header-content">
          <div class="header-title">
            <i class="el-icon-notebook-2"></i>
            <span>健康记录管理</span>
          </div>
          <div class="header-subtitle">
            <span>追踪您的健康数据变化</span>
          </div>
        </div>
      </div>
      
      <div class="filter-controls">
        <!-- 状态指示器 -->
        <div class="status-indicator">
          <div class="indicator-label">
            <i class="el-icon-odometer"></i>
            <span>记录状态</span>
          </div>
          <div class="indicator-items">
            <div class="indicator-item">
              <span class="status-dot normal-dot"></span>
              <span class="status-text">正常</span>
            </div>
            <div class="indicator-item">
              <span class="status-dot abnormal-dot"></span>
              <span class="status-text">异常</span>
            </div>
          </div>
        </div>
        
        <!-- 模型筛选 -->
        <div class="model-filter">
          <div class="filter-label">
            <i class="el-icon-s-operation"></i>
            <span>选择健康模型</span>
          </div>
          <div class="filter-select">
            <el-select 
              @change="fetchFreshData" 
              v-model="healthRecordQueryDto.healthModelId"
              placeholder="请选择要查看的健康模型"
              class="model-select"
            >
              <el-option 
                v-for="(item, index) in healthModelOptions" 
                :key="index" 
                :label="item.label" 
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康记录表格区域 -->
    <div class="record-table-section">
      <div class="table-header">
        <div class="table-title">
          <i class="el-icon-document"></i>
          <span>健康记录列表</span>
          <span class="table-count">(共 {{ apiResult.total }} 条记录)</span>
        </div>
      </div>

      <div class="table-container">
        <el-table 
          :data="apiResult.data"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :row-class-name="tableRowClassName"
        >
          <!-- 记录项列 -->
          <el-table-column prop="healthModelName" width="140" label="记录项" align="center">
            <template #default="scope">
              <div class="record-item-cell">
                <i class="el-icon-data-line"></i>
                <span>{{ scope.row.healthModelName }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 记录值列 -->
          <el-table-column prop="value" width="160" label="记录值" align="center">
            <template #default="scope">
              <div class="record-value-cell">
                <div class="value-number">{{ scope.row.value }}</div>
                <div class="value-unit">{{ scope.row.healthModelUnit }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 单位列 -->
          <!-- <el-table-column prop="healthModelUnit" width="100" label="单位" align="center">
            <template #default="scope">
              <div class="unit-cell">
                <span>{{ scope.row.healthModelUnit }}</span>
              </div>
            </template>
          </el-table-column> -->

          <!-- 指标情况列 -->
          <el-table-column prop="normalValue" label="指标情况" width="140" align="center">
            <template #default="scope">
              <div class="status-cell">
                <div class="status-indicator" :class="normalValueText(scope.row) ? 'status-normal' : 'status-abnormal'">
                  <span class="status-dot"></span>
                  <span class="status-text">
                    {{ normalValueText(scope.row) ? '正常' : '异常' }}
                  </span>
                </div>
                <div class="threshold-range" v-if="scope.row.normalValue">
                  {{ normalValueRangeText(scope.row) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 阈值范围列 -->
          <!-- <el-table-column prop="normalValue" label="参考范围" width="180" align="center">
            <template #default="scope">
              <div class="threshold-cell" v-if="scope.row.normalValue">
                <div class="threshold-content">
                  <i class="el-icon-s-data"></i>
                  <span>{{ normalValueRangeText(scope.row) }}</span>
                </div>
              </div>
            </template>
          </el-table-column> -->

          <!-- 创建时间列 -->
          <el-table-column prop="createTime" :sortable="true" width="180" label="记录时间" align="center">
            <template #default="scope">
              <div class="time-cell">
                <i class="el-icon-time"></i>
                <span>{{ formatTime(scope.row.createTime) }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="mini" 
                  type="danger" 
                  plain 
                  icon="el-icon-delete"
                  @click.stop="handleDelete(scope.row)"
                  class="delete-btn"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="apiResult.data.length === 0" class="empty-table">
          <div class="empty-content">
            <i class="el-icon-data-line empty-icon"></i>
            <p class="empty-text">暂无健康记录数据</p>
            <p class="empty-subtext">开始记录您的健康数据吧</p>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-section" v-if="apiResult.total > 0">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange"
          :current-page="healthRecordQueryDto.current" 
          :page-sizes="[5, 10, 15, 20]"
          :page-size="healthRecordQueryDto.size" 
          layout="total, sizes, prev, pager, next, jumper"
          :total="apiResult.total"
          background
          class="record-pagination"
        ></el-pagination>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog 
      title="删除确认" 
      :visible.sync="dialogDeletedVisible" 
      width="420px"
      center
      :close-on-click-modal="false"
      class="delete-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <div class="dialog-text">
          <p class="dialog-title">确定要删除这条健康记录吗？</p>
          <p class="dialog-desc">删除后数据将无法恢复，请谨慎操作</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button 
          @click="dialogDeletedVisible = false"
          class="cancel-button"
        >
          取消
        </el-button>
        <el-button 
          type="danger" 
          @click="confirmDeleted"
          class="confirm-button"
        >
          确定删除
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      apiResult: {
        data: [],
        total: 0,
      },
      healthRecordQueryDto: {
        current: 1,
        size: 5,
        healthModelId: null,
      },
      dialogDeletedVisible: false,
      healthModelOptions: [],
    };
  },
  created() {
    this.fetchHealthModelOptions();
    this.fetchFreshData();
  },
  methods: {
    normalValueRangeText(healthModel) {
      if (!healthModel.normalValue) return '';
      const valueRange = healthModel.normalValue.split(',');
      return `${valueRange[0]} ~ ${valueRange[1]} ${healthModel.healthModelUnit}`;
    },
    
    normalValueText(healthModel) {
      if (!healthModel.normalValue) return true;
      const valueRange = healthModel.normalValue.split(',');
      return healthModel.value > valueRange[0] && healthModel.value < valueRange[1];
    },
    
    formatTime(timeString) {
      if (!timeString) return '';
      return timeString.split(' ')[0];
    },
    
    async fetchHealthModelOptions() {
      try {
        const { data } = await this.$axios.get('/health-model/optionsUser');
        this.healthModelOptions = data;
        // 传递选项给父组件
        this.$emit('listnerModelOptions', JSON.parse(JSON.stringify(data)));
        // 添加"全部"选项
        this.healthModelOptions.unshift({ value: null, label: '全部' });
      } catch (error) {
        this.$message.info(error.message);
      }
    },
    
    async fetchFreshData() {
      try {
        const { data, total } = await this.$axios.post('/health-record/listUser', this.healthRecordQueryDto);
        this.apiResult.data = data;
        this.apiResult.total = total;
      } catch (error) {
        console.error('查询健康记录信息异常:', error);
        this.$message.error('加载失败，请重试');
      }
    },
    
    handleSizeChange(size) {
      this.healthRecordQueryDto.size = size;
      this.healthRecordQueryDto.current = 1;
      this.fetchFreshData();
    },
    
    handleCurrentChange(current) {
      this.healthRecordQueryDto.current = current;
      this.fetchFreshData();
    },
    
    handleDelete(row) {
      this.dialogDeletedVisible = true;
      this.id = row.id;
    },
    
    async confirmDeleted() {
      try {
        const { code } = await this.$axios.delete(`/health-record/${this.id}`);
        if (code === 200) {
          this.$notify.success({
            title: '操作成功',
            message: '健康记录已删除',
            duration: 2000,
          });
          this.dialogDeletedVisible = false;
          this.id = null;
          this.fetchFreshData();
        }
      } catch (error) {
        console.log("删除健康记录数据异常：", error);
        this.$message.error('删除失败，请重试');
      }
    },
    
    headerCellStyle() {
      return {
        backgroundColor: '#f8faff',
        color: '#333',
        fontWeight: '600',
        fontSize: '14px'
      };
    },
    
    tableRowClassName({ rowIndex }) {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    }
  }
};
</script>

<style scoped lang="scss">
.health-record-container {
  padding: 0;
  background: transparent;
  
  /* 筛选区域 */
  .filter-section {
    background: #fff;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 8px 25px rgba(107, 184, 255, 0.1);
    border: 1px solid rgba(107, 184, 255, 0.1);
    
    .filter-header {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
      
      .header-content {
        .header-title {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
          
          i {
            font-size: 28px;
            color: #6bb8ff;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          span {
            font-size: 22px;
            font-weight: 700;
            color: #333;
          }
        }
        
        .header-subtitle {
          span {
            font-size: 15px;
            color: #666;
            font-weight: 500;
          }
        }
      }
    }
    
    .filter-controls {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 40px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 25px;
      }
      
      .status-indicator {
        .indicator-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          
          i {
            color: #57aaff;
          }
        }
        
        .indicator-items {
          display: flex;
          gap: 25px;
          
          .indicator-item {
            display: flex;
            align-items: center;
            gap: 10px;
            
            .status-dot {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              display: inline-block;
              
              &.normal-dot {
                background: linear-gradient(135deg, #67C23A, #85ce61);
                box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
              }
              
              &.abnormal-dot {
                background: linear-gradient(135deg, #F56C6C, #f78989);
                box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
              }
            }
            
            .status-text {
              font-size: 14px;
              color: #666;
              font-weight: 500;
            }
          }
        }
      }
      
      .model-filter {
        .filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          
          i {
            color: #57aaff;
          }
        }
        
        .filter-select {
          .model-select {
            width: 100%;
            
            ::v-deep .el-input__inner {
              border-radius: 12px;
              border: 2px solid #e8f4ff;
              padding: 12px 15px;
              font-size: 14px;
              transition: all 0.3s ease;
              
              &:focus {
                border-color: #57aaff;
                box-shadow: 0 0 0 2px rgba(87, 170, 255, 0.2);
              }
            }
          }
        }
      }
    }
  }
  
  /* 记录表格区域 */
  .record-table-section {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
    
    .table-header {
      padding: 25px 30px;
      background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
      border-bottom: 1px solid #f0f0f0;
      
      .table-title {
        display: flex;
        align-items: center;
        gap: 12px;
        
        i {
          font-size: 22px;
          color: #6bb8ff;
        }
        
        span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .table-count {
          font-size: 14px;
          color: #666;
          font-weight: 400;
        }
      }
    }
    
    .table-container {
      padding: 0 30px;
      
      /* 表格单元格样式 */
      .record-item-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
        color: #333;
        
        i {
          color: #57aaff;
          font-size: 16px;
        }
      }
      
      .record-value-cell {
        text-align: center;
        
        .value-number {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .value-unit {
          font-size: 13px;
          color: #666;
        }
      }
      
      .unit-cell {
        span {
          background: rgba(107, 184, 255, 0.1);
          color: #57aaff;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
      }
      
      .status-cell {
        text-align: center;
        
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 6px;
          
          &.status-normal {
            background: rgba(103, 194, 58, 0.1);
            
            .status-dot {
              background: #67C23A;
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            
            .status-text {
              color: #67C23A;
              font-weight: 600;
            }
          }
          
          &.status-abnormal {
            background: rgba(245, 108, 108, 0.1);
            
            .status-dot {
              background: #F56C6C;
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            
            .status-text {
              color: #F56C6C;
              font-weight: 600;
            }
          }
        }
        
        .threshold-range {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
      }
      
      .threshold-cell {
        .threshold-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(107, 184, 255, 0.05);
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e6f2ff;
          
          i {
            color: #57aaff;
            font-size: 14px;
          }
          
          span {
            font-size: 13px;
            color: #666;
          }
        }
      }
      
      .time-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
        
        i {
          color: #57aaff;
          font-size: 16px;
        }
      }
      
      .action-buttons {
        display: flex;
        justify-content: center;
        
        .delete-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 12px;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(245, 108, 108, 0.1);
            transform: translateY(-1px);
          }
        }
      }
      
      /* 空状态 */
      .empty-table {
        padding: 80px 20px;
        text-align: center;
        
        .empty-content {
          .empty-icon {
            font-size: 64px;
            color: #e0e0e0;
            margin-bottom: 20px;
          }
          
          .empty-text {
            font-size: 18px;
            color: #999;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .empty-subtext {
            font-size: 14px;
            color: #ccc;
          }
        }
      }
    }
    
    /* 分页区域 */
    .pagination-section {
      padding: 25px 30px;
      border-top: 1px solid #f0f0f0;
      background: #fafcff;
      
      .record-pagination {
        justify-content: center;
      }
    }
  }
  
  /* 表格行样式 */
  ::v-deep .el-table {
    .even-row {
      background-color: #fafcff;
    }
    
    .odd-row {
      background-color: #fff;
    }
    
    .el-table__row:hover {
      background-color: #f0f7ff !important;
    }
  }
  
  /* 删除确认对话框 */
  .delete-dialog {
    ::v-deep .el-dialog {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      
      .el-dialog__header {
        padding: 20px 30px;
        background: linear-gradient(90deg, #f8faff, #f0f7ff);
        border-bottom: 1px solid #f0f7ff;
        
        .el-dialog__title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
      
      .el-dialog__body {
        padding: 30px;
        
        .dialog-content {
          text-align: center;
          
          .dialog-icon {
            i {
              font-size: 48px;
              color: #ffa726;
              margin-bottom: 20px;
            }
          }
          
          .dialog-text {
            .dialog-title {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
            }
            
            .dialog-desc {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
          }
        }
      }
      
      .el-dialog__footer {
        padding: 20px 30px;
        border-top: 1px solid #f0f7ff;
        
        .dialog-footer {
          display: flex;
          justify-content: center;
          gap: 20px;
          
          .cancel-button {
            padding: 10px 24px;
            border-radius: 12px;
            font-size: 14px;
            border-color: #dcdfe6;
            color: #606266;
            
            &:hover {
              border-color: #c0c4cc;
              background: #f5f7fa;
            }
          }
          
          .confirm-button {
            padding: 10px 24px;
            border-radius: 12px;
            font-size: 14px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            border: none;
            
            &:hover {
              background: linear-gradient(135deg, #ff8e8e, #ff6b6b);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
            }
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .health-record-container {
    .filter-section {
      padding: 25px;
    }
    
    .record-table-section {
      .table-header {
        padding: 20px 25px;
      }
      
      .table-container {
        padding: 0 20px;
      }
      
      .pagination-section {
        padding: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .health-record-container {
    .filter-section {
      padding: 20px;
    }
    
    .record-table-section {
      .table-header {
        padding: 18px 20px;
      }
      
      .table-container {
        padding: 0 15px;
        overflow-x: auto;
      }
      
      .pagination-section {
        padding: 18px 20px;
      }
    }
  }
}
</style>