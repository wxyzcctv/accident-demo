<template>
  <div class="agent-comparison">
    <div class="page-title">单/多智能体效果对比</div>

    <div class="compare-cards">
      <div class="data-card" v-for="item in compareMetrics" :key="item.label">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-values">
          <div class="mv-item">
            <span class="mv-type">单Agent</span>
            <span class="mv-num" :class="item.singleBetter ? 'better' : ''">{{ item.single }}</span>
          </div>
          <div class="mv-divider"></div>
          <div class="mv-item">
            <span class="mv-type">多Agent</span>
            <span class="mv-num" :class="!item.singleBetter ? 'better' : ''">{{ item.multi }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="data-card case-section">
      <div class="section-title">多智能体协同模式对比</div>
      <div class="mode-compare-cards">
        <div class="data-card mode-card">
          <div class="mode-card-title" style="color:#e6a23c">分工模式</div>
          <div class="mode-card-desc">各Agent独立完成子任务后汇总，主控Agent统一决策</div>
          <div class="mode-metrics">
            <div class="mode-metric"><span class="mm-label">准确率</span><span class="mm-value">89.2%</span></div>
            <div class="mode-metric"><span class="mm-label">平均耗时</span><span class="mm-value">2.1s</span></div>
            <div class="mode-metric"><span class="mm-label">协同深度</span><span class="mm-value">★★☆☆☆</span></div>
          </div>
        </div>
        <div class="data-card mode-card">
          <div class="mode-card-title" style="color:#f56c6c">辩论模式</div>
          <div class="mode-card-desc">多Agent对分析结果进行多轮辩论，通过观点碰撞达成共识</div>
          <div class="mode-metrics">
            <div class="mode-metric"><span class="mm-label">准确率</span><span class="mm-value">91.8%</span></div>
            <div class="mode-metric"><span class="mm-label">平均耗时</span><span class="mm-value">3.5s</span></div>
            <div class="mode-metric"><span class="mm-label">协同深度</span><span class="mm-value">★★★☆☆</span></div>
          </div>
        </div>
        <div class="data-card mode-card">
          <div class="mode-card-title" style="color:#67c23a">协同模式</div>
          <div class="mode-card-desc">链式接力推理，逐轮深化补充，自然收敛到最优方案</div>
          <div class="mode-metrics">
            <div class="mode-metric"><span class="mm-label">准确率</span><span class="mm-value">93.6%</span></div>
            <div class="mode-metric"><span class="mm-label">平均耗时</span><span class="mm-value">4.8s</span></div>
            <div class="mode-metric"><span class="mm-label">协同深度</span><span class="mm-value">★★★★★</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="data-card" style="flex:1">
        <div class="section-title">单/多智能体性能指标对比</div>
        <div ref="barChart" style="height:300px"></div>
      </div>
      <div class="data-card" style="flex:1">
        <div class="section-title">综合能力雷达图</div>
        <div ref="radarChart" style="height:300px"></div>
      </div>
    </div>

    <div class="charts-row">
      <div class="data-card" style="flex:1">
        <div class="section-title">三种模式指标对比</div>
        <div ref="modeBarChart" style="height:300px"></div>
      </div>
      <div class="data-card" style="flex:1">
        <div class="section-title">三种模式能力雷达图</div>
        <div ref="modeRadarChart" style="height:300px"></div>
      </div>
    </div>

    <div class="data-card case-section">
      <div class="section-title">典型案例回放 — 化学品泄露事件</div>
      <div class="case-layout">
        <div class="case-path single-path">
          <div class="path-title">单Agent路径</div>
          <div class="path-steps">
            <div
              v-for="(step, i) in singlePath"
              :key="'s'+i"
              class="path-step"
              :class="{ active: caseStep === i && currentPath === 'single' }"
            >
              <div class="step-index">{{ i + 1 }}</div>
              <div class="step-text">{{ step }}</div>
            </div>
          </div>
          <div class="path-result fail">
            <el-icon><CircleCloseFilled /></el-icon> 未能发出预警
          </div>
        </div>
        <div class="case-center">
          <el-button type="primary" @click="startCaseReplay" :loading="replaying">
            {{ replaying ? '回放中...' : '开始回放' }}
          </el-button>
          <div v-if="replaying" class="replay-info">
            当前步骤：{{ currentStepText }}
          </div>
        </div>
        <div class="case-path multi-path">
          <div class="path-title">多Agent路径</div>
          <div class="path-steps">
            <div
              v-for="(step, i) in multiPath"
              :key="'m'+i"
              class="path-step"
              :class="{ active: caseStep === i && currentPath === 'multi' }"
            >
              <div class="step-index">{{ i + 1 }}</div>
              <div class="step-text">{{ step }}</div>
            </div>
          </div>
          <div class="path-result success">
            <el-icon><SuccessFilled /></el-icon> 成功预警，置信度 91.3%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const compareMetrics = ref([
  { label: '预警准确率', single: '72.4%', multi: '91.8%', singleBetter: false },
  { label: '召回率', single: '68.1%', multi: '89.3%', singleBetter: false },
  { label: '平均预警提前时间', single: '2.3小时', multi: '8.7小时', singleBetter: false },
  { label: '误报率', single: '18.5%', multi: '4.2%', singleBetter: true }
])

const barChart = ref(null)
const radarChart = ref(null)
const modeBarChart = ref(null)
const modeRadarChart = ref(null)
let barInstance = null, radarInstance = null, modeBarInstance = null, modeRadarInstance = null

function initBarChart() {
  if (!barChart.value) return
  barInstance = echarts.init(barChart.value)
  barInstance.setOption({
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['预警准确率', '召回率', 'F1 Score', '提前时间\n(小时)', '误报率'], axisLabel: { color: '#8899bb', fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    series: [
      { name: '单Agent', type: 'bar', data: [72.4, 68.1, 70.2, 2.3, 18.5], itemStyle: { color: '#8899bb' }, barWidth: '35%' },
      { name: '多Agent', type: 'bar', data: [91.8, 89.3, 90.5, 8.7, 4.2], itemStyle: { color: '#409eff' }, barWidth: '35%' }
    ],
    legend: { textStyle: { color: '#8899bb' }, bottom: 0 }
  })
}

function initRadarChart() {
  if (!radarChart.value) return
  radarInstance = echarts.init(radarChart.value)
  radarInstance.setOption({
    radar: {
      indicator: [
        { name: '准确性', max: 100 },
        { name: '时效性', max: 100 },
        { name: '覆盖面', max: 100 },
        { name: '协同能力', max: 100 },
        { name: '可解释性', max: 100 }
      ],
      axisName: { color: '#8899bb' },
      splitArea: { areaStyle: { color: ['rgba(64,158,255,0.05)', 'rgba(64,158,255,0.1)'] } },
      splitLine: { lineStyle: { color: '#1e3a5f' } },
      axisLine: { lineStyle: { color: '#1e3a5f' } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [72, 60, 55, 30, 65], name: '单Agent', areaStyle: { color: 'rgba(136,153,187,0.3)' }, lineStyle: { color: '#8899bb' }, itemStyle: { color: '#8899bb' } },
        { value: [92, 88, 85, 90, 83], name: '多Agent', areaStyle: { color: 'rgba(64,158,255,0.3)' }, lineStyle: { color: '#409eff' }, itemStyle: { color: '#409eff' } }
      ]
    }],
    legend: { textStyle: { color: '#8899bb' }, bottom: 0 }
  })
}

function initModeBarChart() {
  if (!modeBarChart.value) return
  modeBarInstance = echarts.init(modeBarChart.value)
  modeBarInstance.setOption({
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#8899bb' }, bottom: 0 },
    xAxis: { type: 'category', data: ['准确率', '召回率', 'F1 Score', '置信度', '覆盖率'], axisLabel: { color: '#8899bb', fontSize: 11 } },
    yAxis: { type: 'value', min: 70, max: 100, axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    series: [
      { name: '分工模式', type: 'bar', data: [89.2, 86.5, 87.8, 90.1, 88.3], itemStyle: { color: '#e6a23c' }, barWidth: '25%' },
      { name: '辩论模式', type: 'bar', data: [91.8, 89.3, 90.5, 91.3, 85.7], itemStyle: { color: '#f56c6c' }, barWidth: '25%' },
      { name: '协同模式', type: 'bar', data: [93.6, 92.1, 92.8, 93.6, 90.2], itemStyle: { color: '#67c23a' }, barWidth: '25%' }
    ]
  })
}

function initModeRadarChart() {
  if (!modeRadarChart.value) return
  modeRadarInstance = echarts.init(modeRadarChart.value)
  modeRadarInstance.setOption({
    radar: {
      indicator: [
        { name: '准确性', max: 100 },
        { name: '时效性', max: 100 },
        { name: '协同深度', max: 100 },
        { name: '可解释性', max: 100 },
        { name: '鲁棒性', max: 100 }
      ],
      axisName: { color: '#8899bb' },
      splitArea: { areaStyle: { color: ['rgba(64,158,255,0.05)', 'rgba(64,158,255,0.1)'] } },
      splitLine: { lineStyle: { color: '#1e3a5f' } },
      axisLine: { lineStyle: { color: '#1e3a5f' } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [89, 92, 55, 78, 82], name: '分工模式', areaStyle: { color: 'rgba(230,162,60,0.2)' }, lineStyle: { color: '#e6a23c' }, itemStyle: { color: '#e6a23c' } },
        { value: [92, 80, 72, 85, 84], name: '辩论模式', areaStyle: { color: 'rgba(245,108,108,0.2)' }, lineStyle: { color: '#f56c6c' }, itemStyle: { color: '#f56c6c' } },
        { value: [94, 70, 95, 90, 88], name: '协同模式', areaStyle: { color: 'rgba(103,194,58,0.2)' }, lineStyle: { color: '#67c23a' }, itemStyle: { color: '#67c23a' } }
      ]
    }],
    legend: { textStyle: { color: '#8899bb' }, bottom: 0 }
  })
}

const singlePath = [
  '大模型接收预警查询',
  '基于通用知识检索',
  '未识别地域性隐匿信息',
  '输出常规安全提示',
  '未触发预警机制'
]
const multiPath = [
  '聚类Agent发现异常交易关键词',
  '序列Agent发现同类事件频率上升',
  '情感Agent捕捉负面情绪突增',
  '三Agent辩论后确认预警',
  '生成详细预警报告并推送'
]

const caseStep = ref(-1)
const currentPath = ref('')
const replaying = ref(false)
const currentStepText = ref('')

async function startCaseReplay() {
  replaying.value = true
  caseStep.value = -1

  const sequence = [
    { path: 'single', step: 0, text: '单Agent：依赖通用知识检索，未识别地域性隐匿信息...' },
    { path: 'multi', step: 0, text: '多Agent：聚类Agent发现异常交易关键词' },
    { path: 'single', step: 1, text: '单Agent：输出常规安全提示' },
    { path: 'multi', step: 1, text: '多Agent：序列Agent发现该区域类似事件频率上升' },
    { path: 'multi', step: 2, text: '多Agent：情感Agent捕捉负面情绪突增' },
    { path: 'single', step: 2, text: '单Agent：未触发预警机制' },
    { path: 'multi', step: 3, text: '多Agent：三个Agent辩论后确认预警' },
    { path: 'multi', step: 4, text: '多Agent：生成详细报告，预警成功，置信度91.3%' },
    { path: 'single', step: 3, text: '单Agent：最终结果 — 未能发出预警' },
    { path: 'single', step: 4, text: '单Agent：案例分析结束' }
  ]

  for (const item of sequence) {
    await new Promise(r => setTimeout(r, 1000))
    caseStep.value = item.step
    currentPath.value = item.path
    currentStepText.value = item.text
  }

  replaying.value = false
}

onMounted(() => {
  nextTick(() => {
    initBarChart()
    initRadarChart()
    initModeBarChart()
    initModeRadarChart()
  })
  window.addEventListener('resize', () => {
    barInstance?.resize()
    radarInstance?.resize()
    modeBarInstance?.resize()
    modeRadarInstance?.resize()
  })
})

onUnmounted(() => {
  barInstance?.dispose()
  radarInstance?.dispose()
  modeBarInstance?.dispose()
  modeRadarInstance?.dispose()
})
</script>

<style scoped>
.agent-comparison {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compare-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-align: center;
}

.metric-values {
  display: flex;
  align-items: center;
}

.mv-item {
  flex: 1;
  text-align: center;
}

.mv-type {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.mv-num {
  font-size: 22px;
  font-weight: 700;
}

.mv-num.better { color: var(--accent-blue); }

.mv-divider {
  width: 1px;
  height: 30px;
  background: var(--border-color);
}

.charts-row {
  display: flex;
  gap: 16px;
}

.case-section {
  padding: 16px;
}

.mode-compare-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.mode-card {
  padding: 16px;
  text-align: center;
  transition: all 0.3s;
}

.mode-card:hover {
  border-color: var(--accent-blue);
}

.mode-card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.mode-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.mode-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-metric {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.mm-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.mm-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.case-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.case-path {
  flex: 1;
}

.path-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.single-path .path-title { color: #8899bb; }
.multi-path .path-title { color: var(--accent-blue); }

.path-steps { display: flex; flex-direction: column; gap: 10px; }

.path-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.4s;
}

.path-step.active {
  border-color: var(--accent-blue);
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
  background: rgba(64, 158, 255, 0.1);
}

.multi-path .path-step.active {
  border-color: var(--accent-green);
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
  background: rgba(103, 194, 58, 0.1);
}

.step-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.path-step.active .step-index { background: var(--accent-blue); color: #fff; }
.multi-path .path-step.active .step-index { background: var(--accent-green); color: #fff; }

.step-text { font-size: 13px; }

.path-result {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.path-result.fail { background: rgba(245, 108, 108, 0.1); color: var(--accent-red); border: 1px solid rgba(245, 108, 108, 0.3); }
.path-result.success { background: rgba(103, 194, 58, 0.1); color: var(--accent-green); border: 1px solid rgba(103, 194, 58, 0.3); }

.case-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 60px;
}

.replay-info {
  font-size: 13px;
  color: var(--accent-blue);
  text-align: center;
}
</style>