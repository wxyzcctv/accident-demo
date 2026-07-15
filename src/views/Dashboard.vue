<template>
  <div class="dashboard">
    <div class="stat-cards">
      <div class="data-card stat-card" v-for="card in statCards" :key="card.label">
        <div class="stat-label">{{ card.label }}</div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-trend" :class="card.trend > 0 ? 'up' : 'down'">
          <el-icon><component :is="card.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
          {{ Math.abs(card.trend) }}% 较昨日
        </div>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="map-section">
        <div class="section-title">潜在危害事件地理分布</div>
        <div ref="mapChart" class="chart-box map-chart"></div>
      </div>
      <div class="right-panel">
        <div class="data-card sentiment-section">
          <div class="section-title">情感分析走势</div>
          <div ref="sentimentChart" class="chart-box"></div>
        </div>
        <div class="data-card alert-type-section">
          <div class="section-title">事件类型分布</div>
          <div ref="typeChart" class="chart-box-small"></div>
        </div>
      </div>
    </div>

    <div class="data-card alert-scroll">
      <div class="section-title">实时预警滚动</div>
      <div class="scroll-container" ref="scrollContainer">
        <div class="scroll-content" :style="{ transform: `translateY(-${scrollOffset}px)` }">
          <div
            v-for="(alert, i) in alertList"
            :key="i"
            class="alert-row"
            :class="'severity-' + alert.severity"
          >
            <el-tag :type="severityType(alert.severity)" size="small">{{ severityLabel(alert.severity) }}</el-tag>
            <span class="alert-time">{{ alert.time }}</span>
            <el-tag :type="eventTypeTag(alert.type)" size="small" effect="plain">{{ alert.type }}</el-tag>
            <span class="alert-title">{{ alert.title }}</span>
            <span class="alert-location">{{ alert.location }}</span>
          </div>
          <div
            v-for="(alert, i) in alertList"
            :key="'dup-' + i"
            class="alert-row"
            :class="'severity-' + alert.severity"
          >
            <el-tag :type="severityType(alert.severity)" size="small">{{ severityLabel(alert.severity) }}</el-tag>
            <span class="alert-time">{{ alert.time }}</span>
            <el-tag :type="eventTypeTag(alert.type)" size="small" effect="plain">{{ alert.type }}</el-tag>
            <span class="alert-title">{{ alert.title }}</span>
            <span class="alert-location">{{ alert.location }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import chinaMapJson from '../utils/chinamap.json'

let chinaGeoJson = null

async function loadChinaMap() {
  if (chinaGeoJson) return chinaGeoJson
  try {
    chinaGeoJson = chinaMapJson
    echarts.registerMap('china', chinaGeoJson)
    return chinaGeoJson
  } catch {
    return null
  }
}

const statCards = ref([
  { label: '今日采集数据量', value: '2,847,392', trend: 12.5 },
  { label: '过滤后有效数据量', value: '1,263,451', trend: 8.3 },
  { label: '预警触发次数', value: '47', trend: -5.2 },
  { label: '已处置事件数', value: '42', trend: 15.8 }
])

const mapChart = ref(null)
const sentimentChart = ref(null)
const typeChart = ref(null)
let mapInstance = null
let sentimentInstance = null
let typeInstance = null

const scrollContainer = ref(null)
const scrollOffset = ref(0)
let scrollTimer = null

function severityType(level) {
  return level === 1 ? 'danger' : level === 2 ? 'warning' : 'info'
}

function severityLabel(level) {
  return level === 1 ? '一级' : level === 2 ? '二级' : '三级'
}

function eventTypeTag(type) {
  if (type.includes('爆炸')) return 'danger'
  if (type.includes('泄露')) return 'warning'
  return 'info'
}

const alertList = [
  { time: '14:32:15', type: '有害物质泄露', severity: 1, title: '某化工园区检测到异常气体浓度超标', location: '江苏省南京市' },
  { time: '14:28:03', type: '爆炸', severity: 1, title: '煤矿瓦斯浓度监测持续上升触发预警', location: '山西省大同市' },
  { time: '14:25:41', type: '重大疾病传播', severity: 2, title: '某地区呼吸道传染病就诊量异常增加', location: '广东省广州市' },
  { time: '14:18:22', type: '有害物质泄露', severity: 2, title: '水源地水质监测指标异常波动', location: '湖北省武汉市' },
  { time: '14:12:09', type: '爆炸', severity: 3, title: '烟花爆竹存储仓库温湿度异常', location: '湖南省浏阳市' },
  { time: '14:08:55', type: '重大疾病传播', severity: 1, title: '边境口岸检出输入性传染病原体', location: '云南省瑞丽市' },
  { time: '14:03:37', type: '有害物质泄露', severity: 2, title: '沿海区域油污扩散趋势预警', location: '山东省青岛市' },
  { time: '13:58:14', type: '爆炸', severity: 2, title: '燃气管道压力异常波动持续告警', location: '河北省石家庄市' },
  { time: '13:52:48', type: '重大疾病传播', severity: 3, title: '学校聚集性发热病例上报增加', location: '四川省成都市' },
]

async function initMapChart() {
  if (!mapChart.value) return
  await loadChinaMap()
  mapInstance = echarts.init(mapChart.value)
  const geoCoordMap = {
    '江苏省南京市': [118.78, 32.04],
    '山西省大同市': [113.30, 40.08],
    '广东省广州市': [113.23, 23.16],
    '湖北省武汉市': [114.31, 30.52],
    '湖南省浏阳市': [113.63, 28.16],
    '云南省瑞丽市': [97.85, 24.01],
    '山东省青岛市': [120.38, 36.07],
    '河北省石家庄市': [114.48, 38.03],
    '四川省成都市': [104.06, 30.67],
    '浙江省海盐县': [120.95, 30.53]
  }

  const events = alertList.map(a => ({
    name: a.location,
    value: [...geoCoordMap[a.location], a.severity === 1 ? 3 : a.severity === 2 ? 2 : 1],
    type: a.type,
    severity: a.severity
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        if (p.seriesType === 'effectScatter') {
          return `${p.name}<br/>事件类型：${events[p.dataIndex]?.type}<br/>严重等级：${events[p.dataIndex]?.severity}级`
        }
        return p.name
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.5,
      center: [105, 36],
      scaleLimit: { min: 0.8, max: 4 },
      itemStyle: {
        areaColor: '#0f1f3d',
        borderColor: '#1e3a5f',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: '#1a3050'
        }
      }
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: events.filter(e => e.severity === 1),
        symbolSize: 14,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: { color: '#f56c6c' },
        label: { show: true, formatter: '{b}', position: 'right', color: '#e0e6f0', fontSize: 11 }
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: events.filter(e => e.severity === 2),
        symbolSize: 10,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 3 },
        itemStyle: { color: '#e6a23c' },
        label: { show: false }
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: events.filter(e => e.severity === 3),
        symbolSize: 7,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 2 },
        itemStyle: { color: '#409eff' },
        label: { show: false }
      }
    ]
  }
  mapInstance.setOption(option)
}

function initSentimentChart() {
  if (!sentimentChart.value) return
  sentimentInstance = echarts.init(sentimentChart.value)
  const now = new Date()
  const times = []
  for (let i = 59; i >= 0; i--) {
    const t = new Date(now - i * 2000)
    times.push(t.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }
  const positive = generateWave(60, 0.55, 0.05)
  const negative = generateWave(60, 0.20, 0.08)
  const neutral = generateWave(60, 0.25, 0.04)

  const option = {
    grid: { top: 10, right: 20, bottom: 30, left: 45 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { color: '#8899bb', fontSize: 10, interval: 9 },
      axisLine: { lineStyle: { color: '#1e3a5f' } }
    },
    yAxis: {
      type: 'value',
      max: 1,
      axisLabel: { color: '#8899bb', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
    },
    series: [
      { name: '正面', type: 'line', data: positive, smooth: true, lineStyle: { color: '#67c23a', width: 2 }, symbol: 'none' },
      { name: '负面', type: 'line', data: negative, smooth: true, lineStyle: { color: '#f56c6c', width: 2 }, symbol: 'none' },
      { name: '中性', type: 'line', data: neutral, smooth: true, lineStyle: { color: '#409eff', width: 2 }, symbol: 'none' }
    ],
    legend: {
      data: ['正面', '负面', '中性'],
      textStyle: { color: '#8899bb', fontSize: 11 },
      bottom: 0
    }
  }
  sentimentInstance.setOption(option)
}

function initTypeChart() {
  if (!typeChart.value) return
  typeInstance = echarts.init(typeChart.value)
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['50%', '50%'],
        data: [
          { value: 23, name: '有害物质泄露', itemStyle: { color: '#e6a23c' } },
          { value: 15, name: '爆炸', itemStyle: { color: '#f56c6c' } },
          { value: 9, name: '重大疾病传播', itemStyle: { color: '#409eff' } }
        ],
        label: { color: '#8899bb', fontSize: 11 },
        emphasis: { label: { fontSize: 14 } }
      }
    ]
  }
  typeInstance.setOption(option)
}

function generateWave(len, base, amp) {
  const result = []
  for (let i = 0; i < len; i++) {
    result.push(Math.max(0, Math.min(1, base + (Math.random() - 0.5) * amp * 2 + Math.sin(i * 0.3) * amp)))
  }
  return result
}

let sentimentUpdateTimer = null
function updateSentimentData() {
  if (!sentimentInstance) return
  const option = sentimentInstance.getOption()
  option.xAxis[0].data.shift()
  option.xAxis[0].data.push(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  option.series.forEach(s => {
    s.data.shift()
    const base = s.name === '正面' ? 0.55 : s.name === '负面' ? 0.2 : 0.25
    s.data.push(Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.15)))
  })
  sentimentInstance.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initMapChart()
    initSentimentChart()
    initTypeChart()
  })

  sentimentUpdateTimer = setInterval(updateSentimentData, 2000)

  const rowHeight = 40
  const totalRows = alertList.length
  let scrollPos = 0

  scrollTimer = setInterval(() => {
    scrollPos += 0.5
    if (scrollPos >= totalRows * rowHeight) {
      scrollPos = 0
    }
    scrollOffset.value = scrollPos
  }, 50)

  window.addEventListener('resize', () => {
    mapInstance?.resize()
    sentimentInstance?.resize()
    typeInstance?.resize()
  })
})

onUnmounted(() => {
  if (sentimentUpdateTimer) clearInterval(sentimentUpdateTimer)
  if (scrollTimer) clearInterval(scrollTimer)
  mapInstance?.dispose()
  sentimentInstance?.dispose()
  typeInstance?.dispose()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-trend.up { color: var(--accent-green); }
.stat-trend.down { color: var(--accent-red); }

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
}

.map-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 560px;
}

.map-chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-box {
  height: 200px;
}

.chart-box-small {
  height: 185px;
}

.sentiment-section, .alert-type-section {
  padding: 16px;
}

.alert-scroll {
  padding: 16px;
}

.scroll-container {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.scroll-content {
  transition: transform 0.05s linear;
}

.alert-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: var(--bg-secondary);
  font-size: 13px;
  height: 36px;
}

.alert-row.severity-1 { border-left: 3px solid var(--accent-red); }
.alert-row.severity-2 { border-left: 3px solid var(--accent-orange); }
.alert-row.severity-3 { border-left: 3px solid var(--accent-blue); }

.alert-time {
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.alert-title {
  color: var(--text-primary);
  flex: 1;
}

.alert-location {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>