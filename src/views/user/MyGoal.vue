<template>
  <div class="goal-container">
    <div class="goal-header">
      <div class="title-left">
        <i class="el-icon-trophy-1 trophy-icon"></i>
        <div class="text-group">
          <h2 class="main-title">我的健康目标</h2>
          <p class="sub-title">设定科学目标，追踪身体蜕变</p>
        </div>
      </div>
      <el-button type="primary" round icon="el-icon-plus" @click="openAddDialog">添加新目标</el-button>
    </div>

    <div class="section-label"><i class="el-icon-loading"></i> 进行中的挑战</div>
    <el-row :gutter="20" class="active-goals-grid">
      <el-col :span="12" v-for="item in currentGoals" :key="item.id">
        <el-card class="goal-item-card" shadow="hover">
          <div :class="['card-tag', item.type === 1 ? 'tag-lose' : 'tag-gain']">
             {{ item.type === 1 ? '减肥目标' : '增肌目标' }}
          </div>
          
          <div class="card-content">
            <div class="stat-group">
              <div class="stat-box">
                <span class="stat-label">当前</span>
                <span class="stat-val">{{ item.currentValue }}<small>{{ unit(item.type) }}</small></span>
              </div>
              <div class="stat-arrow"><i class="el-icon-right"></i></div>
              <div class="stat-box">
                <span class="stat-label">目标</span>
                <span class="stat-val goal-val">{{ item.targetValue }}<small>{{ unit(item.type) }}</small></span>
              </div>
            </div>

            <div class="info-footer">
              <div class="time-info" v-if="item.endTime"><i class="el-icon-time"></i> 截止：{{ item.endTime.split(' ')[0] }}</div>
              <div class="remark-info" v-if="item.remark">“{{ item.remark }}”</div>
            </div>

            <div class="card-actions">
              <el-button size="mini" type="success" icon="el-icon-magic-stick" plain round @click="analyze(item)">AI 智能分析建议</el-button>
              <el-button size="mini" type="primary" round @click="finishGoal(item, 1)">标记完成</el-button>
              <el-button size="mini" type="text" class="del-btn" @click="deleteGoal(item.id)">放弃</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!currentGoals || currentGoals.length === 0" description="暂无进行中的目标"></el-empty>

    <div class="section-label history-label"><i class="el-icon-notebook-2"></i> 荣誉勋章 (历史记录)</div>
    <el-card class="history-card" shadow="never">
      <el-table :data="historyGoals" style="width: 100%" size="medium">
        <el-table-column label="类型" width="120">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.type === 1 ? 'success' : 'warning'" effect="plain">
              {{ scope.row.type === 1 ? '减肥' : '增肌' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="达成路径">
           <template slot-scope="scope">
            <span class="hist-val">{{ scope.row.currentValue }}</span> 
            <i class="el-icon-right"></i> 
            <span class="hist-val bold">{{ scope.row.targetValue }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template slot-scope="scope">
            <span :class="scope.row.status === 1 ? 'status-done' : 'status-fail'">
              {{ scope.row.status === 1 ? '● 已完成' : '● 未完成' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建日期" width="180"></el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="🎯 制定新目标" :visible.sync="dialogVisible" width="400px" custom-class="beauty-dialog">
      <el-form :model="form" label-position="top">
        <el-form-item label="目标类型">
          <el-radio-group v-model="form.type" size="medium">
            <el-radio-button :label="1">减肥</el-radio-button>
            <el-radio-button :label="2">增肌</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="form.type===1 ? '当前体重(kg)' : '当前体脂(%)'">
              <el-input-number v-model="form.currentValue" :precision="1" :step="0.1" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.type===1 ? '目标体重(kg)' : '目标体脂(%)'">
              <el-input-number v-model="form.targetValue" :precision="1" :step="0.1" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="计划起止时间">
           <el-date-picker v-model="timeRange" type="daterange" style="width:100%" range-separator="-" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :rows="2" placeholder="写下你的誓言..." v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false" round>取 消</el-button>
        <el-button type="primary" @click="saveGoal" round>确定开启</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "MyGoal",
  data() {
    return {
      currentGoals: [], // 初始化数据，防止报 length 错误
      historyGoals: [],
      dialogVisible: false,
      form: { type: 1, currentValue: 0, targetValue: 0, remark: '', startTime: '', endTime: '' },
      timeRange: [],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    unit(type) {
      return type === 1 ? 'kg' : '%';
    },
    fetchData() {
      request.get("/health-goal/list").then(res => {
        if (res.code === 200) {
          // 容错处理
          this.currentGoals = res.data.current || [];
          this.historyGoals = res.data.history || [];
        }
      });
    },
    openAddDialog() {
      this.form = { type: 1, currentValue: 60, targetValue: 55, remark: '' };
      this.timeRange = [];
      this.dialogVisible = true;
    },
    saveGoal() {
      if (!this.timeRange || this.timeRange.length < 2) {
        this.$message.warning("请选择时间范围");
        return;
      }
      this.form.startTime = this.timeRange[0];
      this.form.endTime = this.timeRange[1];
      request.post("/health-goal/save", this.form).then(res => {
        if (res.code === 200) {
          this.$message.success("目标制定成功！");
          this.dialogVisible = false;
          this.fetchData();
        }
      });
    },
    deleteGoal(id) {
      this.$confirm('确定删除该目标吗?', '提示', { type: 'warning' }).then(() => {
        request.delete("/health-goal/delete/" + id).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.fetchData();
          }
        });
      });
    },
    finishGoal(row, status) {
      this.$confirm('恭喜！确定标记为已完成吗？', '提示').then(() => {
        row.status = status;
        request.post("/health-goal/updateStatus", row).then(res => {
           this.fetchData();
        });
      });
    },
    analyze(row) {
      // 执行跳转逻辑
      this.$router.push({ name: 'AiReport' });
    }
  }
}
</script>

<style scoped>
.goal-container { padding: 30px; background-color: #fcfcfd; min-height: 90vh; }
.goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.title-left { display: flex; align-items: center; }
.trophy-icon { font-size: 40px; color: #f1c40f; margin-right: 15px; }
.main-title { margin: 0; font-size: 24px; color: #2c3e50; }
.sub-title { margin: 5px 0 0; color: #7f8c8d; font-size: 14px; }
.section-label { font-size: 16px; font-weight: bold; color: #34495e; margin: 20px 0; display: flex; align-items: center; }
.section-label i { margin-right: 8px; color: #3498db; }
.history-label { margin-top: 40px; }
.goal-item-card { border-radius: 12px; position: relative; overflow: hidden; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; margin-bottom: 20px; }
.card-tag { position: absolute; top: 0; left: 0; padding: 4px 15px; font-size: 12px; color: white; border-bottom-right-radius: 12px; }
.tag-lose { background: #2ecc71; }
.tag-gain { background: #e67e22; }
.card-content { padding: 25px 15px 15px; }
.stat-group { display: flex; justify-content: space-around; align-items: center; margin: 15px 0; }
.stat-box { text-align: center; }
.stat-label { display: block; font-size: 12px; color: #95a5a6; margin-bottom: 5px; }
.stat-val { font-size: 24px; font-weight: bold; color: #2c3e50; }
.stat-val small { font-size: 12px; margin-left: 2px; }
.goal-val { color: #3498db; }
.stat-arrow { font-size: 20px; color: #dcdde1; }
.info-footer { border-top: 1px solid #f1f2f6; padding: 15px 0; margin-top: 10px; }
.time-info { font-size: 13px; color: #7f8c8d; margin-bottom: 8px; }
.remark-info { font-size: 13px; color: #95a5a6; font-style: italic; }
.card-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.del-btn { color: #95a5a6; font-size: 13px; }
.history-card { border-radius: 12px; border: none; }
.hist-val { color: #7f8c8d; }
.bold { font-weight: bold; color: #2c3e50; }
.status-done { color: #2ecc71; font-weight: bold; }
.status-fail { color: #95a5a6; }
</style>