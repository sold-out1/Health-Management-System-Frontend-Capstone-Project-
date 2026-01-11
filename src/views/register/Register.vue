<template>
  <div class="register-container">
    <!-- 注册面板 -->
    <div class="register-panel">
      <!-- 左侧图片区域 -->
      <div class="illustration">
        <img src="/health-illustrate.jpg" alt="健康生活" class="illustration-img" />
      </div>

      <!-- 右侧注册表单 -->
      <div class="right-register">
        <div class="register-header">
          <h2>注册账户</h2>
          <pre class="welcome-text">记录数据，守护健康</pre>
          <pre class="welcome-text">                           ——————来自你的专属健康助理</pre>
        </div>

        <div class="input-group">
          <input v-model="account" class="register-input" placeholder="输入账号" />
        </div>

        <div class="input-group">
          <input v-model="username" class="register-input" placeholder="用户名" />
        </div>

        <div class="input-group">
          <input v-model="password" class="register-input" type="password" placeholder="输入密码" />
        </div>

        <div class="input-group">
          <input v-model="againPassword" class="register-input" type="password" placeholder="确认密码" />
        </div>

        <div class="button-group">
          <button class="register-btn" @click="registerFunc">
            <span class="btn-text">立即注册</span>
          </button>
        </div>

        <div class="register-footer">
          <p>已有账户？<span class="login-link" @click="toDoLogin">返回登录</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      account: '',
      password: '',
      againPassword: '',
      username: ''
    }
  },
  methods: {
    toDoLogin() {
      this.$router.push('/login');
    },

    async registerFunc() {
      if (!this.account || !this.password || !this.againPassword || !this.username) {
        this.$message.info('请填写相关信息!');
        return;
      }

      if (this.password !== this.againPassword) {
        this.$message.info('前后密码输入不一致!');
        return;
      }

      const bcryptPassword = this.$md5(this.$md5(this.password));
      const userRegisterDto = {
        account: this.account,
        password: bcryptPassword,
        username: this.username
      }

      try {
        const { message } = await this.$axios.post(`user/register`, userRegisterDto);
        this.$message.success(message);
        this.$router.go(-1);
      } catch (error) {
        this.$message.error(error.message);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  user-select: none;
  box-sizing: border-box;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

/* --------------------
   背景与容器
---------------------*/
.register-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f4ff, #d0e8ff);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .register-panel {
    display: flex;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 15px 30px rgba(0, 80, 160, 0.2);
    overflow: hidden;
    max-width: 850px;
    width: 100%;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    /* --------------------
       左侧插画区域
    ---------------------*/
    .illustration {
      width: 50%;
      padding: 20px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #b5d8ff, #8bc4ff);

      .illustration-img {
        width: 100%;
        max-width: 300px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }

      &:hover .illustration-img {
        transform: scale(1.05);
      }
    }

    /* --------------------
       右侧注册表单
    ---------------------*/
    .right-register {
      width: 50%;
      background-color: #ffffff;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .register-header {
        margin-bottom: 30px;

        h2 {
          color: #1a6fb4;
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .welcome-text {
          color: #5a6e85;
          font-size: 15px;
          font-weight: 400;
        }
      }

      .input-group {
        margin-bottom: 25px;

        .register-input {
          width: 100%;
          height: 50px;
          font-size: 16px;
          padding: 0 15px;
          background-color: #f0faff;
          border: 1px solid #c8e0ff;
          border-radius: 10px;
          color: #2d3748;
          font-weight: 500;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            background-color: #e0f3ff;
            border-color: #57aaff;
          }

          &::placeholder {
            color: #9bb7d4;
          }
        }
      }

      .button-group {
        margin-top: 30px;

        .register-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 50px;
          background: linear-gradient(90deg, #6bb8ff, #57aaff);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(91, 184, 255, 0.4);
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(90deg, #57aaff, #4798e0);
            box-shadow: 0 7px 20px rgba(91, 184, 255, 0.5);
          }
        }
      }

      .register-footer {
        margin-top: 20px;
        text-align: right;

        p {
          color: #6b7d90;
          font-size: 14px;

          .login-link {
            color: #1a6fb4;
            font-weight: 600;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}

/* --------------------
   响应式适配
---------------------*/
@media (max-width: 768px) {
  .register-panel {
    flex-direction: column;
  }

  .illustration {
    display: none;
  }

  .right-register {
    width: 100%;
    padding: 20px;
  }
}
</style>
