<template>
  <div class="choice-container">
    <h2>请选择记录方式</h2>
    <div class="card-box">
      <el-card shadow="hover" class="choice-card" @click.native="goManual">
        <div class="icon-area">✍️</div>
        <h3>手动输入数据</h3>
        <p>传统方式，手动填写各项指标</p>
      </el-card>

      <el-card shadow="hover" class="choice-card" @click.native="goBluetooth">
        <div class="icon-area">📡</div>
        <h3>蓝牙手环同步</h3>
        <p>一键连接设备，自动导入数据</p>
      </el-card>
    </div>
    
    <div style="margin-top: 30px">
      <el-button @click="$router.go(-1)">返回上一页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecordChoice",
  methods: {
    goManual() {
     
      this.$router.push('/health-record'); 
    },
    goBluetooth() {
     
      this.$router.push('/user/bluetooth-sync');
    }
  }
}
</script>

<style scoped>
.choice-container {
  padding: 40px;
  text-align: center;
}
.card-box {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
}
.choice-card {
  width: 300px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px;
}
.choice-card:hover {
  transform: translateY(-5px);
  border-color: #409EFF;
}
.icon-area {
  font-size: 60px;
  margin-bottom: 20px;
}
h3 { margin: 10px 0; color: #333; }
p { color: #999; font-size: 14px; }
</style>