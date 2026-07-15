import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '预警监控大屏' }
      },
      {
        path: 'data-collection',
        name: 'DataCollection',
        component: () => import('@/views/DataCollection.vue'),
        meta: { title: '数据采集与处理' }
      },
      {
        path: 'feature-analysis',
        name: 'FeatureAnalysis',
        component: () => import('@/views/FeatureAnalysis.vue'),
        meta: { title: '特征提取与分析' }
      },
      {
        path: 'warning-rules',
        name: 'WarningRules',
        component: () => import('@/views/WarningRules.vue'),
        meta: { title: '预警规则配置' }
      },
      {
        path: 'model-factory',
        name: 'ModelFactory',
        component: () => import('@/views/ModelFactory.vue'),
        meta: { title: '模型工厂' }
      },
      {
        path: 'agent-workbench',
        name: 'AgentWorkbench',
        component: () => import('@/views/AgentWorkbench.vue'),
        meta: { title: 'Agent工作台' }
      },
      {
        path: 'agent-comparison',
        name: 'AgentComparison',
        component: () => import('@/views/AgentComparison.vue'),
        meta: { title: '效果对比' }
      },
      {
        path: 'warning-events',
        name: 'WarningEvents',
        component: () => import('@/views/WarningEvents.vue'),
        meta: { title: '预警事件处置' }
      },
      {
        path: 'qualification',
        name: 'Qualification',
        component: () => import('@/views/Qualification.vue'),
        meta: { title: '资质与经验' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router