<template>
  <div class="main-layout">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo-area">
          <el-icon :size="24" color="#409eff"><Warning /></el-icon>
          <span v-show="!isCollapse" class="logo-text">重大危害事件预警平台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          background-color="#0a1628"
          text-color="#8899bb"
          active-text-color="#409eff"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>预警监控大屏</template>
          </el-menu-item>
          <el-menu-item index="/data-collection">
            <el-icon><Collection /></el-icon>
            <template #title>数据采集与处理</template>
          </el-menu-item>
          <el-menu-item index="/feature-analysis">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>特征提取与分析</template>
          </el-menu-item>
          <el-menu-item index="/warning-rules">
            <el-icon><Setting /></el-icon>
            <template #title>预警规则配置</template>
          </el-menu-item>
          <el-menu-item index="/model-factory">
            <el-icon><Cpu /></el-icon>
            <template #title>模型工厂</template>
          </el-menu-item>
          <el-menu-item index="/agent-workbench">
            <el-icon><Connection /></el-icon>
            <template #title>Agent工作台</template>
          </el-menu-item>
          <el-menu-item index="/warning-events">
            <el-icon><Bell /></el-icon>
            <template #title>预警事件处置</template>
          </el-menu-item>
          <el-menu-item index="/agent-comparison">
            <el-icon><TrendCharts /></el-icon>
            <template #title>效果对比</template>
          </el-menu-item>
          <el-menu-item index="/qualification">
            <el-icon><Medal /></el-icon>
            <template #title>资质与经验</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="top-header">
          <div class="header-left">
            <el-button
              :icon="Fold"
              text
              @click="isCollapse = !isCollapse"
              style="color: #8899bb"
            />
            <span class="header-title">{{ currentTitle }}</span>
          </div>
          <div class="header-right">
            <span class="time-display">{{ currentTime }}</span>
            <el-tag type="success" effect="dark" size="small">系统运行中</el-tag>
            <el-avatar :size="32" style="background: #409eff; margin-left: 12px;">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Fold } from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => route.meta?.title || '')

const currentTime = ref('')
let timer = null

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.main-layout :deep(.el-container) {
  height: 100%;
}

.sidebar {
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  transition: width 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar :deep(.el-menu) {
  flex: 1;
  overflow-y: auto;
}

.logo-area {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.top-header {
  height: 60px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  color: var(--text-secondary);
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.main-content {
  background: var(--bg-primary);
  padding: 20px;
  overflow-y: auto;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  font-size: 13px;
}
</style>