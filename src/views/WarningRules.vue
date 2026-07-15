<template>
  <div class="warning-rules">
    <div class="page-title">预警规则与阈值配置</div>

    <el-tabs v-model="activeTab" type="border-card" class="rules-tabs">
      <el-tab-pane label="爆炸" name="explosion">
        <div class="rules-grid">
          <div class="data-card rule-item" v-for="rule in rules.explosion" :key="rule.name">
            <div class="rule-header">
              <span class="rule-name">{{ rule.name }}</span>
              <el-tag size="small" :type="rule.overThreshold ? 'danger' : 'success'">
                {{ rule.overThreshold ? '已超阈值' : '正常' }}
              </el-tag>
            </div>
            <div class="rule-desc">{{ rule.desc }}</div>
            <div class="rule-body">
              <div class="rule-current-bar">
                <div class="rcb-header">
                  <span class="rcb-label">实时监测值</span>
                  <span class="rcb-value" :class="{ 'over': rule.overThreshold }">{{ rule.current }}{{ rule.unit }}</span>
                </div>
                <div class="rcb-track">
                  <div
                    class="rcb-fill"
                    :class="{ 'over': rule.overThreshold }"
                    :style="{ width: Math.min((rule.current / rule.max) * 100, 100) + '%' }"
                  ></div>
                  <div
                    class="rcb-threshold-marker"
                    :style="{ left: (rule.threshold / rule.max) * 100 + '%' }"
                  ></div>
                </div>
                <div class="rcb-range">
                  <span>{{ rule.min }}{{ rule.unit }}</span>
                  <span>{{ rule.max }}{{ rule.unit }}</span>
                </div>
              </div>
              <div class="rule-threshold-config">
                <span class="rtc-label">预警阈值</span>
                <el-input-number
                  v-model="rule.threshold"
                  :min="rule.min"
                  :max="rule.max"
                  :step="rule.step"
                  size="small"
                  controls-position="right"
                  style="width:130px"
                  @change="(val) => updateOverThreshold(rule)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="有害物质泄露" name="leak">
        <div class="rules-grid">
          <div class="data-card rule-item" v-for="rule in rules.leak" :key="rule.name">
            <div class="rule-header">
              <span class="rule-name">{{ rule.name }}</span>
              <el-tag size="small" :type="rule.overThreshold ? 'danger' : 'success'">
                {{ rule.overThreshold ? '已超阈值' : '正常' }}
              </el-tag>
            </div>
            <div class="rule-desc">{{ rule.desc }}</div>
            <div class="rule-body">
              <div class="rule-current-bar">
                <div class="rcb-header">
                  <span class="rcb-label">实时监测值</span>
                  <span class="rcb-value" :class="{ 'over': rule.overThreshold }">{{ rule.current }}{{ rule.unit }}</span>
                </div>
                <div class="rcb-track">
                  <div
                    class="rcb-fill"
                    :class="{ 'over': rule.overThreshold }"
                    :style="{ width: Math.min((rule.current / rule.max) * 100, 100) + '%' }"
                  ></div>
                  <div
                    class="rcb-threshold-marker"
                    :style="{ left: (rule.threshold / rule.max) * 100 + '%' }"
                  ></div>
                </div>
                <div class="rcb-range">
                  <span>{{ rule.min }}{{ rule.unit }}</span>
                  <span>{{ rule.max }}{{ rule.unit }}</span>
                </div>
              </div>
              <div class="rule-threshold-config">
                <span class="rtc-label">预警阈值</span>
                <el-input-number
                  v-model="rule.threshold"
                  :min="rule.min"
                  :max="rule.max"
                  :step="rule.step"
                  size="small"
                  controls-position="right"
                  style="width:130px"
                  @change="(val) => updateOverThreshold(rule)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="重大疾病传播" name="disease">
        <div class="rules-grid">
          <div class="data-card rule-item" v-for="rule in rules.disease" :key="rule.name">
            <div class="rule-header">
              <span class="rule-name">{{ rule.name }}</span>
              <el-tag size="small" :type="rule.overThreshold ? 'danger' : 'success'">
                {{ rule.overThreshold ? '已超阈值' : '正常' }}
              </el-tag>
            </div>
            <div class="rule-desc">{{ rule.desc }}</div>
            <div class="rule-body">
              <div class="rule-current-bar">
                <div class="rcb-header">
                  <span class="rcb-label">实时监测值</span>
                  <span class="rcb-value" :class="{ 'over': rule.overThreshold }">{{ rule.current }}{{ rule.unit }}</span>
                </div>
                <div class="rcb-track">
                  <div
                    class="rcb-fill"
                    :class="{ 'over': rule.overThreshold }"
                    :style="{ width: Math.min((rule.current / rule.max) * 100, 100) + '%' }"
                  ></div>
                  <div
                    class="rcb-threshold-marker"
                    :style="{ left: (rule.threshold / rule.max) * 100 + '%' }"
                  ></div>
                </div>
                <div class="rcb-range">
                  <span>{{ rule.min }}{{ rule.unit }}</span>
                  <span>{{ rule.max }}{{ rule.unit }}</span>
                </div>
              </div>
              <div class="rule-threshold-config">
                <span class="rtc-label">预警阈值</span>
                <el-input-number
                  v-model="rule.threshold"
                  :min="rule.min"
                  :max="rule.max"
                  :step="rule.step"
                  size="small"
                  controls-position="right"
                  style="width:130px"
                  @change="(val) => updateOverThreshold(rule)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="save-bar">
      <el-button type="primary" size="large" @click="saveRules">保存所有阈值配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('explosion')

const rules = reactive({
  explosion: [
    { name: '情感负面指数阈值', desc: '社交媒体负面情绪占比超过该阈值时触发预警', current: 35, threshold: 40, min: 10, max: 80, step: 1, unit: '%', overThreshold: false },
    { name: '序列预测异常偏离阈值', desc: '事件发生频次预测值偏离历史均值的倍数', current: 2.1, threshold: 2.5, min: 1.0, max: 5.0, step: 0.1, unit: '倍', overThreshold: false },
    { name: '聚类异常簇密度阈值', desc: '异常事件簇中数据点密度的最低要求', current: 18, threshold: 15, min: 5, max: 50, step: 1, unit: '点/单位面积', overThreshold: true },
    { name: '多Agent综合置信度阈值', desc: '多智能体协商后综合置信度需超过该值', current: 85, threshold: 80, min: 50, max: 100, step: 1, unit: '%', overThreshold: true }
  ],
  leak: [
    { name: '情感负面指数阈值', desc: '社交媒体负面情绪占比超过该阈值时触发预警', current: 42, threshold: 40, min: 10, max: 80, step: 1, unit: '%', overThreshold: true },
    { name: '序列预测异常偏离阈值', desc: '事件发生频次预测值偏离历史均值的倍数', current: 2.8, threshold: 2.5, min: 1.0, max: 5.0, step: 0.1, unit: '倍', overThreshold: true },
    { name: '聚类异常簇密度阈值', desc: '异常事件簇中数据点密度的最低要求', current: 22, threshold: 15, min: 5, max: 50, step: 1, unit: '点/单位面积', overThreshold: true },
    { name: '多Agent综合置信度阈值', desc: '多智能体协商后综合置信度需超过该值', current: 91, threshold: 80, min: 50, max: 100, step: 1, unit: '%', overThreshold: true }
  ],
  disease: [
    { name: '情感负面指数阈值', desc: '社交媒体负面情绪占比超过该阈值时触发预警', current: 28, threshold: 40, min: 10, max: 80, step: 1, unit: '%', overThreshold: false },
    { name: '序列预测异常偏离阈值', desc: '事件发生频次预测值偏离历史均值的倍数', current: 1.8, threshold: 2.5, min: 1.0, max: 5.0, step: 0.1, unit: '倍', overThreshold: false },
    { name: '聚类异常簇密度阈值', desc: '异常事件簇中数据点密度的最低要求', current: 12, threshold: 15, min: 5, max: 50, step: 1, unit: '点/单位面积', overThreshold: false },
    { name: '多Agent综合置信度阈值', desc: '多智能体协商后综合置信度需超过该值', current: 76, threshold: 80, min: 50, max: 100, step: 1, unit: '%', overThreshold: false }
  ]
})

function updateOverThreshold(rule) {
  rule.overThreshold = rule.current > rule.threshold
}

function initAllOverThreshold() {
  for (const key of Object.keys(rules)) {
    for (const rule of rules[key]) {
      rule.overThreshold = rule.current > rule.threshold
    }
  }
}

onMounted(() => {
  initAllOverThreshold()
})

function saveRules() {
  ElMessage.success('所有预警规则阈值配置已保存成功')
}
</script>

<style scoped>
.warning-rules {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rules-tabs {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.rules-tabs :deep(.el-tabs__header) {
  background: var(--bg-secondary);
  border-bottom-color: var(--border-color);
}

.rules-tabs :deep(.el-tabs__item) {
  color: var(--text-secondary);
}

.rules-tabs :deep(.el-tabs__item.is-active) {
  color: var(--accent-blue);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.rule-item {
  padding: 18px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rule-name {
  font-size: 15px;
  font-weight: 600;
}

.rule-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.rule-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rule-current-bar {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.rcb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rcb-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.rcb-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-green);
}

.rcb-value.over {
  color: var(--accent-red);
}

.rcb-track {
  position: relative;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: visible;
  margin-bottom: 6px;
}

.rcb-fill {
  height: 100%;
  background: var(--accent-green);
  border-radius: 4px;
  transition: width 0.4s;
}

.rcb-fill.over {
  background: var(--accent-red);
}

.rcb-threshold-marker {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 16px;
  background: var(--accent-orange);
  border-radius: 1px;
  transform: translateX(-50%);
  box-shadow: 0 0 6px rgba(230, 162, 60, 0.6);
}

.rcb-range {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
}

.rule-threshold-config {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.rtc-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.save-bar {
  display: flex;
  justify-content: center;
}
</style>