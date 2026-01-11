<template>
  <div class="diet-history-container">
    <!-- 头部筛选区域 -->
    <div class="filter-section">
  
      <div class="filter-controls">
        <!-- 搜索区域 -->
        <div class="search-controls">
          <div class="search-box">
            <AutoInput 
              placeholder="搜索饮食记录..." 
              @listener="listener" 
              class="custom-search"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 饮食记录表格区域 -->
    <div class="history-table-section">
      <div class="table-header">
        <div class="table-title">
          <i class="el-icon-document"></i>
          <span>饮食记录列表</span>
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
          <!-- 内容列 -->
          <el-table-column prop="detail" label="记录" width="200">
            <template #default="scope">
              <div class="remark-cell">
                <div class="remark-tag">
                  <div class="remark-icon">
                    <i class="el-icon-edit-outline"></i>
                  </div>
                  <div class="remark-content">
                    <div class="remark-text">{{ scope.row.detail || '无标注' }}</div>
                    <div class="weight-info">
                      <i class="el-icon-scale"></i>
                      <span>{{ scope.row.value }}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 食谱名列 -->
          <el-table-column prop="recipeName" label="食谱名称" min-width="180">
            <template #default="scope">
              <div class="recipe-cell">
                <div class="recipe-info">
                  <div class="recipe-icon">
                    <i class="el-icon-food"></i>
                  </div>
                  <div class="recipe-name-text">{{ scope.row.recipeName }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 记录时间列 -->
          <el-table-column prop="createTime" label="记录时间" width="200" align="center">
            <template #default="scope">
              <div class="time-cell">
                <div class="time-icon">
                  <i class="el-icon-time"></i>
                </div>
                <div class="time-content">
                  <div class="time-text">{{ formatTime(scope.row.createTime) }}</div>
                  <div class="date-text">{{ formatDate(scope.row.createTime) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
         


          <!-- 操作列 -->
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="mini" 
                  type="danger" 
                  plain 
                  @click.stop="handleDelete(scope.row)"
                  class="delete-btn"
                >
                  <i class="el-icon-delete"></i>
                  <span class="btn-text">删除</span>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="apiResult.data.length === 0" class="empty-table">
          <div class="empty-content">
            <i class="el-icon-food empty-icon"></i>
            <p class="empty-text">暂无饮食记录数据</p>
            <p class="empty-subtext">开始记录您的饮食吧</p>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-section" v-if="apiResult.total > 0">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange"
          :current-page="recipeQueryDto.current" 
          :page-sizes="[3, 5, 10, 15]"
          :page-size="recipeQueryDto.size" 
          layout="total, sizes, prev, pager, next, jumper"
          :total="apiResult.total"
          background
          class="history-pagination"
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
          <p class="dialog-title">确定要删除这条饮食记录吗？</p>
          <p class="dialog-desc">删除后记录将无法恢复，请谨慎操作</p>
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
import AutoInput from "@/components/AutoInput.vue";

export default {
  components: { AutoInput },
  props: {
    notifyFlag: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    notifyFlag: {
      handler(newValue) {
        if (newValue) {
          this.fetchFreshData();
        }
      },
      deep: true,
      immediate: true
    },
  },
  data() {
    return {
      id: null,
      apiResult: {
        data: [],
        total: 0,
      },
      recipeQueryDto: {
        current: 1,
        size: 3,
        detail: ''
      },
      dialogDeletedVisible: false,
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    formatTime(timeString) {
      if (!timeString) return '';
      const time = new Date(timeString);
      return time.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    formatDate(timeString) {
      if (!timeString) return '';
      const time = new Date(timeString);
      return time.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    listener(text) {
      this.recipeQueryDto.detail = text;
      this.fetchFreshData();
    },
    
    async fetchFreshData() {
      try {
        const { data, total } = await this.$axios.post('/diet-history/listUser', this.recipeQueryDto);
        this.apiResult.data = data;
        this.apiResult.total = total;
      } catch (error) {
        console.error('查询饮食记录信息异常:', error);
        this.$message.error('加载失败，请重试');
      }
    },
    
    handleSizeChange(size) {
      this.recipeQueryDto.size = size;
      this.recipeQueryDto.current = 1;
      this.fetchFreshData();
    },
    
    handleCurrentChange(current) {
      this.recipeQueryDto.current = current;
      this.fetchFreshData();
    },
    
    handleDelete(row) {
      this.dialogDeletedVisible = true;
      this.id = row.id;
    },
    
    async confirmDeleted() {
      try {
        const { code } = await this.$axios.delete(`/diet-history/${this.id}`);
        if (code === 200) {
          this.$notify.success({
            title: '操作成功',
            message: '饮食记录已删除',
            duration: 2000,
            position: 'bottom-right'
          });
          this.dialogDeletedVisible = false;
          this.id = null;
          this.fetchFreshData();
        }
      } catch (error) {
        console.log("删除饮食记录数据异常：", error);
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
  },
};
</script>

<style scoped lang="scss">
.diet-history-container {
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
            color: #ff9800;
            background: linear-gradient(135deg, #ff9800, #ffb74d);
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
      .search-controls {
        .search-box {
          ::v-deep .custom-search {
            .el-input__inner {
              border-radius: 12px;
              border: 2px solid #e8f4ff;
              padding: 12px 15px 12px 40px;
              font-size: 14px;
              transition: all 0.3s ease;
              
              &:focus {
                border-color: #57aaff;
                box-shadow: 0 0 0 2px rgba(87, 170, 255, 0.2);
              }
            }
            
            .el-input__prefix {
              left: 12px;
              
              i {
                color: #57aaff;
              }
            }
          }
        }
      }
    }
  }
  
  /* 饮食记录表格区域 */
  .history-table-section {
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
          color: #ff9800;
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
      .remark-cell {
        .remark-tag {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          
          .remark-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            display: flex;
            align-items: center;
            justify-content: center;
            
            i {
              color: white;
              font-size: 18px;
            }
          }
          
          .remark-content {
            flex: 1;
            
            .remark-text {
              font-size: 14px;
              font-weight: 500;
              color: #333;
              line-height: 1.4;
              margin-bottom: 6px;
              word-break: break-word;
            }
            
            .weight-info {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: rgba(255, 152, 0, 0.1);
              padding: 4px 10px;
              border-radius: 12px;
              border: 1px solid rgba(255, 152, 0, 0.2);
              
              i {
                font-size: 12px;
                color: #ff9800;
              }
              
              span {
                font-size: 12px;
                color: #ff9800;
                font-weight: 600;
              }
            }
          }
        }
      }
      
      .recipe-cell {
        .recipe-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .recipe-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #ff9800, #ffb74d);
            display: flex;
            align-items: center;
            justify-content: center;
            
            i {
              color: white;
              font-size: 18px;
            }
          }
          
          .recipe-name-text {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
          }
        }
      }
      
      .time-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .time-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #67C23A, #85ce61);
          display: flex;
          align-items: center;
          justify-content: center;
          
          i {
            color: white;
            font-size: 18px;
          }
        }
        
        .time-content {
          text-align: left;
          
          .time-text {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
          }
          
          .date-text {
            font-size: 12px;
            color: #666;
          }
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
          
          i {
            font-size: 12px;
            margin-right: 4px;
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
            color: #ffd54f;
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
      
      .history-pagination {
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
  .diet-history-container {
    .filter-section {
      padding: 25px;
    }
    
    .history-table-section {
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
  .diet-history-container {
    .filter-section {
      padding: 20px;
    }
    
    .history-table-section {
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