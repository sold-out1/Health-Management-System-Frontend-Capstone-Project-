<template>
  <div class="container">
    <div class="top-header">
      <div class="nav-left"></div>
      <div class="nav-right">
        <div>
          <AutoInput placeholder="搜索评论" @listener="listener" />
        </div>
      </div>
    </div>

    <!-- 表格及分页信息 -->
    <div>
      <el-table :data="apiResult.data" border stripe style="width:100%">
        <el-table-column prop="avatar" width="50" label="头像">
          <template #default="scope">
            <img style="width:30px;height:30px;border-radius:50%;" :src="scope.row.avatar" alt="">
          </template>
        </el-table-column>

        <el-table-column prop="username" width="180" label="评论者">
          <template #default="scope">
            <div class="username-link" @click="filterByUser(scope.row.username)">
              {{ scope.row.username }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评论内容">
          <template #default="scope">
            <div class="comment-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="contentType" :sortable="true" width="120" label="所属模块"></el-table-column>
        <el-table-column prop="upvoteCount" :sortable="true" width="100" label="点赞量"></el-table-column>
        <el-table-column prop="parentId" :sortable="true" width="100" label="层级">
          <template #default="scope">
            <div>{{ scope.row.parentId === null ? '父级' : '子级' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :sortable="true" width="168" label="评论时间"></el-table-column>

        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <div class="operate-buttons">
              <el-dropdown trigger="click" placement="bottom-end">
                <span class="el-dropdown-link">
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="handleDelete(scope.row)" icon="el-icon-delete">
                    删除评论
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件区域 -->
      <div class="pager">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="evaluationQueryDto.current"
          :page-sizes="[10,20]"
          :page-size="evaluationQueryDto.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="apiResult.total">
        </el-pagination>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除评论" :show-close="false" :visible.sync="dialogDeletedVisible" width="20%">
      <span>确定删除评论数据？</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogDeletedVisible=false">取消</el-button>
        <el-button size="mini" type="primary" @click="confirmDeleted">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AutoInput from "@/components/AutoInput.vue";

export default {
  components: { AutoInput },
  data() {
    return {
      id: null,
      apiResult: { data: [], total: 0 },
      evaluationQueryDto: { current:1, size:10, content:null, username:null },
      dialogDeletedVisible: false
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    listener(text) {
      this.evaluationQueryDto.content = text;
      this.evaluationQueryDto.username = null; // 搜索评论时清空用户筛选
      this.fetchFreshData();
    },
    filterByUser(username) {
      this.evaluationQueryDto.username = username; // 点击用户名过滤
      this.evaluationQueryDto.current = 1;
      this.fetchFreshData();
    },
    async fetchFreshData() {
      try {
        const { data, total } = await this.$axios.post('/evaluations/query', this.evaluationQueryDto);
        this.apiResult.data = data;
        this.apiResult.total = total;
      } catch (error) {
        console.error('查询评论信息异常:', error);
      }
    },
    handleSizeChange(size) {
      this.evaluationQueryDto.size = size;
      this.evaluationQueryDto.current = 1;
      this.fetchFreshData();
    },
    handleCurrentChange(current) {
      this.evaluationQueryDto.current = current;
      this.fetchFreshData();
    },
    handleDelete(row) {
      this.dialogDeletedVisible = true;
      this.id = row.id;
    },
    async confirmDeleted() {
      try {
        const { code } = await this.$axios.delete(`/evaluations/${this.id}`);
        if (code === 200) {
          this.$notify.success({ title:'评论删除', message:'删除成功', position:'buttom-right', duration:1000 });
          this.dialogDeletedVisible = false;
          this.id = null;
          this.fetchFreshData();
        }
      } catch (error) {
        console.log("删除评论数据异常：", error);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pager { margin-block: 20px; }

.operate-buttons {
  transition: opacity 0.3s;
  cursor:pointer;
  i {
    padding:8px; border-radius:6px; transition: all .5s ease;
    &:hover { background-color: rgb(236,237,238); }
  }
}

.el-table__body tr:hover .operate-buttons { opacity:1; }

.container { margin:10px 20px; }

.top-header {
  margin-block:10px; padding-inline:10px; border-radius:5px; display:flex; justify-content:space-between; align-items:center;
  .nav-left,.nav-right { display:flex; justify-content:left; align-items:center; gap:10px; }
}

/* 评论内容自动换行 */
.comment-content {
  white-space: normal;
  word-break: break-word;
  max-width:400px;
  line-height:1.4;
}

</style>
