<template>
  <div class="login-container">
    <!-- 登录面板 -->
    <div class="login-panel">
      <!-- 左侧图片区域 -->
      <div class="illustration">
        <img src="/health-illustrate.jpg" alt="健康生活" class="illustration-img" />
      </div>

      <!-- 右侧登录表单 -->
      <div class="right-login">
        <div class="login-header">
          <h2>个人健康管理系统</h2>
         <pre class="welcome-text">记录数据，守护健康</pre>
         <pre class="welcome-text">                           ——————来自你的专属健康助理</pre>
        </div>

        <div class="input-group">
          <input v-model="account" class="login-input" placeholder="输入账号" />
        </div>

        <div class="input-group">
          <input v-model="password" class="login-input" type="password" placeholder="输入密码" />
        </div>

        <div class="button-group">
          <button class="login-btn" @click="login">
            <span class="btn-text">立即登录</span>
          </button>
        </div>

        <div class="login-footer">
          <p>没有账号？<span class="register-link" @click="toDoRegister">点此注册</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setToken, setRole } from "@/utils/storage.js";

export default {
  name: "Login",
  data() {
    return {
      account: '',
      password: ''
    }
  },
  methods: {
    toDoRegister() {
      this.$router.push('/register');
    },

    async login() {
      if (!this.account || !this.password) {
        this.$message.info('账号与密码不能为空');
        return;
      }

      const bcryptPassword = this.$md5(this.$md5(this.password));
      const userLoginDto = { account: this.account, password: bcryptPassword };
      try {
        const { data, message } = await this.$axios.post(`user/login`, userLoginDto);
        setToken(data.token);
        setRole(data.role);
        if (data.role === 1) {
          this.$router.push('/admin');
        } else if (data.role === 2) {
          this.$router.push('/user');
        }
      } catch (error) {
        console.error('登录异常:', error);
        this.$message.error(error.message);
      }
    },
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
.login-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f4ff, #d0e8ff);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  transition: background 0.5s ease;

  .login-panel {
    display: flex;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 15px 30px rgba(0, 80, 160, 0.2);
    overflow: hidden;
    max-width: 850px;
    width: 100%;
    height: auto;
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
       右侧登录表单
    ---------------------*/
    .right-login {
      width: 50%;
      background-color: #ffffff;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .login-header {
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

        .login-input {
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

        .login-btn {
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

      .login-footer {
        margin-top: 20px;
        text-align: right;

        p {
          color: #6b7d90;
          font-size: 14px;

          .register-link {
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
  .login-panel {
    flex-direction: column;
  }

  .illustration {
    display: none;
  }

  .right-login {
    width: 100%;
    padding: 20px;
  }
}
</style>
