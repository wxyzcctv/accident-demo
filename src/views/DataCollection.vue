<template>
  <div class="data-collection">
    <div class="page-title">开源数据采集与处理</div>

    <div class="source-cards">
      <div class="data-card source-card" v-for="src in dataSources" :key="src.name">
        <div class="source-header">
          <el-icon :size="28" :color="src.color"><component :is="src.icon" /></el-icon>
          <div class="source-info">
            <div class="source-name">{{ src.name }}</div>
            <div class="source-desc">{{ src.desc }}</div>
          </div>
        </div>
        <div class="source-stats">
          <span>今日采集：{{ src.todayCount.toLocaleString() }} 条</span>
          <span>活跃连接：{{ src.activeConns }}</span>
        </div>
        <div class="source-footer">
          <el-switch v-model="src.enabled" active-color="#67c23a" @change="onSourceToggle(src)" />
          <span class="source-status" :class="src.enabled ? 'online' : 'offline'">
            {{ src.enabled ? '运行中' : '已停用' }}
          </span>
        </div>
      </div>
    </div>

    <div class="data-card task-section">
      <div class="section-title">采集任务列表</div>
      <el-table :data="tasks" style="width: 100%" size="small">
        <el-table-column prop="name" label="任务名称" min-width="160" />
        <el-table-column prop="lastRun" label="上次执行时间" width="180" />
        <el-table-column prop="count" label="采集数据量" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '运行中' ? 'success' : row.status === '已完成' ? 'info' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="simulateRun(row)">执行</el-button>
            <el-button size="small" link @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="data-card filter-section">
      <div class="section-title">过滤与去重规则配置</div>
      <el-form label-width="140px" label-position="left">
        <el-form-item label="关键字黑名单">
          <div class="tag-input-area">
            <el-tag
              v-for="kw in blackKeywords"
              :key="kw"
              closable
              @close="removeKeyword(kw)"
              type="danger"
              effect="dark"
              size="small"
            >
              {{ kw }}
            </el-tag>
            <el-input
              v-model="newKeyword"
              class="keyword-input"
              size="small"
              placeholder="输入关键字后回车"
              @keyup.enter="addKeyword"
              style="width: 200px"
            />
          </div>
        </el-form-item>
        <el-form-item label="相似度去重阈值">
          <div class="threshold-row">
            <el-slider v-model="dedupThreshold" :min="0.5" :max="0.95" :step="0.05" show-input style="width: 400px" />
            <span class="threshold-hint">当前阈值：{{ dedupThreshold }}（越高越严格）</span>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveFilterRules">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-card preview-section">
      <div class="section-title">原始数据预览</div>
      <el-table :data="rawData" style="width: 100%" size="small" max-height="300">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="source" label="数据源" width="100" />
        <el-table-column prop="content" label="文本内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="time" label="采集时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.flag === '正常' ? 'success' : row.flag === '已过滤' ? 'danger' : 'warning'"
              size="small"
            >
              {{ row.flag }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="taskDetailVisible" title="任务执行详情" width="500px">
      <p>任务名称：{{ currentTask?.name }}</p>
      <p>状态模拟：数据采集完成，本次采集 {{ currentTask?.count?.toLocaleString() }} 条</p>
      <p>新增有效数据：{{ Math.floor((currentTask?.count || 0) * 0.72).toLocaleString() }} 条</p>
      <p>过滤重复数据：{{ Math.floor((currentTask?.count || 0) * 0.28).toLocaleString() }} 条</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const dataSources = ref([
  { name: '社交媒体', desc: '微博、Twitter等平台', icon: 'ChatDotSquare', color: '#409eff', todayCount: 856000, activeConns: 12, enabled: true },
  { name: '新闻网站', desc: '国内外主流媒体', icon: 'Reading', color: '#67c23a', todayCount: 423000, activeConns: 8, enabled: true },
  { name: '行业论坛', desc: '化工、医疗等专论坛', icon: 'Comment', color: '#e6a23c', todayCount: 198000, activeConns: 5, enabled: true },
  { name: '政府公告', desc: '各级政府部门发布', icon: 'Document', color: '#a855f7', todayCount: 67000, activeConns: 3, enabled: false },
  { name: '学术数据库', desc: '论文、专利等学术资源', icon: 'Notebook', color: '#f56c6c', todayCount: 34000, activeConns: 2, enabled: true }
])

function onSourceToggle(src) {
  ElMessage.success(`${src.name} 已${src.enabled ? '启用' : '停用'}`)
}

const tasks = ref([
  { name: '化工安全舆情采集', lastRun: '2026-05-30 14:00:00', count: 45600, status: '运行中' },
  { name: '疫情关键词监控', lastRun: '2026-05-30 13:30:00', count: 32800, status: '已完成' },
  { name: '烟花爆竹安全监控', lastRun: '2026-05-30 13:00:00', count: 12500, status: '已完成' },
  { name: '水源污染事件追踪', lastRun: '2026-05-30 12:00:00', count: 28900, status: '已完成' },
  { name: '煤矿安全信息采集', lastRun: '2026-05-29 23:00:00', count: 19800, status: '待执行' }
])

const taskDetailVisible = ref(false)
const currentTask = ref(null)

function simulateRun(row) {
  ElMessage.info(`正在执行 ${row.name} ...`)
  setTimeout(() => {
    row.status = '运行中'
    setTimeout(() => {
      row.status = '已完成'
      row.lastRun = new Date().toLocaleString('zh-CN')
      row.count += Math.floor(Math.random() * 1000) + 500
      ElMessage.success(`${row.name} 执行完成`)
    }, 1500)
  }, 300)
}

function viewDetail(row) {
  currentTask.value = row
  taskDetailVisible.value = true
}

const blackKeywords = ref(['广告推广', '无关娱乐', '虚假信息', '重复转载', '商业营销'])
const newKeyword = ref('')
const dedupThreshold = ref(0.85)

function addKeyword() {
  if (newKeyword.value && !blackKeywords.value.includes(newKeyword.value)) {
    blackKeywords.value.push(newKeyword.value)
    newKeyword.value = ''
  }
}

function removeKeyword(kw) {
  blackKeywords.value = blackKeywords.value.filter(k => k !== kw)
}

function saveFilterRules() {
  ElMessage.success('过滤规则配置已保存')
}

const rawData = ref([
  { id: 1, source: '社交媒体', content: '某化工厂附近居民反映闻到刺鼻气味，已有数人出现头晕呕吐症状', time: '2026-05-30 14:32:10', flag: '正常' },
  { id: 2, source: '新闻网站', content: 'XX市疾控中心通报：近期流感样病例较上月增加30%', time: '2026-05-30 14:28:05', flag: '正常' },
  { id: 3, source: '行业论坛', content: '高价回收废旧化工原料，量大从优，欢迎来电咨询', time: '2026-05-30 14:25:30', flag: '已过滤' },
  { id: 4, source: '社交媒体', content: '今天天气真好，适合出去郊游烧烤！', time: '2026-05-30 14:22:15', flag: '已过滤' },
  { id: 5, source: '政府公告', content: '关于进一步加强危险化学品安全管理的通知', time: '2026-05-30 14:18:40', flag: '正常' },
  { id: 6, source: '新闻网站', content: 'XX煤矿发生瓦斯突出事故致3人被困，救援正在进行中', time: '2026-05-30 14:15:22', flag: '正常' },
  { id: 7, source: '社交媒体', content: '某化工厂附近居民反映闻到刺鼻气味，已有数人出现头晕呕吐症状', time: '2026-05-30 14:30:05', flag: '重复' },
  { id: 8, source: '学术数据库', content: '基于深度学习的化工事故预测模型研究综述', time: '2026-05-30 14:08:30', flag: '正常' }
])
</script>

<style scoped>
.data-collection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.source-card {
  padding: 16px;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.source-name {
  font-size: 15px;
  font-weight: 600;
}

.source-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.source-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.source-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.source-status { font-size: 12px; }
.source-status.online { color: var(--accent-green); }
.source-status.offline { color: var(--text-secondary); }

.task-section, .filter-section, .preview-section {
  padding: 16px;
}

.tag-input-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.keyword-input {
  width: 200px;
}

.threshold-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.threshold-hint {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>