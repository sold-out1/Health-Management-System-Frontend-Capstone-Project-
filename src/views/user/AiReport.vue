<template>
  <div class="ai-report-container">
    <div class="analysis-header">
      <el-card shadow="never" class="header-card">
        <div class="header-flex">
          <div class="text-group">
            <h1 class="title"><i class="el-icon-magic-stick"></i> AI 智能健康分析建议</h1>
            <p class="subtitle">基于您最近录入的身高、体重、心率、血压等 10 项指标及饮食记录进行深度评估</p>
          </div>
          <el-button 
            type="primary" 
            size="large" 
            icon="el-icon-cpu" 
            :loading="loading" 
            @click="fetchAiReport"
          >
            {{ loading ? 'AI 正在深度计算中...' : '生成我的健康分析报告' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20" class="report-row">
      <el-col :span="24">
        <el-card class="report-card" v-loading="loading" element-loading-text="AI 正在查阅您的健康档案...">
          <div slot="header" class="clearfix">
            <span class="card-title"><i class="el-icon-notebook-2"></i> 专属健康评估报告</span>
            <el-tag v-if="reportTime" size="small" type="info" style="float: right">生成时间：{{ reportTime }}</el-tag>
          </div>

          <div v-if="reportHtml" class="markdown-content" v-html="reportHtml"></div>
          
          <div v-else class="empty-placeholder">
            <img src="https://img.icons8.com/clouds/200/medical-report.png" alt="placeholder">
            <p>您的健康数据已准备就绪，点击上方按钮开启 AI 智能分析</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { marked } from 'marked'; // 引入刚才安装的插件

export default {
  name: 'AiReport',
  data() {
    return {
      loading: false,
      reportRaw: '',    // 存储 AI 返回的原始文字
      reportHtml: '',   // 存储转换后的 HTML
      reportTime: ''    // 记录生成时间
    };
  },
  methods: {
    async fetchAiReport() {
      this.loading = true;
      this.reportHtml = '';
      try {
        // 调用你刚写好的后端接口
       const res = await this.$axios.get('/ai/analysis/generateReport', {
      timeout: 120000 
    });
        
        const content = res.data; 

        if (content) {
          this.reportRaw = content;
          this.reportHtml = marked(content); // 将 Markdown 转为 HTML
          this.reportTime = new Date().toLocaleString();
          this.$message.success('健康分析报告已生成！');
        } else {
          this.$message.warning('AI 暂时没有给出反馈，请稍后再试');
        }
      } catch (error) {
        console.error(error);
  
        let errorMsg = '服务器连接超时';
        if (error.response && error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
        this.$message.error('生成失败：' + errorMsg);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.ai-report-container { padding: 20px; background-color: #f5f7fa; min-height: calc(100vh - 100px); }
.header-card { border-radius: 12px; margin-bottom: 20px; border: none; background: linear-gradient(to right, #ffffff, #eef6ff); }
.header-flex { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 24px; color: #303133; margin: 0 0 10px 0; }
.subtitle { color: #909399; margin: 0; font-size: 14px; }

.report-card { border-radius: 12px; min-height: 500px; }
.card-title { font-weight: bold; color: #409EFF; }

/* Markdown 内容样式自定义 */
.markdown-content { padding: 10px 20px; line-height: 1.8; color: #333; font-size: 16px; }
.markdown-content >>> h2 { color: #409EFF; border-bottom: 1px solid #ebeef5; padding-bottom: 10px; margin-top: 30px; }
.markdown-content >>> h3 { color: #303133; margin-top: 20px; }
.markdown-content >>> p { margin: 15px 0; }
.markdown-content >>> ul, .markdown-content >>> ol { padding-left: 20px; }
.markdown-content >>> li { margin-bottom: 8px; }
.markdown-content >>> blockquote { background: #f4f7f6; border-left: 4px solid #409EFF; padding: 10px 20px; margin: 20px 0; color: #666; }
.markdown-content >>> strong { color: #e67e22; }

.empty-placeholder { text-align: center; padding: 100px 0; color: #C0C4CC; }
.empty-placeholder img { width: 150px; opacity: 0.6; }
</style>