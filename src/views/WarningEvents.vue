<template>
  <div class="warning-events">
    <div class="page-title">预警事件处置与报告</div>

    <div class="data-card">
      <div class="section-title">已触发预警事件列表</div>
      <el-table :data="events" style="width:100%" @row-click="viewEvent" :row-style="{ cursor: 'pointer' }" size="small">
        <el-table-column prop="title" label="事件标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="130">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="触发时间" width="170" />
        <el-table-column prop="location" label="影响区域" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button size="small" type="primary" link>查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" :title="currentEvent?.title" width="800px" top="3vh">
      <el-tabs model-value="timeline" @tab-change="onTabChange">
        <el-tab-pane label="多Agent协同分析时间线" name="timeline" class="timeline-tab-content">
          <div class="timeline">
            <div v-for="(step, i) in agentTimeline" :key="i" class="tl-item">
              <div class="tl-dot" :class="'step-' + (i + 1)"></div>
              <div class="tl-content">
                <div class="tl-header">
                  <span class="tl-agent">{{ step.agent }}</span>
                  <span class="tl-time">耗时 {{ step.duration }}</span>
                </div>
                <div class="tl-summary">{{ step.summary }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="预警报告预览" name="report">
          <div class="report-preview">
            <div class="report-header">
              <h2>重大危害事件预警报告</h2>
              <div class="report-meta">
                <span>报告编号：WR-2026-0528-0017</span>
                <span>生成时间：{{ currentEvent?.time }}</span>
                <span>严重等级：<el-tag type="danger">一级</el-tag></span>
              </div>
            </div>
            <div class="report-section">
              <h3>一、事件摘要</h3>
              <p>{{ currentEvent?.summary }}</p>
            </div>
            <div class="report-section">
              <h3>二、影响区域</h3>
              <p>主要影响区域：{{ currentEvent?.location }}及周边约800米半径范围，涉及约12,000名居民，涵盖2个居民小区、1所学校及3家商业设施。</p>
            </div>
            <div class="report-section">
              <h3>三、情感走势分析</h3>
              <div ref="reportSentimentChart" style="height:200px"></div>
            </div>
            <div class="report-section">
              <h3>四、Agent协同分析结论</h3>
              <div class="agent-conclusions">
                <div class="ac-item" v-for="ac in agentConclusions" :key="ac.agent">
                  <el-tag size="small">{{ ac.agent }}</el-tag>
                  <span>{{ ac.conclusion }}</span>
                </div>
              </div>
              <p style="margin-top:12px"><strong>综合置信度：</strong><span style="color:var(--accent-blue);font-size:18px;font-weight:700">91.3%</span></p>
            </div>
            <div class="report-section">
              <h3>五、建议措施</h3>
              <ol>
                <li>立即启动重大危害事件一级应急预案，通知市应急管理局、生态环境局、卫健委</li>
                <li>对受影响区域居民实施紧急疏散，启用临时安置点</li>
                <li>组织专业队伍排查并封堵泄漏源，持续监测环境指标</li>
                <li>通过官方媒体及时发布权威信息，防止谣言传播</li>
                <li>对该园区同类设施开展专项安全检查，消除潜在隐患</li>
              </ol>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const events = ref([
  { id: 1, title: 'XX化工园区苯浓度异常超标预警', type: '有害物质泄露', time: '2026-05-30 14:32:15', location: '江苏省南京市', status: '处置中', severity: 1,
    summary: '2026年5月30日14时32分，系统通过多源数据融合分析，检测到江苏省南京市某化工园区苯系物浓度持续异常升高。经多Agent协同分析，聚类Agent识别到该园区周边交易数据异常，序列预测Agent判定浓度上升趋势持续恶化，情感分析Agent捕获到周边居民恐慌情绪蔓延。经多轮Agent协商辩论，确认触发一级预警。' },
  { id: 2, title: '山西大同煤矿瓦斯浓度持续上升预警', type: '爆炸', time: '2026-05-30 14:28:03', location: '山西省大同市', status: '处置中', severity: 1,
    summary: '煤矿安全监测系统检测到瓦斯浓度持续异常升高，结合历史事故数据和实时物联网传感器数据，多Agent协同分析确认存在爆炸风险。' },
  { id: 3, title: '广州呼吸道传染病就诊量异常预警', type: '重大疾病传播', time: '2026-05-30 14:25:41', location: '广东省广州市', status: '已处置', severity: 2,
    summary: '医疗服务系统统计发现呼吸道传染病就诊量环比增长超警戒线，结合社交媒体舆情和药品销售数据，系统判定需发布二级预警。' },
  { id: 4, title: '武汉水源地水质监测异常波动预警', type: '有害物质泄露', time: '2026-05-30 14:18:22', location: '湖北省武汉市', status: '已处置', severity: 2,
    summary: '水源地自动监测站检测到多项水质指标异常波动，多Agent联合分析排除设备故障可能，确认为潜在泄露事件触发预警。' },
  { id: 5, title: '云南边境输入性传染病原体检出预警', type: '重大疾病传播', time: '2026-05-29 09:15:33', location: '云南省瑞丽市', status: '已关闭', severity: 3,
    summary: '边境口岸检疫数据异常，结合国际疫情通报，系统评估输入风险为三级，已通知相关部门加强检疫措施。' }
])

const detailVisible = ref(false)
const currentEvent = ref(null)
const reportSentimentChart = ref(null)
let reportSentimentInstance = null

function typeTag(type) {
  if (type.includes('爆炸')) return 'danger'
  if (type.includes('泄露')) return 'warning'
  return 'info'
}

function statusTag(status) {
  if (status === '处置中') return 'warning'
  if (status === '已处置') return 'success'
  return 'info'
}

function onTabChange(tabName) {
  if (tabName === 'report') {
    setTimeout(() => {
      initReportChart()
    }, 100)
  }
}

function initReportChart() {
  if (!reportSentimentChart.value || reportSentimentInstance) return
  reportSentimentInstance = echarts.init(reportSentimentChart.value)
  const times = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  reportSentimentInstance.setOption({
    grid: { top: 10, right: 10, bottom: 30, left: 40 },
    xAxis: { type: 'category', data: times, axisLabel: { color: '#8899bb', fontSize: 9, interval: 3 } },
    yAxis: { type: 'value', max: 1, axisLabel: { color: '#8899bb', fontSize: 10 } },
    series: [
      { name: '正面', type: 'line', data: Array.from({ length: 24 }, () => Math.random() * 0.3 + 0.1), smooth: true, lineStyle: { color: '#67c23a' }, symbol: 'none' },
      { name: '负面', type: 'line', data: Array.from({ length: 24 }, (_, i) => i < 12 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.4 + 0.4), smooth: true, lineStyle: { color: '#f56c6c' }, symbol: 'none' },
      { name: '中性', type: 'line', data: Array.from({ length: 24 }, () => Math.random() * 0.3 + 0.2), smooth: true, lineStyle: { color: '#409eff' }, symbol: 'none' }
    ],
    legend: { textStyle: { color: '#8899bb', fontSize: 10 }, bottom: 0 }
  })
}

function viewEvent(event) {
  currentEvent.value = event
  detailVisible.value = true
  reportSentimentInstance?.dispose()
  reportSentimentInstance = null
}

const agentTimeline = [
  { agent: '数据采集Agent', duration: '0.3s', summary: '从社交媒体、新闻网站、行业论坛等5个数据源采集原始数据2,847条，经初步过滤保留有效数据1,263条。' },
  { agent: '特征提取Agent', duration: '1.2s', summary: '提取关键词"苯浓度""泄漏""刺鼻气味"等关键特征，构建事件特征向量，情感得分初始值：正面0.23/负面0.18/中性0.59。' },
  { agent: '聚类分析Agent', duration: '0.8s', summary: 'K-Means聚类发现该区域出现一个新的异常事件簇，与历史化工泄露事件簇的余弦相似度为0.87，确认属于有害物质泄露类别。' },
  { agent: '序列预测Agent', duration: '2.1s', summary: 'LSTM模型基于近7天历史趋势预测：若当前态势持续，未来6小时内苯浓度可能突破4.5倍安全阈值，触发一级预警的概率为89%。' },
  { agent: '情感分析Agent', duration: '1.5s', summary: '对周边区域社交媒体进行实时情感分析，发现负面情绪指数从0.18急剧上升至0.67，恐慌关键词频率突增427%。' },
  { agent: '主控Agent', duration: '3.2s', summary: '综合各Agent分析结果，触发多轮辩论机制，最终判定为一级预警事件。生成详细预警报告并推送至相关部门。综合置信度：91.3%。' }
]

const agentConclusions = [
  { agent: '聚类分析Agent', conclusion: '确认该事件与历史化工泄露事件高度相似，相似度0.87，判定为"有害物质泄露"类别。' },
  { agent: '序列预测Agent', conclusion: '趋势持续恶化概率89%，强烈建议将严重等级升级为一级。' },
  { agent: '情感分析Agent', conclusion: '民众恐慌情绪正在快速蔓延，需立即发布官方信息引导舆论。' }
]

onUnmounted(() => {
  reportSentimentInstance?.dispose()
})
</script>

<style scoped>
.warning-events {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline {
  padding: 10px 0;
}

.tl-item {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.tl-dot.step-1 { background: #409eff; }
.tl-dot.step-2 { background: #a855f7; }
.tl-dot.step-3 { background: #e6a23c; }
.tl-dot.step-4 { background: #67c23a; }
.tl-dot.step-5 { background: #f56c6c; }
.tl-dot.step-6 { background: #409eff; }

.tl-content {
  flex: 1;
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 8px;
}

.tl-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.tl-agent {
  font-weight: 600;
  font-size: 13px;
}

.tl-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.tl-summary {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
}

.report-preview {
  background: #fff;
  color: #333;
  padding: 30px;
  border-radius: 8px;
}

.report-header {
  text-align: center;
  border-bottom: 2px solid #1e3a5f;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.report-header h2 {
  color: #1a1a2e;
  margin-bottom: 10px;
}

.report-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.report-section {
  margin-bottom: 20px;
}

.report-section h3 {
  font-size: 15px;
  color: #1a1a2e;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e0e0;
}

.report-section p {
  font-size: 13px;
  line-height: 1.8;
  text-indent: 2em;
}

.report-section ol {
  padding-left: 2em;
  font-size: 13px;
  line-height: 2;
}

.agent-conclusions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ac-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
}

</style>