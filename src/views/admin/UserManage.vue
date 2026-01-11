<template>
  <div class="container">
    <div class="top-header">
      <div class="nav-left">
        <Tab :buttons="[
          { label: '全部', value: 'null' },
          { label: '管理员', value: '1' },
          { label: '普通用户', value: '2' }
        ]" initialActive="null" @change="handleChange" />
      </div>
      <div class="nav-right">
        <AutoInput placeholder="搜索用户" @listener="listener" />
        <div class="top-add-btn" @click="openAddUser">
          <i class="el-icon-plus"></i> 新增用户
        </div>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table :data="apiResult.data" stripe border style="border-radius:10px;overflow:hidden;">
      <el-table-column prop="username" label="用户">
        <template #default="scope">
          <div class="over-text">
            <img width="24px" height="24px" style="border-radius:50%;" :src="scope.row.avatar" alt="">
            {{ scope.row.username }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="account" :sortable="true" width="118" label="账号"></el-table-column>
      <el-table-column prop="email" :sortable="true" width="158" label="邮件">
        <template #default="scope">
          <div class="over-text">{{ scope.row.email }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="gender" :sortable="true" width="88" label="性别">
        <template #default="scope">
          <div>{{ scope.row.gender === 1 ? '女' : '男' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" :sortable="true" width="128" label="联系电话"></el-table-column>
      <el-table-column prop="birthday" :sortable="true" width="128" label="出生年月"></el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <div class="operate-buttons">
            <el-dropdown trigger="click" placement="bottom-end">
              <span class="el-dropdown-link">
                <i class="el-icon-more"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleEdit(scope.row)" icon="el-icon-edit">修改信息</el-dropdown-item>
                <el-dropdown-item @click.native="handleDelete(scope.row)" icon="el-icon-delete">删除用户</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pager">
      <el-pagination 
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userQueryDto.current"
        :page-sizes="[10,20]"
        :page-size="userQueryDto.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="apiResult.total">
      </el-pagination>
    </div>

    <!-- 新增/修改用户弹窗 -->
    <el-dialog 
      :title="dialogControlOperation ? '新增用户信息' : '修改用户信息'"
      :show-close="false"
      :visible.sync="dialogVisible"
      :closeOnClickModal="false"
      width="32%">
      <!-- 弹窗内容保持原样 -->
      <el-tabs v-model="tabActiveName" :tab-position="tabPosition" style="height: 440px;">
        <el-tab-pane label="核心信息" name="first">
          <div>
            <div class="user-avatar">
              <p>点击📷处即可上传头像</p>
              <img v-if="avatar" :src="avatar || ''" alt="">
              <el-upload 
                class="avatar-uploader"
                action="http://localhost:21090/api/v1.0/self-health-api/file/upload"
                :show-file-list="false"
                :on-success="handleImageSuccess">
                <i class="el-icon-camera-solid"></i>
              </el-upload>
            </div>
            <div>
              <p>*用户账号</p>
              <span v-if="!dialogControlOperation" style="display:inline-block;margin-bottom:10px;font-size:10px;">
                账号一经注册，不可修改
              </span>
              <el-input :disabled="!dialogControlOperation" placeholder="输入" v-model="apiParam.account" clearable></el-input>
            </div>
            <div>
              <p>*用户名</p>
              <el-input placeholder="输入" v-model="apiParam.username" clearable></el-input>
            </div>
            <div>
              <p>*登录密码</p>
              <el-input show-password placeholder="输入" type="password" v-model="password" clearable></el-input>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="基本信息" name="second">
          <div>
            <div>
              <p>*用户角色</p>
              <Tab :buttons="[ { label: '管理员', value: '1' }, { label: '普通用户', value: '2' } ]" 
                :initialActive="String(apiParam.role)" 
                @change="handleRoleChange" />
            </div>
            <div>
              <p>用户性别</p>
              <Tab :buttons="[ { label: '女', value: '1' }, { label: '男', value: '2' } ]" 
                :initialActive="String(apiParam.gender) || '2'" 
                @change="handleGenderChange" />
            </div>
            <div>
              <p>电子邮件</p>
              <el-input placeholder="输入" v-model="apiParam.email" clearable></el-input>
            </div>
            <div>
              <p>联系电话</p>
              <el-input placeholder="输入" v-model="apiParam.phone" clearable></el-input>
            </div>
            <div>
              <p>出生年月</p>
              <el-date-picker style="width:100%;" v-model="apiParam.birthday" type="date" placeholder="选择日期"></el-date-picker>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <span class="primary-bt" @click="cancelOperation">取消</span>
        <span class="info-bt" @click="handleConfirm">
          {{ dialogControlOperation ? '确定新增' : '确定修改' }}
        </span>
      </span>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除用户" :show-close="false" :visible.sync="dialogDeletedVisible" width="20%">
      <span>确定删除用户数据？</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogDeletedVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="confirmDeleted">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AutoInput from "@/components/AutoInput.vue";
import Tab from "@/components/Tab.vue";

export default {
  components: { AutoInput, Tab },
  data() {
    return {
      tabActiveName: 'first',
      tabPosition: 'right',
      id: null,
      apiResult: { data: [], total: 0 },
      userQueryDto: { current: 1, size: 10, role: null, username: null },
      dialogDeletedVisible: false,
      dialogVisible: false,
      dialogControlOperation: true,
      apiParam: {},
      avatar: '',
      password: '',
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    handleConfirm() {
      this.dialogControlOperation
        ? this.saveUserOperation()
        : this.updateUserOperation();
    },
    openAddUser() { this.cancelOperation(); this.dialogVisible=true; },
    async saveUserOperation() { if(!this.password){this.$message.warning('密码不能为空');return;} this.apiParam.avatar=this.avatar; this.apiParam.password=this.$md5(this.$md5(this.password)); const { message } = await this.$axios.post('/user/save',this.apiParam); this.cancelOperation(); this.$message.success(message); this.fetchFreshData(); },
    async updateUserOperation() { this.apiParam.avatar=this.avatar; this.apiParam.password=!this.password?null:this.$md5(this.$md5(this.password)); const { data,message } = await this.$axios.put('/user/backUpdate',this.apiParam); this.apiParam=data; this.cancelOperation(); this.$message.success(message); this.fetchFreshData(); },
    handleRoleChange(obj){this.apiParam.role=Number(obj.value);},
    handleGenderChange(obj){this.apiParam.gender=Number(obj.value);},
    handleChange(obj){this.userQueryDto.role=Number(obj.value); this.fetchFreshData();},
    listener(text){this.userQueryDto.username=text; this.fetchFreshData();},
    cancelOperation(){this.apiParam={}; this.avatar=''; this.password=''; this.tabActiveName='first'; this.dialogVisible=false; this.dialogControlOperation=true;},
    handleImageSuccess(res){ if(res.code===200)this.avatar=res.data; this.$notify({title:'头像上传',type:res.code===200?'success':'error',message:res.code===200?'上传成功':res.data,position:'bottom-right',duration:1000});},
    async fetchFreshData(){ const {data,total} = await this.$axios.post('/user/query',this.userQueryDto); this.apiResult.data=data; this.apiResult.total=total; },
    handleSizeChange(size){ this.userQueryDto.size=size; this.userQueryDto.current=1; this.fetchFreshData(); },
    handleCurrentChange(current){ this.userQueryDto.current=current; this.fetchFreshData(); },
    handleEdit(row){ this.cancelOperation(); this.apiParam={...row}; this.dialogControlOperation=false; this.dialogVisible=true; this.avatar=row.avatar; },
    handleDelete(row){ this.dialogDeletedVisible=true; this.id=row.id; },
    async confirmDeleted(){ const {code}=await this.$axios.delete(`/user/${this.id}`); if(code===200){ this.$notify.success({title:'用户删除',message:'删除成功',position:'bottom-right',duration:1000}); this.dialogDeletedVisible=false; this.id=null; this.fetchFreshData(); }}
  }
};
</script>

<style scoped lang="scss">
.container { margin: 10px 20px; }

/* 顶部新增按钮，只针对顶部，不影响弹窗按钮 */
.top-add-btn { 
  background: linear-gradient(90deg,#5B8FF9,#91C0F8); 
  color:#fff; 
  padding:6px 12px; 
  border-radius:6px; 
  cursor:pointer; 
  display:flex; 
  align-items:center; 
  gap:4px; 
  font-weight:500; 
  transition:all 0.3s; 
  &:hover{ background: linear-gradient(90deg,#91C0F8,#5B8FF9);} 
}

/* 表格美化 */
.el-table th, .el-table td { text-align:center; }
.el-table__body tr:hover { background-color: rgba(91,143,249,0.08); }
.operate-buttons { transition: opacity 0.3s; cursor:pointer; i{padding:8px;border-radius:6px;transition: all .3s ease;&:hover{background-color: rgba(91,143,249,0.15);}} }
.el-table__body tr:hover .operate-buttons{opacity:1;}

/* 分页 */
.pager{ margin-block:20px; border-radius:6px; }
.top-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; }
.nav-left,.nav-right{ display:flex; align-items:center; gap:10px; }
</style>
