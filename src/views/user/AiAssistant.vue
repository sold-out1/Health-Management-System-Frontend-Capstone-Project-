<template>
  <div class="ai-chat-container">
    <el-card class="chat-card">
      <div slot="header" class="chat-header">
        <i class="el-icon-cpu"></i>
        <span>AI 智能健康助手</span>
      </div>
      
      <div class="chat-window" ref="chatWindow">
        <div v-for="(item, index) in messageList" :key="index" :class="['message-item', item.role]">
          <div class="avatar">
            <i :class="item.role === 'ai' ? 'el-icon-user-solid ai-icon' : 'el-icon-user user-icon'"></i>
          </div>
          <div class="content-bubble">
            {{ item.content }}
          </div>
        </div>
        <div v-if="loading" class="message-item ai">
          <div class="avatar"><i class="el-icon-loading"></i></div>
          <div class="content-bubble">AI 正在思考中...</div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题（例如：减肥早餐吃什么？）"
          v-model="userInput"
          @keyup.enter.native="sendMessage"
        ></el-input>
        <div class="button-group">
          <el-button type="info" plain @click="clearChat">清空对话</el-button>
          <el-button type="primary" :loading="loading" @click="sendMessage">发送消息</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '',
      loading: false,
      messageList: [
        { role: 'ai', content: '您好！我是您的智能健康助手，您可以问我关于健康饮食、减脂增肌的问题。' }
      ]
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return;
      if (this.loading) return;

      const userMsg = this.userInput;
      // 1. 把用户的话加到列表里
      this.messageList.push({ role: 'user', content: userMsg });
      this.userInput = '';
      this.loading = true;
      this.scrollToBottom();

      try {
        // 2. 请求后端接口
        const { data } = await this.$axios.post('/ai/chat', { content: userMsg });
        // 3. 把 AI 的回答加到列表里
        this.messageList.push({ role: 'ai', content: data });
      } catch (error) {
        this.$message.error('发送失败：' + error.message);
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },
    clearChat() {
      this.messageList = [{ role: 'ai', content: '对话已重置，请问有什么可以帮您？' }];
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const win = this.$refs.chatWindow;
        win.scrollTop = win.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
.ai-chat-container { padding: 20px; max-width: 800px; margin: 0 auto; }
.chat-window { height: 450px; overflow-y: auto; padding: 15px; border: 1px solid #f0f0f0; background: #fafafa; border-radius: 10px; margin-bottom: 20px; }
.message-item { display: flex; margin-bottom: 20px; align-items: flex-start; }
.message-item.user { flex-direction: row-reverse; }
.avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 10px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.content-bubble { max-width: 70%; padding: 12px 16px; border-radius: 15px; font-size: 14px; line-height: 1.6; }
.ai .content-bubble { background: #fff; color: #333; border-bottom-left-radius: 2px; }
.user .content-bubble { background: #409EFF; color: #fff; border-bottom-right-radius: 2px; }
.ai-icon { color: #67C23A; }
.user-icon { color: #409EFF; }
.input-area { margin-top: 10px; }
.button-group { margin-top: 10px; text-align: right; }
</style>