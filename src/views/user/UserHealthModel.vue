<template>
  <div class="health-model-container">
    <!-- 头部筛选区域 --> 
    <div class="filter-section">

      <div class="filter-controls">
        <div class="type-filter">
          <div class="filter-label">
            <i class="el-icon-s-operation"></i>
            <span>模型类型</span>
          </div>
          <div class="filter-tabs">
            <Tab 
              :buttons="[
                { label: '公共模型', value: '0' },
                { label: '私人模型', value: '1' }
              ]" 
              initialActive="0" 
              @change="handleChange" 
              class="custom-tab"
            />
          </div>
        </div>

        <!-- 搜索和新增按钮 -->
        <div class="action-controls">
          <div class="search-box">
            <AutoInput 
              placeholder="搜索模型名称或描述..." 
              @listener="listener" 
              class="custom-search"
            />
          </div>
          <div class="add-button">
            <el-button 
              type="primary" 
              class="primary-btn"
              @click="savehealthModel"
            >
              <i class="el-icon-plus"></i>
              <span class="btn-text">新增模型</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型表格区域 -->
    <div class="model-table-section">
      <div class="table-header">
        <div class="table-title">
          <i class="el-icon-collection"></i>
          <span>模型列表</span>
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
          <!-- 图标列 -->
          <el-table-column prop="iconUrl" width="100" label="图标" align="center">
            <template #default="scope">
              <div class="icon-cell">
                <img 
                  :src="scope.row.iconUrl" 
                  :alt="scope.row.name"
                  class="model-icon"
                  v-if="scope.row.iconUrl"
                />
                <div class="icon-placeholder" v-else>
                  <i class="el-icon-picture"></i>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 模型名列 -->
          <el-table-column prop="name" label="模型名称" min-width="180">
            <template #default="scope">
              <div class="name-cell">
                <div class="name-text">{{ scope.row.name }}</div>
                <div class="detail-text" v-if="scope.row.detail">
                  {{ scope.row.detail }}
                </div>
              </div>
            </template>
          </el-table-column>


          <!-- 符号列 -->
          <el-table-column prop="symbol" width="120" label="符号" align="center">
            <template #default="scope">
              <div class="symbol-cell">
                <span class="symbol-text">{{ scope.row.symbol }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 阈值列 -->
          <el-table-column prop="normalValue" label="参考范围" width="200" align="center">
            <template #default="scope">
              <div class="threshold-cell" v-if="scope.row.normalValue">
                <div class="threshold-content">
                  <i class="el-icon-s-marketing"></i>
                  <span>{{ normalValueText(scope.row) }}</span>
                </div>
              </div>
              <div class="no-threshold" v-else>
                <span class="no-data">未设置</span>
              </div>
            </template>
          </el-table-column>

          <!-- 类型列 -->
          <el-table-column prop="isGlobal" label="类型" width="120" align="center">
            <template #default="scope">
              <div class="type-cell">
                <div class="type-indicator" :class="scope.row.isGlobal ? 'type-public' : 'type-private'">
                  <span class="type-dot"></span>
                  <span class="type-text">
                    {{ scope.row.isGlobal ? '私人' : '公共' }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="mini" 
                  type="primary" 
                  plain 
                  @click.stop="selectedModel(scope.row)"
                  class="select-btn"
                >
                  <i class="el-icon-finished"></i>
                  选中
                </el-button>
                
                <el-dropdown 
                  v-if="healthModelQueryDto.isGlobal" 
                  trigger="click" 
                  placement="bottom-end"
                  class="more-dropdown"
                >
                  <el-button 
                    size="mini" 
                    type="text" 
                    class="more-btn"
                  >
                    <i class="el-icon-more"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item 
                      @click.native="handleEdit(scope.row)" 
                      icon="el-icon-edit"
                      class="dropdown-item"
                    >
                      修改
                    </el-dropdown-item>
                    <el-dropdown-item 
                      @click.native="handleDelete(scope.row)" 
                      icon="el-icon-delete"
                      class="dropdown-item delete-item"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="apiResult.data.length === 0" class="empty-table">
          <div class="empty-content">
            <i class="el-icon-collection empty-icon"></i>
            <p class="empty-text">暂无健康模型数据</p>
            <p class="empty-subtext">点击"新增模型"按钮创建第一个健康模型</p>
            <el-button 
              type="primary" 
              class="empty-button"
              @click="savehealthModel"
            >
              <i class="el-icon-plus"></i>
              创建新模型
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-section" v-if="apiResult.total > 0">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange"
          :current-page="healthModelQueryDto.current" 
          :page-sizes="[5, 10, 15, 20]"
          :page-size="healthModelQueryDto.size" 
          layout="total, sizes, prev, pager, next, jumper"
          :total="apiResult.total"
          background
          class="model-pagination"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增/修改抽屉 -->
    <el-drawer 
      :title="isCreateMode ? '新增健康模型' : '修改健康模型'" 
      :visible.sync="drawer" 
      :direction="direction"
      size="500px"
      :before-close="handleClose"
      class="model-drawer"
    >
      <div class="drawer-content">
        <el-form 
          ref="healthModel" 
          :model="healthModel" 
          label-width="100px" 
          class="model-form"
        >
          <!-- 图标上传 -->
          <el-form-item label="模型图标" class="form-item-icon">
            <div class="icon-upload-section">
              <div class="icon-preview">
                <img 
                  v-if="iconUrl" 
                  :src="iconUrl" 
                  alt="模型图标" 
                  class="preview-image"
                />
                <div class="icon-placeholder-large" v-else>
                  <i class="el-icon-picture-outline"></i>
                  <span>未上传图标</span>
                </div>
              </div>
              <div class="upload-control">
                <el-upload 
                  class="icon-uploader" 
                  :action="fileUploadApi" 
                  :show-file-list="false"
                  :on-success="handleImageSuccess"
                  accept="image/*"
                >
                  <el-button 
                    type="primary" 
                    plain 
                    size="small"
                    class="upload-button"
                  >
                    <i class="el-icon-upload"></i>
                    选择图片
                  </el-button>
                  <div class="upload-hint">
                    建议尺寸：100×100像素，支持 JPG、PNG 格式
                  </div>
                </el-upload>
              </div>
            </div>
          </el-form-item>

          <!-- 名称 -->
          <el-form-item label="模型名称" class="form-item">
            <el-input 
              v-model="healthModel.name" 
              placeholder="请输入模型名称，100个字以内"
              class="custom-input"
              maxlength="100"
              show-word-limit
            >
              <template #prefix>
                <i class="el-icon-edit"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 单位 -->
          <el-form-item label="单位" class="form-item">
            <el-input 
              v-model="healthModel.unit" 
              placeholder="请输入单位"
              class="custom-input"
            >
              <template #prefix>
                <i class="el-icon-scale"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 符号 -->
          <el-form-item label="符号" class="form-item">
            <el-input 
              v-model="healthModel.symbol" 
              placeholder="请输入符号"
              class="custom-input"
            >
              <template #prefix>
                <i class="el-icon-s-grid"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 阈值 -->
          <el-form-item label="参考范围" class="form-item">
            <el-input 
              v-model="healthModel.normalValue" 
              placeholder="请输入正常阈值，格式：下限,上限"
              class="custom-input"
            >
              <template #prefix>
                <i class="el-icon-s-marketing"></i>
              </template>
              <template #append>
                <el-tooltip 
                  content="格式示例：36.5,37.2 表示36.5到37.2为正常范围"
                  placement="top"
                >
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

          <!-- 简介 -->
          <el-form-item label="模型简介" class="form-item">
            <el-input 
              v-model="healthModel.detail" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入模型简介，200个字以内"
              class="custom-textarea"
              maxlength="200"
              show-word-limit
            ></el-input>
          </el-form-item>

          <!-- 按钮 -->
          <el-form-item class="form-buttons">
            <el-button 
              type="primary" 
              class="submit-button"
              @click="isCreateMode ? onSavehealthModel() : onUpdatehealthModel()"
              :loading="loading"
            >
              {{ isCreateMode ? '立即新增' : '保存修改' }}
            </el-button>
            <el-button 
              @click="handleClose" 
              class="cancel-button"
            >
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

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
          <p class="dialog-title">确定要删除这个健康模型吗？</p>
          <p class="dialog-desc">删除后该模型相关的所有记录也将被删除，请谨慎操作</p>
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
import Tab from "@/components/Tab"

export default {
  components: { AutoInput, Tab },
  data() {
    return {
      fileUploadApi: '/api/v1.0/self-health-api/file/upload',
      drawer: false,
      direction: 'rtl',
      iconUrl: '',
      healthModel: {
        id: null,
        name: '',
        detail: '',
        iconUrl: '',
        unit: '',
        symbol: '',
        normalValue: '',
        userId: null,
        isGlobal: null,
        createTime: null
      },
      isCreateMode: true,
      loading: false,
      id: null,
      apiResult: {
        data: [],
        total: 0,
      },
      healthModelQueryDto: {
        current: 1,
        size: 5,
        isGlobal: false,
        name: ''
      },
      dialogDeletedVisible: false,
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    selectedModel(model) {
      this.$emit('selected', model);
    },
    
    handleChange(obj) {
      this.healthModelQueryDto.isGlobal = Number(obj.value);
      this.fetchFreshData();
    },
    
    normalValueText(healthModel) {
      if (!healthModel.normalValue) return '';
      const valueRange = healthModel.normalValue.split(',');
      if (valueRange.length !== 2) return healthModel.normalValue;
      return `${valueRange[0]} ~ ${valueRange[1]} ${healthModel.unit}`;
    },
    
    async onUpdatehealthModel() {
      try {
        this.loading = true;
        this.healthModel.iconUrl = this.iconUrl;
        const { message } = await this.$axios.put('/health-model/update', this.healthModel);
        
        this.$notify.success({
          title: '操作成功',
          message: message,
          duration: 2000,
          position: 'bottom-right'
        });
        
        this.handleClose();
        this.fetchFreshData();
      } catch (error) {
        this.$message.error(error.message || '修改失败');
      } finally {
        this.loading = false;
      }
    },
    
    async onSavehealthModel() {
      try {
        this.loading = true;
        this.healthModel.iconUrl = this.iconUrl;
        const { message } = await this.$axios.post('/health-model/save', this.healthModel);
        
        this.$notify.success({
          title: '操作成功',
          message: message,
          duration: 2000,
          position: 'bottom-right'
        });
        
        this.fetchFreshData();
        this.handleClose();
      } catch (error) {
        this.$message.error(error.message || '新增失败');
      } finally {
        this.loading = false;
      }
    },
    
    savehealthModel() {
      this.drawer = true;
      this.isCreateMode = true;
      this.healthModel = {
        id: null,
        name: '',
        detail: '',
        iconUrl: '',
        unit: '',
        symbol: '',
        normalValue: '',
        userId: null,
        isGlobal: null,
        createTime: null
      };
      this.iconUrl = '';
    },
    
    handleClose() {
      this.drawer = false;
      this.isCreateMode = true;
      this.healthModel = {
        id: null,
        name: '',
        detail: '',
        iconUrl: '',
        unit: '',
        symbol: '',
        normalValue: '',
        userId: null,
        isGlobal: null,
        createTime: null
      };
      this.iconUrl = '';
      this.loading = false;
    },
    
    handleImageSuccess(res) {
      if (res.code === 200) {
        this.iconUrl = res.data;
        this.$notify.success({
          title: '上传成功',
          message: '图标上传成功',
          duration: 1500,
          position: 'bottom-right'
        });
      } else {
        this.$notify.error({
          title: '上传失败',
          message: res.data || '上传失败，请重试',
          duration: 1500,
          position: 'bottom-right'
        });
      }
    },
    
    listener(text) {
      this.healthModelQueryDto.name = text;
      this.fetchFreshData();
    },
    
    async fetchFreshData() {
      try {
        const { data, total } = await this.$axios.post('/health-model/list', this.healthModelQueryDto);
        this.apiResult.data = data;
        this.apiResult.total = total;
      } catch (error) {
        console.error('查询健康模型信息异常:', error);
        this.$message.error('加载失败，请重试');
      }
    },
    
    handleSizeChange(size) {
      this.healthModelQueryDto.size = size;
      this.healthModelQueryDto.current = 1;
      this.fetchFreshData();
    },
    
    handleCurrentChange(current) {
      this.healthModelQueryDto.current = current;
      this.fetchFreshData();
    },
    
    handleEdit(data) {
      this.healthModel = { ...data };
      this.iconUrl = data.iconUrl;
      this.drawer = true;
      this.isCreateMode = false;
    },
    
    handleDelete(row) {
      this.dialogDeletedVisible = true;
      this.id = row.id;
    },
    
    async confirmDeleted() {
      try {
        const { code } = await this.$axios.delete(`/health-model/${this.id}`);
        if (code === 200) {
          this.$notify.success({
            title: '操作成功',
            message: '健康模型已删除',
            duration: 2000,
            position: 'bottom-right'
          });
          this.dialogDeletedVisible = false;
          this.id = null;
          this.fetchFreshData();
        }
      } catch (error) {
        console.log("删除健康模型数据异常：", error);
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
.health-model-container {
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
      margin-bottom: 30px;
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
      display: flex;
      flex-direction: column;
      gap: 25px;
      
      .type-filter {
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
        
        .filter-tabs {
          ::v-deep .custom-tab {
            .tab-buttons {
              background: #f8faff;
              border-radius: 12px;
              padding: 4px;
              border: 1px solid #e8f4ff;
              
              .tab-button {
                padding: 10px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                transition: all 0.3s ease;
                
                &:hover {
                  background: rgba(107, 184, 255, 0.1);
                  color: #57aaff;
                }
                
                &.active {
                  background: linear-gradient(135deg, #6bb8ff, #57aaff);
                  color: white;
                  box-shadow: 0 4px 12px rgba(107, 184, 255, 0.3);
                }
              }
            }
          }
        }
      }
      
      .action-controls {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .search-box {
          flex: 1;
          
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
        
        .add-button {
          .primary-btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border: none;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(107, 184, 255, 0.4);
              background: linear-gradient(135deg, #57aaff, #6bb8ff);
            }
            
            i {
              font-size: 16px;
              margin-right: 8px;
            }
          }
        }
      }
    }
  }
  
  /* 模型表格区域 */
  .model-table-section {
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
      .icon-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        
        .model-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid #e8f4ff;
          padding: 4px;
        }
        
        .icon-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f8faff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #e8f4ff;
          
          i {
            font-size: 20px;
            color: #c0c4cc;
          }
        }
      }
      
      .name-cell {
        .name-text {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .detail-text {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
      }
      
      .unit-cell {
        .unit-tag {
          background: rgba(107, 184, 255, 0.1);
          color: #57aaff;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
      }
      
      .symbol-cell {
        .symbol-text {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
      }
      
      .threshold-cell {
        .threshold-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(103, 194, 58, 0.05);
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(103, 194, 58, 0.1);
          
          i {
            color: #67C23A;
            font-size: 14px;
          }
          
          span {
            font-size: 13px;
            color: #67C23A;
            font-weight: 500;
          }
        }
      }
      
      .no-threshold {
        .no-data {
          color: #999;
          font-size: 13px;
        }
      }
      
      .type-cell {
        .type-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 20px;
          
          &.type-public {
            background: rgba(107, 184, 255, 0.1);
            
            .type-dot {
              background: #6bb8ff;
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            
            .type-text {
              color: #6bb8ff;
              font-weight: 600;
              font-size: 13px;
            }
          }
          
          &.type-private {
            background: rgba(255, 184, 0, 0.1);
            
            .type-dot {
              background: #ffb800;
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            
            .type-text {
              color: #ffb800;
              font-weight: 600;
              font-size: 13px;
            }
          }
        }
      }
      
      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        
        .select-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(107, 184, 255, 0.1);
            transform: translateY(-1px);
          }
          
          i {
            font-size: 12px;
            margin-right: 4px;
          }
        }
        
        .more-dropdown {
          .more-btn {
            padding: 6px;
            border-radius: 8px;
            
            &:hover {
              background: rgba(107, 184, 255, 0.1);
              color: #57aaff;
            }
          }
          
          ::v-deep .dropdown-item {
            padding: 8px 20px;
            font-size: 13px;
            
            &.delete-item {
              color: #f56c6c;
              
              &:hover {
                background: rgba(245, 108, 108, 0.1);
              }
            }
            
            &:hover {
              background: rgba(107, 184, 255, 0.1);
            }
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
            margin-bottom: 30px;
          }
          
          .empty-button {
            padding: 10px 24px;
            border-radius: 12px;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border: none;
            
            i {
              margin-right: 8px;
            }
          }
        }
      }
    }
    
    /* 分页区域 */
    .pagination-section {
      padding: 25px 30px;
      border-top: 1px solid #f0f0f0;
      background: #fafcff;
      
      .model-pagination {
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
  
  /* 抽屉样式 */
  .model-drawer {
    ::v-deep .el-drawer {
      .el-drawer__header {
        margin-bottom: 0;
        padding: 25px 30px;
        border-bottom: 1px solid #f0f0f0;
        background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
        
        span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
      
      .el-drawer__close-btn {
        font-size: 18px;
        color: #666;
        
        &:hover {
          color: #57aaff;
        }
      }
    }
    
    .drawer-content {
      padding: 30px;
      height: 100%;
      overflow-y: auto;
      
      .model-form {
        .form-item-icon {
          .icon-upload-section {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            
            .icon-preview {
              width: 100px;
              height: 100px;
              border-radius: 15px;
              border: 2px dashed #e8f4ff;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              background: #fafcff;
              
              .preview-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              
              .icon-placeholder-large {
                text-align: center;
                color: #c0c4cc;
                
                i {
                  font-size: 32px;
                  display: block;
                  margin-bottom: 8px;
                }
                
                span {
                  font-size: 12px;
                }
              }
            }
            
            .upload-control {
              flex: 1;
              
              .upload-button {
                margin-bottom: 10px;
              }
              
              .upload-hint {
                font-size: 12px;
                color: #999;
                line-height: 1.4;
              }
            }
          }
        }
        
        .form-item {
          ::v-deep .custom-input {
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
              left: 15px;
              display: flex;
              align-items: center;
              
              i {
                color: #57aaff;
                font-size: 16px;
              }
            }
            
            .el-input-group__append {
              background: transparent;
              border: none;
              padding: 0 15px;
              
              i {
                color: #999;
                cursor: pointer;
                
                &:hover {
                  color: #57aaff;
                }
              }
            }
          }
          
          ::v-deep .custom-textarea {
            .el-textarea__inner {
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
        
        .form-buttons {
          margin-top: 40px;
          
          .submit-button {
            padding: 12px 32px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border: none;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(107, 184, 255, 0.4);
            }
          }
          
          .cancel-button {
            padding: 12px 32px;
            border-radius: 12px;
            font-size: 14px;
            border-color: #dcdfe6;
            color: #606266;
            
            &:hover {
              border-color: #c0c4cc;
              background: #f5f7fa;
            }
          }
        }
      }
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
  .health-model-container {
    .filter-section {
      padding: 25px;
    }
    
    .model-table-section {
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
    
    .model-drawer {
      ::v-deep .el-drawer {
        width: 80% !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .health-model-container {
    .filter-section {
      padding: 20px;
      
      .filter-controls {
        .action-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 15px;
          
          .search-box,
          .add-button {
            width: 100%;
          }
        }
      }
    }
    
    .model-table-section {
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
    
    .model-drawer {
      ::v-deep .el-drawer {
        width: 90% !important;
      }
      
      .drawer-content {
        padding: 20px;
      }
    }
  }
}
</style>