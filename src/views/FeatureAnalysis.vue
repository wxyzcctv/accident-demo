<template>
  <div class="feature-analysis">
    <div class="page-title">特征提取与分析</div>

    <div class="filter-bar">
      <el-select v-model="eventType" placeholder="事件类型" @change="refreshCharts">
        <el-option label="全部类型" value="all" />
        <el-option label="爆炸" value="explosion" />
        <el-option label="有害物质泄露" value="leak" />
        <el-option label="重大疾病传播" value="disease" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="refreshCharts"
      />
    </div>

    <div class="charts-row">
      <div class="data-card chart-card">
        <div class="section-title">情感分析趋势</div>
        <div ref="sentimentTrendChart" class="chart-box"></div>
      </div>
      <div class="data-card chart-card">
        <div class="section-title">聚类结果分布</div>
        <div ref="clusterChart" class="chart-box"></div>
      </div>
    </div>

    <div class="charts-row">
      <div class="data-card chart-card">
        <div class="section-title">事件频次序列预测</div>
        <div ref="forecastChart" class="chart-box"></div>
      </div>
      <div class="data-card chart-card">
        <div class="section-title">特征词云</div>
        <div ref="wordCloudChart" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const eventType = ref('all')
const dateRange = ref([new Date('2026-05-01'), new Date('2026-05-30')])

const sentimentTrendChart = ref(null)
const clusterChart = ref(null)
const forecastChart = ref(null)
const wordCloudChart = ref(null)
let stInstance = null, clusterInstance = null, forecastInstance = null, wordCloudInstance = null

function generateDates(days) {
  const dates = []
  const start = new Date('2026-05-01')
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return dates
}

function initSentimentTrend() {
  if (!sentimentTrendChart.value) return
  stInstance = echarts.init(sentimentTrendChart.value)
  const dates = generateDates(30)
  const option = {
    grid: { top: 10, right: 20, bottom: 30, left: 45 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLabel: { color: '#8899bb', fontSize: 10, interval: 4 }, axisLine: { lineStyle: { color: '#1e3a5f' } } },
    yAxis: { type: 'value', max: 1, axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    series: [
      { name: '正面', type: 'line', data: generateWave(30, 0.5, 0.1), smooth: true, lineStyle: { color: '#67c23a', width: 2 }, symbol: 'none', areaStyle: { color: 'rgba(103,194,58,0.1)' } },
      { name: '负面', type: 'line', data: generateWave(30, 0.25, 0.12), smooth: true, lineStyle: { color: '#f56c6c', width: 2 }, symbol: 'none', areaStyle: { color: 'rgba(245,108,108,0.1)' } },
      { name: '中性', type: 'line', data: generateWave(30, 0.25, 0.05), smooth: true, lineStyle: { color: '#409eff', width: 2 }, symbol: 'none', areaStyle: { color: 'rgba(64,158,255,0.1)' } }
    ],
    legend: { textStyle: { color: '#8899bb', fontSize: 11 }, bottom: 0 }
  }
  stInstance.setOption(option)
}

function generateWave(len, base, amp) {
  const result = []
  for (let i = 0; i < len; i++) {
    result.push(Math.max(0, Math.min(1, base + (Math.random() - 0.5) * amp * 2 + Math.sin(i * 0.4) * amp * 0.5)))
  }
  return result
}

function initClusterChart() {
  if (!clusterChart.value) return
  clusterInstance = echarts.init(clusterChart.value)
  const clusters = [
    { name: '爆炸类', data: generateClusterPoints(80, 0.3, 0.7), color: '#f56c6c' },
    { name: '泄露类', data: generateClusterPoints(90, 0.6, 0.35), color: '#e6a23c' },
    { name: '疾病类', data: generateClusterPoints(70, 0.75, 0.7), color: '#409eff' }
  ]
  const option = {
    grid: { top: 10, right: 20, bottom: 30, left: 45 },
    tooltip: { trigger: 'item', formatter: (p) => `事件簇：${p.seriesName}<br/>坐标：(${p.value[0].toFixed(2)}, ${p.value[1].toFixed(2)})` },
    xAxis: { type: 'value', axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    yAxis: { type: 'value', axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    series: clusters.map(c => ({
      name: c.name,
      type: 'scatter',
      data: c.data,
      symbolSize: 6,
      itemStyle: { color: c.color, opacity: 0.7 }
    })),
    legend: { textStyle: { color: '#8899bb', fontSize: 11 }, bottom: 0 }
  }
  clusterInstance.setOption(option)
}

function generateClusterPoints(count, cx, cy) {
  return Array.from({ length: count }, () => [
    cx + (Math.random() - 0.5) * 0.25,
    cy + (Math.random() - 0.5) * 0.25
  ])
}

function initForecastChart() {
  if (!forecastChart.value) return
  forecastInstance = echarts.init(forecastChart.value)
  const dates = generateDates(40)
  const historical = Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 10)
  const forecast = Array.from({ length: 10 }, (_, i) => {
    const trend = historical.slice(-5).reduce((a, b) => a + b, 0) / 5
    return Math.floor(trend + (Math.random() - 0.3) * 10 + i * 0.5)
  })
  const allData = [...historical, ...new Array(30).fill(null), ...new Array(10).fill(null)]
  const forecastFull = [...new Array(30).fill(null), ...historical.slice(-1), ...forecast]

  const option = {
    grid: { top: 10, right: 20, bottom: 30, left: 45 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLabel: { color: '#8899bb', fontSize: 10, interval: 5 }, axisLine: { lineStyle: { color: '#1e3a5f' } } },
    yAxis: { type: 'value', axisLabel: { color: '#8899bb', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } } },
    series: [
      { name: '历史实际值', type: 'line', data: allData.map((_, i) => i < 30 ? historical[i] : null), smooth: true, lineStyle: { color: '#409eff', width: 2 }, symbol: 'circle', symbolSize: 4 },
      { name: '预测值', type: 'line', data: forecastFull.map((_, i) => i >= 29 ? forecast[i - 29] : null), smooth: true, lineStyle: { color: '#e6a23c', width: 2, type: 'dashed' }, symbol: 'diamond', symbolSize: 5 }
    ],
    legend: { textStyle: { color: '#8899bb', fontSize: 11 }, bottom: 0 }
  }
  forecastInstance.setOption(option)
}

function initWordCloud() {
  if (!wordCloudChart.value) return
  wordCloudInstance = echarts.init(wordCloudChart.value)
  const words = wordList.map(w => ({
    name: w.text,
    value: w.value,
    textStyle: { color: w.color }
  }))
  const option = {
    tooltip: { show: true, formatter: (p) => `${p.name}: ${p.value}` },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [14, 48],
      rotationRange: [0, 0],
      rotationStep: 15,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: { fontWeight: 'bold' },
      data: words
    }]
  }
  wordCloudInstance.setOption(option)
}

const wordList = [
  { text: '化工泄漏', value: 100, color: '#f56c6c' },
  { text: '瓦斯爆炸', value: 90, color: '#e6a23c' },
  { text: '环境污染', value: 85, color: '#409eff' },
  { text: '疫情防控', value: 95, color: '#67c23a' },
  { text: '安全事故', value: 75, color: '#a855f7' },
  { text: '应急处置', value: 65, color: '#f56c6c' },
  { text: '舆情监测', value: 70, color: '#409eff' },
  { text: '风险评估', value: 60, color: '#e6a23c' },
  { text: '有毒气体', value: 80, color: '#f56c6c' },
  { text: '水源污染', value: 68, color: '#409eff' },
  { text: '煤矿安全', value: 72, color: '#e6a23c' },
  { text: '传染病', value: 88, color: '#67c23a' },
  { text: '放射源', value: 55, color: '#a855f7' },
  { text: '压力容器', value: 50, color: '#f56c6c' },
  { text: '预警模型', value: 45, color: '#409eff' },
  { text: '多Agent协同', value: 40, color: '#e6a23c' },
  { text: 'LSTM预测', value: 48, color: '#67c23a' },
  { text: '情感分析', value: 52, color: '#a855f7' },
  { text: '数据采集', value: 38, color: '#409eff' },
  { text: '深度聚类', value: 42, color: '#f56c6c' }
]

function refreshCharts() {
  initSentimentTrend()
  initClusterChart()
  initForecastChart()
  initWordCloud()
}

onMounted(() => {
  nextTick(() => {
    initSentimentTrend()
    initClusterChart()
    initForecastChart()
    initWordCloud()
  })
  window.addEventListener('resize', () => {
    stInstance?.resize()
    clusterInstance?.resize()
    forecastInstance?.resize()
    wordCloudInstance?.resize()
  })
})

onUnmounted(() => {
  stInstance?.dispose()
  clusterInstance?.dispose()
  forecastInstance?.dispose()
  wordCloudInstance?.dispose()
})
</script>

<style scoped>
.feature-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  padding: 16px;
}

.chart-box {
  height: 280px;
}
</style>