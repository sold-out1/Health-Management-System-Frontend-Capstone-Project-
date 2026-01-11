<template>
  <div class="recipe-manager-container">
    <!-- 头部筛选区域 -->
    <div class="filter-section">

      <div class="filter-controls">
        <!-- 食谱类型筛选 -->
        <div class="type-filter">
          <div class="filter-tabs">
            <Tab 
              :buttons="[
                { label: '全部', value: 'null' },
                { label: '私人食谱', value: '0' },
                { label: '公开食谱', value: '1' }
              ]" 
              initialActive="null" 
              @change="handleChange" 
              class="custom-tab"
            />
          </div>
        </div>

        <!-- 搜索和新增按钮 -->
        <div class="action-controls">
          <div class="search-box">
            <AutoInput 
              placeholder="搜索食谱名称..." 
              @listener="listener" 
              class="custom-search"
            />
          </div>
          <div class="add-button">
            <el-button 
              type="primary" 
              class="primary-btn"
              @click="saveRecipe"
            >
              <i class="el-icon-plus"></i>
              <span class="btn-text">新增食谱</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 食谱表格区域 -->
    <div class="recipe-table-section">
      <div class="table-header">
        <div class="table-title">
          <i class="el-icon-notebook-2"></i>
          <span>食谱列表</span>
          <span class="table-count">(共 {{ apiResult.total }} 条食谱)</span>
        </div>
      </div>

      <div class="table-container">
        <el-table 
          :data="apiResult.data"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :row-class-name="tableRowClassName"
        >
          <!-- 封面列 -->
          <el-table-column prop="cover" width="120" label="封面" align="center">
            <template #default="scope">
              <div class="cover-cell">
                <img 
                  :src="scope.row.cover" 
                  :alt="scope.row.name"
                  class="recipe-cover"
                  v-if="scope.row.cover"
                />
                <div class="cover-placeholder" v-else>
                  <i class="el-icon-picture-outline"></i>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 食谱名列 -->
          <el-table-column prop="name" label="食谱名称" min-width="180">
            <template #default="scope">
              <div class="name-cell">
                <div class="name-text">{{ scope.row.name }}</div>
                <div class="type-text" v-if="scope.row.typeName">
                  <i class="el-icon-price-tag"></i>
                  {{ scope.row.typeName }}
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 审核状态列 -->
          <el-table-column prop="isAudit" label="审核状态" width="140" align="center">
            <template #default="scope">
              <div class="audit-cell">
                <div v-if="!scope.row.isPublic">
                  <div class="private-tag">
                    <i class="el-icon-lock"></i>
                    <span>私人</span>
                  </div>
                </div>
                <div v-else>
                  <div class="audit-tag" :class="scope.row.isAudit ? 'audit-passed' : 'audit-pending'">
                    <i :class="scope.row.isAudit ? 'el-icon-circle-check' : 'el-icon-clock'"></i>
                    <span>{{ scope.row.isAudit ? '已审核' : '待审核' }}</span>
                  </div>
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
                      @click.native="handleEdit(scope.row.id)" 
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
            <i class="el-icon-notebook-2 empty-icon"></i>
            <p class="empty-text">暂无食谱数据</p>
            <p class="empty-subtext">点击"新增食谱"按钮创建您的第一个食谱</p>
            <el-button 
              type="primary" 
              class="empty-button"
              @click="saveRecipe"
            >
              <i class="el-icon-plus"></i>
              创建新食谱
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-section" v-if="apiResult.total > 0">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange"
          :current-page="recipeQueryDto.current" 
          :page-sizes="[3,5, 10, 15]"
          :page-size="recipeQueryDto.size" 
          layout="total, sizes, prev, pager, next, jumper"
          :total="apiResult.total"
          background
          class="recipe-pagination"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增/修改抽屉 -->
    <el-drawer 
      :title="isCreateMode ? '新增食谱' : '修改食谱'" 
      :visible.sync="drawer" 
      :direction="direction"
      size="500px"
      :before-close="handleClose"
      class="recipe-drawer"
    >
      <div class="drawer-content">
        <el-form 
          ref="recipe" 
          :model="recipe" 
          label-width="100px" 
          class="recipe-form"
        >
          <!-- 封面上传 -->
          <el-form-item label="食谱封面" class="form-item-cover">
            <div class="cover-upload-section">
              <div class="cover-preview">
                <img 
                  v-if="cover" 
                  :src="cover" 
                  alt="食谱封面" 
                  class="preview-image"
                />
                <div class="cover-placeholder-large" v-else>
                  <i class="el-icon-picture-outline"></i>
                  <span>未上传封面</span>
                </div>
              </div>
              <div class="upload-control">
                <el-upload 
                  class="cover-uploader" 
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
                    建议尺寸：3:2比例，支持 JPG、PNG 格式
                  </div>
                </el-upload>
              </div>
            </div>
          </el-form-item>

          <!-- 名称 -->
          <el-form-item label="食谱名称" class="form-item">
            <el-input 
              v-model="recipe.name" 
              placeholder="请输入食谱名称，50个字以内"
              class="custom-input"
              maxlength="50"
              show-word-limit
            >
              <template #prefix>
                <i class="el-icon-edit"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 类别 -->
          <el-form-item label="食谱类别" class="form-item">
            <el-radio-group v-model="recipe.typeId" class="type-radio-group">
              <el-radio 
                v-for="recipeType in recipeTypes" 
                :key="recipeType.value" 
                :label="recipeType.value"
                class="type-radio"
              >
                {{ recipeType.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 权限 -->
          <el-form-item label="食谱权限" class="form-item">
            <el-radio-group v-model="recipe.isPublic" class="public-radio-group">
              <el-radio 
                v-for="isPublic in isPublicList" 
                :key="isPublic.value" 
                :label="isPublic.value"
                class="public-radio"
              >
                <div class="radio-content">
                  <i :class="isPublic.value === 1 ? 'el-icon-unlock' : 'el-icon-lock'"></i>
                  <span>{{ isPublic.label }}</span>
                </div>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 内容 -->
          <el-form-item label="食谱内容" class="form-item">
            <div class="editor-section">
              <Editor 
                @on-listener="onListener" 
                :receiveContent="content" 
                height="300px" 
                :api="fileUploadApi"
                class="recipe-editor"
              />
              <div class="editor-hint">
                请详细描述食谱的食材、做法和营养成分
              </div>
            </div>
          </el-form-item>

          <!-- 按钮 -->
          <el-form-item class="form-buttons">
            <el-button 
              type="primary" 
              class="submit-button"
              @click="isCreateMode ? onSaveRecipe() : onUpdateRecipe()"
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
          <p class="dialog-title">确定要删除这个食谱吗？</p>
          <p class="dialog-desc">删除后食谱数据将无法恢复，请谨慎操作</p>
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
import Editor from "@/components/Editor"

export default {
  components: { AutoInput, Tab, Editor },
  data() {
    return {
      fileUploadApi: '/api/v1.0/self-health-api/file/upload',
      isPublicList: [
        { label: '私人食谱', value: 0 },
        { label: '公开食谱', value: 1 }
      ],
      drawer: false,
      direction: 'rtl',
      cover: '',
      content: '',
      recipe: {
        id: null,
        typeId: null,
        isPublic: 0,
        name: ''
      },
      isCreateMode: true,
      loading: false,
      id: null,
      apiResult: {
        data: [],
        total: 0,
      },
      recipeQueryDto: {
        current: 1,
        size: 3,
        isPublic: null,
        name: ''
      },
      dialogDeletedVisible: false,
      recipeTypes: [],
    };
  },
  created() {
    this.fetchFreshData();
    this.fetchRecipeType();
  },
  methods: {
    onListener(content) {
      this.content = content;
    },
    
    selectedModel(model) {
      this.$emit('selected', model);
    },
    
    handleChange(obj) {
      this.recipeQueryDto.isPublic = obj.value === 'null' ? null : Number(obj.value);
      this.fetchFreshData();
    },
    
    async fetchRecipeType() {
      try {
        const { data } = await this.$axios.get('/recipe/fetchRecipeTypeList');
        this.recipeTypes = data;
        if (data && data.length > 0) {
          this.recipe.typeId = this.recipeTypes[0].value;
        }
      } catch (error) {
        this.$message.error(error.message || '获取食谱类别失败');
      }
    },
    
    async onUpdateRecipe() {
      try {
        this.loading = true;
        this.recipe.cover = this.cover;
        this.recipe.content = this.content;
        const { message } = await this.$axios.put('/recipe/update', this.recipe);
        
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
    
    async onSaveRecipe() {
      try {
        this.loading = true;
        this.recipe.cover = this.cover;
        this.recipe.content = this.content;
        const { message } = await this.$axios.post('/recipe/save', this.recipe);
        
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
    
    saveRecipe() {
      this.drawer = true;
      this.isCreateMode = true;
      this.cover = '';
      this.content = '';
      this.recipe = {
        id: null,
        typeId: this.recipeTypes && this.recipeTypes.length > 0 ? this.recipeTypes[0].value : null,
        isPublic: 0,
        name: ''
      };
    },
    
    handleClose() {
      this.drawer = false;
      this.isCreateMode = true;
      this.cover = '';
      this.content = '';
      this.recipe = {
        id: null,
        typeId: this.recipeTypes && this.recipeTypes.length > 0 ? this.recipeTypes[0].value : null,
        isPublic: 0,
        name: ''
      };
      this.loading = false;
    },
    
    handleImageSuccess(res) {
      if (res.code === 200) {
        this.cover = res.data;
        this.$notify.success({
          title: '上传成功',
          message: '封面图片上传成功',
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
      this.recipeQueryDto.name = text;
      this.fetchFreshData();
    },
    
    // async fetchFreshData() {
    //   try {
    //     const { data, total } = await this.$axios.post('/recipe/listUser', this.recipeQueryDto);
    //     this.apiResult.data = data;
    //     this.apiResult.total = total;
    //   } catch (error) {
    //     console.error('查询食谱信息异常:', error);
    //     this.$message.error('加载失败，请重试');
    //   }
    // },
    async fetchFreshData() {
     try {
    
    const { data, total } = await this.$axios.post('/recipe/listRecipe', this.recipeQueryDto);
    
    this.apiResult.data = data;
    this.apiResult.total = total;
  } catch (error) {
    console.error('查询食谱信息异常:', error);
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
    
    async handleEdit(id) {
      try {
        const { data } = await this.$axios.get(`/recipe/${id}`);
        
        this.recipe = data;
        this.cover = data.cover;
        this.drawer = true;
        this.content = data.content;
        this.isCreateMode = false;
        this.recipe.isPublic = data.isPublic ? 1 : 0;
      } catch (error) {
        console.log("通过ID查询食谱数据异常：", error);
        this.$message.error('获取食谱详情失败');
      }
    },
    
    handleDelete(row) {
      this.dialogDeletedVisible = true;
      this.id = row.id;
    },
    
    async confirmDeleted() {
      try {
        const { code } = await this.$axios.delete(`/recipe/${this.id}`);
        if (code === 200) {
          this.$notify.success({
            title: '操作成功',
            message: '食谱已删除',
            duration: 2000,
            position: 'bottom-right'
          });
          this.dialogDeletedVisible = false;
          this.id = null;
          this.fetchFreshData();
        }
      } catch (error) {
        console.log("删除食谱数据异常：", error);
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
.recipe-manager-container {
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
            background: linear-gradient(135deg, #ff9800, #ffb74d);
            border: none;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
              background: linear-gradient(135deg, #ffb74d, #ff9800);
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
  
  /* 食谱表格区域 */
  .recipe-table-section {
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
      .cover-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        
        .recipe-cover {
          width: 80px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid #ffeaa7;
          padding: 2px;
        }
        
        .cover-placeholder {
          width: 80px;
          height: 60px;
          border-radius: 10px;
          background: #fffbf0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ffeaa7;
          
          i {
            font-size: 24px;
            color: #ffd54f;
          }
        }
      }
      
      .name-cell {
        .name-text {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
        }
        
        .type-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
          background: rgba(107, 184, 255, 0.1);
          padding: 4px 10px;
          border-radius: 12px;
          display: inline-block;
          
          i {
            font-size: 12px;
            color: #57aaff;
          }
        }
      }
      
      .audit-cell {
        .private-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(158, 158, 158, 0.1);
          padding: 6px 12px;
          border-radius: 15px;
          border: 1px solid rgba(158, 158, 158, 0.2);
          
          i {
            color: #9e9e9e;
            font-size: 14px;
          }
          
          span {
            color: #757575;
            font-size: 13px;
            font-weight: 500;
          }
        }
        
        .audit-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 15px;
          
          &.audit-passed {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.2);
            
            i {
              color: #4caf50;
              font-size: 14px;
            }
            
            span {
              color: #4caf50;
              font-size: 13px;
              font-weight: 500;
            }
          }
          
          &.audit-pending {
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid rgba(255, 152, 0, 0.2);
            
            i {
              color: #ff9800;
              font-size: 14px;
            }
            
            span {
              color: #ff9800;
              font-size: 13px;
              font-weight: 500;
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
          background: rgba(255, 152, 0, 0.1);
          border-color: #ff9800;
          color: #ff9800;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(255, 152, 0, 0.2);
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
            margin-bottom: 30px;
          }
          
          .empty-button {
            padding: 10px 24px;
            border-radius: 12px;
            background: linear-gradient(135deg, #ff9800, #ffb74d);
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
      
      .recipe-pagination {
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
  .recipe-drawer {
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
      
      .recipe-form {
        .form-item-cover {
          .cover-upload-section {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            
            .cover-preview {
              width: 150px;
              height: 100px;
              border-radius: 12px;
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
              
              .cover-placeholder-large {
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
          margin-bottom: 25px;
          
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
          }
          
          .type-radio-group,
          .public-radio-group {
            .type-radio,
            .public-radio {
              margin-right: 20px;
              margin-bottom: 10px;
              
              ::v-deep .el-radio__label {
                display: flex;
                align-items: center;
                gap: 6px;
              }
            }
            
            .public-radio {
              .radio-content {
                display: flex;
                align-items: center;
                gap: 6px;
                
                i {
                  font-size: 14px;
                }
              }
            }
          }
          
          .editor-section {
            .recipe-editor {
              border: 2px solid #e8f4ff;
              border-radius: 12px;
              overflow: hidden;
              
              &:focus-within {
                border-color: #57aaff;
                box-shadow: 0 0 0 2px rgba(87, 170, 255, 0.2);
              }
            }
            
            .editor-hint {
              margin-top: 8px;
              font-size: 12px;
              color: #999;
              text-align: center;
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
            background: linear-gradient(135deg, #ff9800, #ffb74d);
            border: none;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
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
  .recipe-manager-container {
    .filter-section {
      padding: 25px;
    }
    
    .recipe-table-section {
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
    
    .recipe-drawer {
      ::v-deep .el-drawer {
        width: 80% !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .recipe-manager-container {
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
    
    .recipe-table-section {
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
    
    .recipe-drawer {
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