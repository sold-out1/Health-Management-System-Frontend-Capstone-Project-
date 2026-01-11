<template>
    <div class="health-data-container">
        <div class="left-content">
            <!-- 图表区域卡片 -->
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <i class="el-icon-data-line"></i>
                        <span>健康数据趋势分析</span>
                    </div>
                    <div class="chart-subtitle">{{ selectedHealthModel.detail }}</div>
                </div>
                
                <div class="chart-controls">
                    <div class="model-selector">
                        <div class="selector-label">
                            <i class="el-icon-s-operation"></i>
                            <span>选择健康模型</span>
                        </div>
                        <el-select 
                            style="width: 100%;" 
                            @change="selectedModel" 
                            v-model="healthRecordQueryDto.healthModelId"
                            placeholder="请选择要分析的健康模型"
                            class="custom-select"
                        >
                            <el-option 
                                v-for="(item, index) in modelOptions" 
                                :key="index" 
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </div>
                </div>
                
                <!-- 折线图容器 -->
                <div class="chart-container">
                    <LineChart 
                        @on-selected="onSelected" 
                        :tooltipFormatter="customTooltip" 
                        :tag="tag" 
                        :height="height"
                        :values="values" 
                        :date="dateList" 
                    />
                </div>
            </div>
            
            <!-- 健康记录组件 -->
            <div class="record-section">
                <UserHealthRecord @listnerModelOptions="listnerModelOptions" />
            </div>
        </div>

        <!-- 右侧功能区域 -->
        <div class="right-sidebar">
            <!-- 健康记录入口 -->
            <div class="health-record-card">
                <div class="card-header">
                    <div class="header-icon">
                        <i class="el-icon-notebook-2"></i>
                    </div>
                    <div class="header-content">
                        <div class="card-title">健康生活，从此刻开始</div>
                        <div class="card-desc">记录每日健康数据，追踪变化趋势</div>
                    </div>
                </div>
                <div class="card-actions">
                    <el-button 
                        type="primary" 
                        icon="el-icon-edit"
                        @click="toHealthRecord"
                        class="record-btn"
                    >
                        去记录
                        <i class="el-icon-arrow-right"></i>
                    </el-button>
                </div>
            </div>

            <!-- BMI测算卡片 -->
            <div class="bmi-card">
                <div class="card-header">
                    <i class="el-icon-c-scale-to-original"></i>
                    <span>BMI健康测算</span>
                </div>
                
                <div class="bmi-form">
                    <el-form ref="bmiForm" :model="bmiForm" label-width="80px">
                        <el-form-item label="身高(cm)">
                            <el-input 
                                size="medium" 
                                placeholder="请输入身高" 
                                v-model="bmiForm.height"
                                class="bmi-input"
                            >
                                <template slot="append">cm</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="体重(kg)">
                            <el-input 
                                size="medium" 
                                placeholder="请输入体重" 
                                v-model="bmiForm.weight"
                                class="bmi-input"
                            >
                                <template slot="append">kg</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                    
                    <!-- BMI结果展示 -->
                    <div v-if="isComputeBMI" class="bmi-result">
                        <div class="result-header">
                            <i class="el-icon-info"></i>
                            <span>您的BMI结果</span>
                        </div>
                        <div class="result-content">
                            <div class="bmi-progress">
                                <el-progress 
                                    type="circle" 
                                    :percentage="BMIResult.result" 
                                    :color="getBMIColor(BMIResult.info)"
                                    :format="formatBMI"
                                    :stroke-width="8"
                                    :width="120"
                                ></el-progress>
                            </div>
                            <div class="bmi-details">
                                <div class="bmi-value">
                                    <span class="value">{{ BMIResult.result }}</span>
                                    <span class="unit">kg/m²</span>
                                </div>
                                <div class="bmi-status">
                                    <span class="status-tag" :class="getBMIClass(BMIResult.info)">
                                        {{ BMIResult.info }}
                                    </span>
                                </div>
                                <div class="bmi-range">
                                    健康范围: 18.5 ~ 24
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bmi-actions">
                    <el-button 
                        @click="computeBMI" 
                        type="primary" 
                        icon="el-icon-cpu"
                        class="compute-btn"
                    >
                        立即测算BMI值
                    </el-button>
                </div>
            </div>

            <!-- 模型统计卡片 -->
            <div class="stats-card">
                <div class="card-header">
                    <i class="el-icon-data-board"></i>
                    <span>健康模型统计</span>
                </div>
                
                <div class="stats-content">
                    <div class="stat-item">
                        <div class="stat-icon global">
                            <i class="el-icon-earth"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ modelCount.globalModelCount || 0 }}</div>
                            <div class="stat-label">全局模型</div>
                        </div>
                    </div>
                    
                    <div class="stat-divider"></div>
                    
                    <div class="stat-item">
                        <div class="stat-icon personal">
                            <i class="el-icon-user"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ modelCount.privateModelCount || 0 }}</div>
                            <div class="stat-label">我的模型</div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-footer">
                    <i class="el-icon-trophy"></i>
                    <span>共同构建健康模型库</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserHealthRecord from "@/views/user/UserHealthRecord"
import LineChart from "@/components/LineChart"

export default {
    components: { UserHealthRecord, LineChart },
    name: "HealthData",
    data() {
        return {
            modelCount: {},
            bmiForm: {
                height: 155.5,
                weight: 51.5,
            },
            BMIResult: {},
            isComputeBMI: false,
            values: [],
            dateList: ['2023-01', '2023-02', '2023-03', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07'],
            tag: '折线图',
            height: '400px',
            modelOptions: [],
            selectedHealthModel: {},
            healthRecordQueryDto: {
                days: 365,
                healthModelId: null,
            },
        }
    },
    created() {
        this.fetchModelCount();
    },
    methods: {
        formatBMI(percentage) {
            return `${this.BMIResult.result}${this.BMIResult.info}`;
        },
        
        getBMIColor(info) {
            const colors = {
                '偏瘦': '#67C23A',
                '正常': '#409EFF',
                '偏胖': '#E6A23C',
                '肥胖': '#F56C6C'
            };
            return colors[info] || '#909399';
        },
        
        getBMIClass(info) {
            const classes = {
                '偏瘦': 'status-underweight',
                '正常': 'status-normal',
                '偏胖': 'status-overweight',
                '肥胖': 'status-obese'
            };
            return classes[info] || '';
        },
        
        async fetchModelCount() {
            try {
                const { data } = await this.$axios.get(`/health-model/modelCount`);
                this.modelCount = data;
            } catch (error) {
                this.$message.error(error.message);
            }
        },
        
        async computeBMI() {
            try {
                const { data } = await this.$axios.post(`/health-model/computeBMI`, this.bmiForm);
                this.BMIResult = data;
                this.isComputeBMI = true;
                this.$message.success('BMI测算完成！');
            } catch (error) {
                this.$message.error(error.message);
            }
        },
        
        // toHealthRecord() {
        //     window.open('/health-record', '_blank');
        // },
        toHealthRecord() {
            this.$router.push('/user/record-choice');
        },
        selectedModel() {
            const resultModelList = this.modelOptions.filter(model => model.value === this.healthRecordQueryDto.healthModelId);
            this.selectedHealthModel = resultModelList.length > 0 ? resultModelList[0] : {};
            this.tag = this.selectedHealthModel.label;
            this.lineChartListUser();
        },
        
        listnerModelOptions(data) {
            this.modelOptions = data;
            this.healthRecordQueryDto.healthModelId = data.length > 0 ? data[0].value : null;
            this.selectedModel();
        },
        
        async lineChartListUser() {
            try {
                const { data } = await this.$axios.post(`/health-record/listLineChart`, this.healthRecordQueryDto);
                this.values = data.map(entity => entity.value);
                this.dateList = data.map(entity => entity.createTime);
            } catch (error) {
                this.$message.info(error.message);
            }
        },
        
        onSelected(days) {
            this.healthRecordQueryDto.days = days;
            this.lineChartListUser();
        },
        
        customTooltip(params) {
            return `
                <div class="custom-tooltip">
                    <div class="tooltip-title">记录详情</div>
                    <div class="tooltip-content">
                        <div class="tooltip-item">
                            <i class="el-icon-time"></i>
                            <span>记录时间: ${params[0].axisValue}</span>
                        </div>
                        <div class="tooltip-item">
                            <i class="el-icon-odometer"></i>
                            <span>记录数值: ${params[0].data}${this.selectedHealthModel.unit || ''}</span>
                        </div>
                    </div>
                </div>`;
        },
    }
}
</script>

<style scoped lang="scss">
.health-data-container {
    display: flex;
    gap: 40px;
    padding: 30px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
    
    // 左侧内容区域
    .left-content {
        flex: 1;
        min-width: 0;
        
        .chart-card {
            background: #fff;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(107, 184, 255, 0.1);
            border: 1px solid rgba(107, 184, 255, 0.1);
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0f0f0;
                
                .chart-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    
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
                
                .chart-subtitle {
                    font-size: 15px;
                    color: #666;
                    max-width: 50%;
                    text-align: right;
                    line-height: 1.5;
                }
            }
            
            .chart-controls {
                margin-bottom: 25px;
                
                .model-selector {
                    .selector-label {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        
                        i {
                            color: #57aaff;
                        }
                    }
                    
                    .custom-select {
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
            
            .chart-container {
                border-radius: 16px;
                overflow: hidden;
                background: #fafcff;
                border: 1px solid #e6f2ff;
            }
        }
        
        .record-section {
            background: #fff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
        }
    }
    
    // 右侧功能区域
    .right-sidebar {
        width: 360px;
        flex-shrink: 0;
        
        .health-record-card {
            background: linear-gradient(135deg, #6bb8ff, #57aaff);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 25px;
            color: white;
            box-shadow: 0 10px 30px rgba(87, 170, 255, 0.3);
            position: relative;
            overflow: hidden;
            
            &::before {
                content: '';
                position: absolute;
                top: -50px;
                right: -50px;
                width: 150px;
                height: 150px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
                
                .header-icon {
                    i {
                        font-size: 32px;
                        color: white;
                    }
                }
                
                .header-content {
                    .card-title {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }
                    
                    .card-desc {
                        font-size: 14px;
                        opacity: 0.9;
                    }
                }
            }
            
            .card-actions {
                position: relative;
                z-index: 1;
                
                .record-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    color: white;
                    font-weight: 600;
                    padding: 12px 24px;
                    border-radius: 12px;
                    width: 100%;
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
        
        .bmi-card {
            background: #fff;
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
                
                i {
                    font-size: 24px;
                    color: #6bb8ff;
                }
                
                span {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                }
            }
            
            .bmi-form {
                margin-bottom: 20px;
                
                .bmi-input {
                    ::v-deep .el-input__inner {
                        border-radius: 10px;
                        border: 2px solid #e8f4ff;
                        transition: all 0.3s ease;
                        
                        &:focus {
                            border-color: #57aaff;
                        }
                    }
                }
                
                .bmi-result {
                    background: linear-gradient(135deg, #f8faff, #f0f7ff);
                    border-radius: 16px;
                    padding: 20px;
                    margin-top: 20px;
                    border: 1px solid #e6f2ff;
                    
                    .result-header {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 20px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        
                        i {
                            color: #57aaff;
                        }
                    }
                    
                    .result-content {
                        display: flex;
                        align-items: center;
                        gap: 25px;
                        
                        .bmi-progress {
                            flex-shrink: 0;
                        }
                        
                        .bmi-details {
                            flex: 1;
                            
                            .bmi-value {
                                display: flex;
                                align-items: baseline;
                                gap: 8px;
                                margin-bottom: 10px;
                                
                                .value {
                                    font-size: 32px;
                                    font-weight: 700;
                                    color: #333;
                                }
                                
                                .unit {
                                    font-size: 14px;
                                    color: #666;
                                }
                            }
                            
                            .bmi-status {
                                margin-bottom: 12px;
                                
                                .status-tag {
                                    display: inline-block;
                                    padding: 6px 16px;
                                    border-radius: 20px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    
                                    &.status-underweight {
                                        background: rgba(103, 194, 58, 0.1);
                                        color: #67C23A;
                                    }
                                    
                                    &.status-normal {
                                        background: rgba(64, 158, 255, 0.1);
                                        color: #409EFF;
                                    }
                                    
                                    &.status-overweight {
                                        background: rgba(230, 162, 60, 0.1);
                                        color: #E6A23C;
                                    }
                                    
                                    &.status-obese {
                                        background: rgba(245, 108, 108, 0.1);
                                        color: #F56C6C;
                                    }
                                }
                            }
                            
                            .bmi-range {
                                font-size: 13px;
                                color: #888;
                                background: rgba(107, 184, 255, 0.05);
                                padding: 8px 12px;
                                border-radius: 8px;
                                border-left: 3px solid #57aaff;
                            }
                        }
                    }
                }
            }
            
            .bmi-actions {
                .compute-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 600;
                    background: linear-gradient(135deg, #6bb8ff, #57aaff);
                    border: none;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        background: linear-gradient(135deg, #57aaff, #6bb8ff);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 15px rgba(87, 170, 255, 0.3);
                    }
                }
            }
        }
        
        .stats-card {
            background: #fff;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
                
                i {
                    font-size: 24px;
                    color: #6bb8ff;
                }
                
                span {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                }
            }
            
            .stats-content {
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 15px;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        background: #f8faff;
                        transform: translateY(-2px);
                    }
                    
                    .stat-icon {
                        width: 60px;
                        height: 60px;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        
                        &.global {
                            background: linear-gradient(135deg, rgba(107, 184, 255, 0.1), rgba(87, 170, 255, 0.05));
                            color: #6bb8ff;
                        }
                        
                        &.personal {
                            background: linear-gradient(135deg, rgba(255, 154, 118, 0.1), rgba(255, 123, 84, 0.05));
                            color: #ff9a76;
                        }
                        
                        i {
                            font-size: 28px;
                        }
                    }
                    
                    .stat-info {
                        flex: 1;
                        
                        .stat-value {
                            font-size: 32px;
                            font-weight: 700;
                            color: #333;
                            margin-bottom: 5px;
                        }
                        
                        .stat-label {
                            font-size: 14px;
                            color: #666;
                        }
                    }
                }
                
                .stat-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e6f2ff, transparent);
                    margin: 20px 0;
                }
            }
            
            .stats-footer {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: rgba(107, 184, 255, 0.05);
                border-radius: 12px;
                margin-top: 20px;
                border-left: 4px solid #57aaff;
                
                i {
                    color: #57aaff;
                    font-size: 18px;
                }
                
                span {
                    font-size: 14px;
                    color: #666;
                }
            }
        }
    }
}

// 自定义工具提示样式
.custom-tooltip {
    padding: 12px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #e6f2ff;
    
    .tooltip-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
        font-size: 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .tooltip-content {
        .tooltip-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #666;
            
            &:last-child {
                margin-bottom: 0;
            }
            
            i {
                color: #57aaff;
                font-size: 14px;
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .health-data-container {
        flex-direction: column;
        padding: 20px;
        gap: 30px;
        
        .left-content {
            width: 100%;
        }
        
        .right-sidebar {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            
            .health-record-card {
                grid-column: 1 / -1;
            }
        }
    }
}

@media (max-width: 768px) {
    .health-data-container {
        padding: 15px;
        
        .left-content {
            .chart-card {
                padding: 20px;
                
                .chart-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                    
                    .chart-subtitle {
                        max-width: 100%;
                        text-align: left;
                    }
                }
            }
        }
        
        .right-sidebar {
            grid-template-columns: 1fr;
        }
    }
}
</style>