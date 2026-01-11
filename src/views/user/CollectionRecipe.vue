<template>
    <div class="collection-recipe-container">
        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-header">
                <i class="el-icon-search search-icon"></i>
                <span class="search-title">搜索收藏食谱</span>
            </div>
            <div class="search-input-wrapper">
                <AutoInput 
                    placeholder="输入关键词搜索健康食谱..." 
                    @listener="listener"
                    class="custom-search-input"
                />
                <div class="search-tips">
                    <i class="el-icon-info"></i>
                    <span>共 {{ apiResult.total }} 条收藏记录</span>
                </div>
            </div>
        </div>

        <!-- 内容表格区域 -->
        <div class="content-card">
            <!-- 表格标题 -->
            <div class="table-header">
                <div class="table-title">
                     <i class="el-icon-document-copy"></i>
                    <span>收藏食谱列表</span>
                </div>
                <div class="table-actions" v-if="selectedItems.length > 0">
                    <el-button 
                        size="mini" 
                        type="danger" 
                        plain 
                        icon="el-icon-delete"
                        @click="batchCancelCollection"
                    >
                        批量取消收藏
                    </el-button>
                </div>
            </div>

            <!-- 表格内容 -->
            <div class="table-container">
                <el-table 
                    :data="apiResult.data"
                    style="width: 100%"
                    :header-cell-style="headerCellStyle"
                    :row-class-name="tableRowClassName"
                    @selection-change="handleSelectionChange"
                    ref="recipeTable"
                >
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    
                    <el-table-column label="食谱名称" min-width="350">
                        <template #default="scope">
                            <div class="recipe-info" @click="view(scope.row)">
                                <div class="recipe-cover" v-if="scope.row.cover">
                                    <img :src="scope.row.cover" alt="食谱封面" @error="handleImageError" />
                                </div>
                                <div class="recipe-details">
                                    <div class="recipe-name">
                                        {{ scope.row.name }}
                                        <i class="el-icon-link click-hint"></i>
                                    </div>
                                    <div class="recipe-description" v-if="scope.row.description">
                                        {{ scope.row.description.substring(0, 60) }}...
                                    </div>
                                    <div class="recipe-meta">
                                        <span class="meta-item" v-if="scope.row.categoryName">
                                            <i class="el-icon-folder-opened"></i>
                                            {{ scope.row.categoryName }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="createTime" label="发布时间" width="160" align="center">
                        <template #default="scope">
                            <div class="time-cell">
                                <i class="el-icon-time time-icon"></i>
                                {{ formatTime(scope.row.createTime) }}
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="120" align="center" fixed="right">
                        <template #default="scope">
                            <el-button 
                                size="mini" 
                                type="danger" 
                                plain 
                                icon="el-icon-star-off"
                                @click.stop="showCancelDialog(scope.row)"
                                class="cancel-btn"
                                :loading="cancelLoading && cancelItemId === scope.row.id"
                            >
                                取消收藏
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 空状态 -->
                <div v-if="apiResult.data.length === 0" class="empty-state">
                    <div class="empty-content">
                        <i class="el-icon-star-off empty-icon"></i>
                        <p class="empty-text">暂无收藏的健康食谱</p>
                        <p class="empty-subtext">发现优质食谱后可以收藏起来方便以后查看</p>
                        <el-button 
                            type="primary" 
                            plain 
                            icon="el-icon-search"
                            @click="$router.push('/recipe-list')"
                            class="explore-btn"
                        >
                            去发现好食谱
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
                    :page-sizes="[8, 12, 16, 20]"
                    :page-size="recipeQueryDto.size" 
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="apiResult.total"
                    background
                    class="custom-pagination"
                ></el-pagination>
            </div>
        </div>

        <!-- 删除确认弹窗 -->
        <el-dialog 
            title="取消收藏确认" 
            :visible.sync="dialogDeletedVisible" 
            width="400px"
            center
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            :destroy-on-close="true"
            class="confirm-dialog"
            v-if="dialogKey"
        >
            <div class="dialog-content">
                <div class="dialog-icon">
                    <i class="el-icon-warning-outline"></i>
                </div>
                <div class="dialog-text">
                    <p class="dialog-title">确定要取消收藏吗？</p>
                    <p class="dialog-desc">取消收藏后将不再显示在您的收藏列表中</p>
                    <div class="recipe-preview" v-if="recipe.name">
                        <div class="preview-name">{{ recipe.name }}</div>
                        <div class="preview-time">
                            <i class="el-icon-time"></i>
                            收藏于 {{ formatTime(recipe.createTime) }}
                        </div>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button 
                    @click="dialogDeletedVisible = false"
                    class="cancel-button"
                    :disabled="cancelLoading"
                >
                    再想想
                </el-button>
                <el-button 
                    type="danger" 
                    @click="collectionOperation"
                    class="confirm-button"
                    :loading="cancelLoading"
                >
                    确定取消
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import AutoInput from "@/components/AutoInput.vue";

export default {
    name: 'CollectionRecipe',
    components: { AutoInput },
    data() {
        return {
            recipe: {},
            apiResult: {
                data: [],
                total: 0,
            },
            recipeQueryDto: {
                current: 1,
                size: 8,
            },
            dialogDeletedVisible: false,
            selectedItems: [],
            flowIndexType: {
                TYPE_3: 4,
            },
            cancelLoading: false,
            cancelItemId: null,
            dialogKey: 0,
            isDialogOpening: false
        };
    },
    created() {
        this.fetchFreshData();
    },
    methods: {
        // 显示取消收藏对话框
        showCancelDialog(row) {
            if (this.isDialogOpening) return;
            
            this.isDialogOpening = true;
            this.recipe = { ...row };
            this.cancelItemId = row.id;
            
            this.dialogDeletedVisible = false;
            this.dialogKey++;
            
            this.$nextTick(() => {
                setTimeout(() => {
                    this.dialogDeletedVisible = true;
                    this.isDialogOpening = false;
                }, 50);
            });
        },
        
        async collectionOperation() {
            this.cancelLoading = true;
            try {
                await this.$axios.post('/flow-index/operation', {
                    type: this.flowIndexType.TYPE_3,
                    contentModule: "RECIPE",
                    contentId: this.recipe.id
                });

                this.dialogDeletedVisible = false;
                
                this.$message.success({
                    message: '已取消收藏',
                    type: 'success',
                    duration: 1500
                });
                
                setTimeout(() => {
                    this.fetchFreshData();
                }, 300);
                
            } catch (error) {
                console.error('取消收藏失败:', error);
                this.$message.error('操作失败，请重试');
            } finally {
                this.cancelLoading = false;
                this.cancelItemId = null;
            }
        },
        
        view(recipe) {
            window.open(`/recipe-detail?id=${recipe.id}`);
        },
        
        listener(text) {
            this.recipeQueryDto.name = text;
            this.recipeQueryDto.current = 1;
            this.fetchFreshData();
        },
        
        async fetchFreshData() {
            try {
                const { data, total } = await this.$axios.post('/recipe/collectionList', this.recipeQueryDto);
                this.apiResult.data = data;
                this.apiResult.total = total;
                this.$emit('update:count', total);
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
        
        handleSelectionChange(selection) {
            this.selectedItems = selection;
        },
        
        batchCancelCollection() {
            this.$confirm(`确定要取消收藏选中的 ${this.selectedItems.length} 个食谱吗？`, '批量操作确认', {
                confirmButtonText: '确定取消',
                cancelButtonText: '再想想',
                type: 'warning',
                center: true,
                customClass: 'batch-dialog'
            }).then(async () => {
                try {
                    const promises = this.selectedItems.map(item => 
                        this.$axios.post('/flow-index/operation', {
                            type: this.flowIndexType.TYPE_3,
                            contentModule: "RECIPE",
                            contentId: item.id
                        })
                    );
                    
                    await Promise.all(promises);
                    this.$message.success(`成功取消 ${this.selectedItems.length} 个食谱收藏`);
                    this.selectedItems = [];
                    this.fetchFreshData();
                    
                } catch (error) {
                    console.error('批量取消收藏失败:', error);
                    this.$message.error('操作失败，请重试');
                }
            }).catch(() => {});
        },
        
        formatTime(timeString) {
            if (!timeString) return '';
            return timeString.split(' ')[0];
        },
        
        handleImageError(event) {
            event.target.src = 'https://via.placeholder.com/80x60/ff9a76/ffffff?text=健康食谱';
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
    watch: {
        dialogDeletedVisible(newVal) {
            if (!newVal) {
                this.cancelLoading = false;
                this.cancelItemId = null;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.collection-recipe-container {
    padding: 0;
    
    .search-section {
        background: linear-gradient(135deg, #fff, #f8faff);
        border-radius: 16px;
        padding: 25px 30px;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(107, 184, 255, 0.08);
        border: 1px solid rgba(107, 184, 255, 0.1);
        
        .search-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            
            .search-icon {
                font-size: 24px;
                color: #6bb8ff;
                background: linear-gradient(135deg, #6bb8ff, #57aaff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .search-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
        }
        
        .search-input-wrapper {
            .custom-search-input {
                margin-bottom: 15px;
            }
            
            .search-tips {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #666;
                
                i {
                    color: #57aaff;
                    font-size: 14px;
                }
            }
        }
    }
    
    .content-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
        border: 1px solid #f0f0f0;
        
        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 22px 30px;
            background: linear-gradient(90deg, rgba(248, 250, 255, 0.5), rgba(240, 247, 255, 0.3));
            border-bottom: 1px solid #f0f7ff;
            
            .table-title {
                display: flex;
                align-items: center;
                gap: 12px;
                
                i {
                    font-size: 22px;
                    color: #ff9a76;
                    background: linear-gradient(135deg, #ff9a76, #ff7b54);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                span {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                }
            }
        }
        
        .table-container {
            padding: 0 30px;
            
            .recipe-info {
                display: flex;
                gap: 16px;
                padding: 12px 0;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 8px;
                
                &:hover {
                    background: rgba(255, 154, 118, 0.05);
                    transform: translateX(5px);
                    
                    .recipe-name {
                        color: #ff7b54;
                    }
                    
                    .click-hint {
                        opacity: 1;
                        transform: translateX(3px);
                    }
                }
                
                .recipe-cover {
                    width: 80px;
                    height: 80px;
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 1px solid #f0f0f0;
                    
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }
                }
                
                .recipe-details {
                    flex: 1;
                    
                    .recipe-name {
                        font-size: 15px;
                        font-weight: 600;
                        color: #333;
                        line-height: 1.4;
                        margin-bottom: 6px;
                        transition: color 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        
                        .click-hint {
                            font-size: 12px;
                            color: #ff7b54;
                            opacity: 0;
                            transition: all 0.3s ease;
                        }
                    }
                    
                    .recipe-description {
                        font-size: 13px;
                        color: #666;
                        line-height: 1.5;
                        margin-bottom: 8px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    
                    .recipe-meta {
                        display: flex;
                        gap: 15px;
                        
                        .meta-item {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-size: 12px;
                            color: #888;
                            
                            i {
                                font-size: 13px;
                            }
                        }
                    }
                }
            }
            
            .time-cell {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 13px;
                color: #666;
                
                .time-icon {
                    color: #57aaff;
                }
            }
            
            .cancel-btn {
                padding: 5px 12px;
                border-radius: 6px;
                font-size: 12px;
                transition: all 0.3s ease;
                
                &:hover {
                    background: rgba(255, 107, 107, 0.1);
                    transform: translateY(-1px);
                }
            }
            
            .empty-state {
                padding: 60px 0;
                text-align: center;
                
                .empty-content {
                    .empty-icon {
                        font-size: 64px;
                        color: #e0e0e0;
                        margin-bottom: 20px;
                    }
                    
                    .empty-text {
                        font-size: 16px;
                        color: #999;
                        margin-bottom: 8px;
                        font-weight: 500;
                    }
                    
                    .empty-subtext {
                        font-size: 14px;
                        color: #ccc;
                        margin-bottom: 20px;
                    }
                    
                    .explore-btn {
                        padding: 10px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                    }
                }
            }
        }
        
        .pagination-section {
            padding: 25px 30px;
            border-top: 1px solid #f0f7ff;
            background: #fafcff;
            
            .custom-pagination {
                justify-content: flex-end;
            }
        }
    }
    
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
        
        .el-checkbox__inner {
            border-radius: 4px;
        }
    }
}

@media (max-width: 992px) {
    .collection-recipe-container {
        .search-section {
            padding: 20px;
        }
        
        .content-card {
            .table-header {
                padding: 18px 20px;
            }
            
            .table-container {
                padding: 0 20px;
                
                .recipe-info {
                    flex-direction: column;
                    gap: 12px;
                    
                    .recipe-cover {
                        width: 100%;
                        height: 160px;
                    }
                }
            }
            
            .pagination-section {
                padding: 20px;
            }
        }
    }
}

@media (max-width: 768px) {
    .collection-recipe-container {
        .search-section {
            padding: 15px;
        }
        
        .content-card {
            .table-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .table-container {
                padding: 0 15px;
            }
        }
    }
}
</style>