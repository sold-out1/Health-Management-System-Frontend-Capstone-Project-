<template>
  <div class="bt-container">
    <el-card class="bt-card">
      <div slot="header">
        <span>蓝牙设备同步</span>
      </div>

      <div class="status-area">
        <div class="bt-icon" :class="{ 'pulse': status === 'connecting' || status === 'importing' }">
          <span v-if="status === 'idle'">⌚</span>
          <span v-if="status === 'connecting'">🔗</span>
          <span v-if="status === 'importing'">📥</span>
          <span v-if="status === 'done'">✅</span>
        </div>
        
        <h2 style="margin-top: 20px">{{ statusText }}</h2>
        
        <el-progress v-if="status === 'importing'" :percentage="progress" status="success"></el-progress>
      </div>

      <div class="btn-area">
        <el-button 
          v-if="status === 'idle' || status === 'done'" 
          type="primary" 
          size="large" 
          @click="startSync"
          :loading="status === 'connecting'">
          {{ status === 'done' ? '再次配对导入' : '点击匹配手环' }}
        </el-button>

        <el-button 
          v-if="status === 'done'" 
          size="large" 
          @click="$router.push('/home')">
          返回首页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 只保留最基础的请求工具
import request from "@/utils/request";

export default {
  name: "BluetoothSync",
  data() {
    return {
      status: 'idle', // idle, connecting, importing, done
      statusText: '请确保手环蓝牙已开启',
      progress: 0
    };
  },
  methods: {
    // 1. 开始搜索匹配
    startSync() {
      this.status = 'connecting';
      this.statusText = '正在搜索并匹配设备...';

      setTimeout(() => {
        this.statusText = '配对成功！正在获取数据...';
        setTimeout(() => {
          this.startImporting();
        }, 1500);
      }, 3000);
    },

    // 2. 模拟数据导入动画
    startImporting() {
      this.status = 'importing';
      this.statusText = '正在从手环导入数据...';
      this.progress = 0;

      let timer = setInterval(() => {
        this.progress += 10;
        if (this.progress >= 100) {
          clearInterval(timer);
          this.callBackendApi(); 
        }
      }, 300);
    },

    // 3. 调用后端接口发送“假”数据
    callBackendApi() {
      this.statusText = '正在同步数据到服务器...';
      const now = new Date();
      const dateString = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');

      const fakeData = {
        deviceName: "Xiaomi Band 8 Pro",
        // userId: currentUserId,
        // 生成当前时间字符串
        createTime: dateString,       
        // 构造合理的随机健康指标
        heartRate: Math.floor(Math.random() * (85 - 65 + 1)) + 65,      
        weight: (65 + Math.random() * 5).toFixed(1),                  
        sleepDuration: (7 + Math.random() * 1.5).toFixed(1),          
        bmi: (22 + Math.random() * 2).toFixed(1),                     
        lowerbloodPressure: Math.floor(Math.random() * (85 - 75 + 1)) + 75,
        highbloodPressure: Math.floor(Math.random() * (125 - 115 + 1)) + 115,
        bloodSugar: (4.5 + Math.random() * 1.5).toFixed(1),           
        bloodOxygen: Math.floor(Math.random() * (100 - 97 + 1)) + 97, 
        bodyFatPercentage: (18 + Math.random() * 4).toFixed(1),       
        napDuration: (0.5 + Math.random() * 0.5).toFixed(1)           
      };

      console.log("模拟发送的数据：", fakeData);

      // 发送给后端
      request.post("/bluetooth/sync", fakeData).then(res => {
        // 后端返回 code 200 表示成功
        if (res.code === 200 || res.code === '200') {
          this.status = 'done';
          this.statusText = '数据同步完成！';
          this.$message.success("成功导入健康记录");
        } else {
          this.$message.error("同步失败：" + res.message);
          this.status = 'done'; // 失败也让它结束，方便演示
        }
      }).catch(err => {
        console.error("接口请求报错：", err);
        this.status = 'done';
        this.statusText = '数据同步完成 (演示模式)';
      });
    }
  }
}
</script>

<style scoped>
.bt-container {
  display: flex;
  justify-content: center;
  padding-top: 50px;
}
.bt-card {
  width: 500px;
  text-align: center;
}
.bt-icon {
  font-size: 80px;
  margin: 30px 0;
  height: 100px;
}
.pulse {
  animation: pulse-animation 1.5s infinite;
}
@keyframes pulse-animation {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
.btn-area {
  margin: 40px 0 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>