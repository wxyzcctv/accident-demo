<template>
  <div class="agent-workbench">
    <div class="page-title">Agent 工作台</div>

    <div class="wb-layout">
      <div class="wb-left">
        <div class="section-title">已创建的 Agent</div>
        <div class="agent-list">
          <div
            v-for="agent in agents"
            :key="agent.id"
            class="data-card agent-card"
            :class="{ active: selectedAgent?.id === agent.id }"
            @click="selectAgent(agent)"
          >
            <div class="agent-card-header">
              <el-icon :size="24" :color="agent.color"><component :is="agent.icon" /></el-icon>
              <div>
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-role">{{ agent.role }}</div>
              </div>
            </div>
            <div class="agent-meta">
              <span>模型：{{ agent.models }}</span>
              <span>知识库：{{ agent.knowledgeBase }}</span>
              <span>工具：{{ agent.tools }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wb-center">
        <div class="data-card tool-bind-section" v-if="selectedAgent">
          <div class="section-title">工具绑定与配置 — {{ selectedAgent.name }}</div>
          <div class="bind-grid">
            <div class="bind-group">
              <div class="bind-label">大模型</div>
              <el-checkbox-group v-model="selectedBindings.llm">
                <el-checkbox label="Qwen3-32B-LoRA" border size="small" />
                <el-checkbox label="Qwen3-14B" border size="small" />
              </el-checkbox-group>
            </div>
            <div class="bind-group">
              <div class="bind-label">分析模型</div>
              <el-checkbox-group v-model="selectedBindings.analysis">
                <el-checkbox label="情感分析模型" border size="small" />
                <el-checkbox label="K-Means聚类" border size="small" />
                <el-checkbox label="LSTM预测" border size="small" />
              </el-checkbox-group>
            </div>
            <div class="bind-group">
              <div class="bind-label">工具API</div>
              <el-checkbox-group v-model="selectedBindings.tools">
                <el-checkbox label="数据查询API" border size="small" />
                <el-checkbox label="地图服务API" border size="small" />
                <el-checkbox label="通知推送API" border size="small" />
              </el-checkbox-group>
            </div>
          </div>
          <el-button type="primary" size="small" style="margin-top:12px" @click="saveBinding">保存绑定</el-button>
        </div>

        <div class="data-card workflow-section" v-if="selectedAgent">
          <div class="section-title">工作流编排视图</div>
          <div class="workflow">
            <div class="wf-node" v-for="(node, i) in workflowNodes" :key="node" :class="{ active: wfActiveStep >= i }">
              <div class="wf-icon">
                <el-icon :size="18"><component :is="wfIcons[i]" /></el-icon>
              </div>
              <div class="wf-label">{{ node }}</div>
              <div v-if="i < workflowNodes.length - 1" class="wf-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-card chat-section">
      <div class="section-title">
        多智能体协同消息窗口
        <el-button-group style="margin-left:12px">
          <el-button size="small" :type="simMode === 'division' ? 'primary' : ''" @click="startSimulation('division')" :loading="simulating && simMode === 'division'">分工模式</el-button>
          <el-button size="small" :type="simMode === 'debate' ? 'primary' : ''" @click="startSimulation('debate')" :loading="simulating && simMode === 'debate'">辩论模式</el-button>
          <el-button size="small" :type="simMode === 'collaboration' ? 'primary' : ''" @click="startSimulation('collaboration')" :loading="simulating && simMode === 'collaboration'">协同模式</el-button>
        </el-button-group>
      </div>
      <div class="chat-container" ref="chatContainer">
        <div
          v-for="(msg, i) in chatMessages"
          :key="i"
          class="chat-bubble"
          :class="[msg.role, { 'debate-msg': msg.debate }]"
        >
          <div class="bubble-sender">
            <el-tag :color="msg.color" size="small" effect="dark">{{ msg.sender }}</el-tag>
            <span class="bubble-time">{{ msg.time }}</span>
          </div>
          <div class="bubble-text">{{ msg.text }}</div>
          <div v-if="msg.confidence" class="bubble-confidence">
            置信度：{{ msg.confidence }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'

const agents = ref([
  { id: 1, name: '爆炸预警Agent', role: '负责监测和分析潜在爆炸风险事件', color: '#f56c6c', icon: 'Warning', models: 'Qwen3-32B-LoRA', knowledgeBase: 'Faiss-爆炸案例库', tools: '数据查询,地图服务' },
  { id: 2, name: '有害物质泄露Agent', role: '负责监测化工泄露及环境污染事件', color: '#e6a23c', icon: 'WarnTriangleFilled', models: 'Qwen3-32B-LoRA', knowledgeBase: 'Faiss-化工安全库', tools: '数据查询,地图服务,通知推送' },
  { id: 3, name: '重大疾病传播Agent', role: '负责监测传染病及公共卫生事件', color: '#409eff', icon: 'FirstAidKit', models: 'Qwen3-14B', knowledgeBase: 'Faiss-公共卫生库', tools: '数据查询,通知推送' }
])

const selectedAgent = ref(agents.value[1])
const selectedBindings = ref({
  llm: ['Qwen3-32B-LoRA'],
  analysis: ['情感分析模型', 'K-Means聚类', 'LSTM预测'],
  tools: ['数据查询API', '地图服务API', '通知推送API']
})

function selectAgent(agent) {
  selectedAgent.value = agent
}

function saveBinding() {
  ElMessage.success(`${selectedAgent.value?.name} 工具绑定配置已保存`)
}

const workflowNodes = ['数据过滤', '特征提取', '情感分析', '序列预测', '多Agent协商', '生成预警']
const wfIcons = ['Filter', 'DataAnalysis', 'TrendCharts', 'Timer', 'Connection', 'Bell']
const wfActiveStep = ref(0)

const chatMessages = ref([])
const chatContainer = ref(null)
const simulating = ref(false)
const simMode = ref('')

const divisionMessages = [
  { sender: '主控Agent', color: '#a855f7', text: '收到有害物质泄露监测数据，某化工园区苯浓度检测值超过安全阈值3倍。现在启动分工协作模式，将任务拆解为4个子任务并分配给各子Agent。', role: 'system' },
  { sender: '主控Agent', color: '#a855f7', text: '【任务分配】1）泄露检测Agent：负责浓度趋势分析与扩散范围推算；2）情感分析Agent：负责舆情监测与民众情绪分析；3）序列预测Agent：负责未来趋势预测与风险评估；4）聚类分析Agent：负责历史相似事件匹配与处置方案推荐。各Agent独立完成后向我汇报。', role: 'system' },
  { sender: '泄露检测Agent', color: '#e6a23c', text: '【子任务1完成】近7天苯浓度监测数据呈持续上升趋势，从0.8倍阈值逐步攀升至3.2倍。当前风向东南风3级，推算扩散范围约800米，涉及2个居民区和1所学校，约12,000人。初步判定严重等级为二级。', role: 'agent' },
  { sender: '情感分析Agent', color: '#a855f7', text: '【子任务2完成】对园区周边社交媒体舆情进行实时分析，过去2小时内负面情绪指数从0.18急剧上升至0.67。关键词"刺鼻气味""头晕""担心泄露"出现频次突增427%。民众恐慌情绪正在快速蔓延，需及时发布权威信息。', role: 'agent' },
  { sender: '序列预测Agent', color: '#67c23a', text: '【子任务3完成】基于LSTM模型预测，若当前趋势持续，未来6小时内苯浓度可能进一步上升至4.5倍阈值。结合气象扩散模型，影响范围可能扩大至1,200米。模型预测置信度89%，建议将严重等级调整为一级。', role: 'agent' },
  { sender: '聚类分析Agent', color: '#409eff', text: '【子任务4完成】匹配到3起历史相似事件：2024年浙江某园区苯泄露、2023年山东某化工厂甲苯泄露、2022年广东某仓储区溶剂泄露。推荐参考2024年浙江案例的处置方案：立即疏散+源头封堵+环境监测+信息发布。', role: 'agent' },
  { sender: '主控Agent', color: '#a855f7', text: '各Agent子任务已全部完成。现在汇总分析结果：浓度趋势持续上升，预测未来6小时将恶化至4.5倍阈值；舆情已出现恐慌蔓延；历史相似案例支持立即处置。综合各Agent独立分析结果，我判定将事件升级为一级预警。', role: 'system' },
  { sender: '主控Agent', color: '#a855f7', text: '【预警结论】事件：XX化工园区苯泄漏预警｜严重等级：一级｜影响范围：约800米半径，涉及约12,000人｜建议措施：1）立即疏散受影响区域居民；2）封锁泄漏源并启动应急预案；3）通知市应急管理局、环保局、卫健委；4）通过官方渠道发布预警信息，避免谣言传播。综合置信度：91.3%', role: 'conclusion', confidence: '91.3%' }
]

const debateMessages = [
  { sender: '主控Agent', color: '#a855f7', text: '收到有害物质泄露监测数据，某化工园区苯浓度检测值超过安全阈值3倍。现将任务拆解分发给各子Agent进行协同分析。', role: 'system' },
  { sender: '泄露检测Agent', color: '#e6a23c', text: '经分析，该园区近7天苯浓度监测数据呈持续上升趋势，从0.8倍阈值逐步攀升至3.2倍。结合气象数据，当前风向为东南风3级，推算扩散范围约800米，涉及2个居民区和1所学校。初步判定严重等级为二级。', role: 'agent' },
  { sender: '情感分析Agent', color: '#a855f7', text: '对园区周边社交媒体舆情进行实时分析，过去2小时内负面情绪指数从0.18急剧上升至0.67，关键词"刺鼻气味""头晕""担心泄露"出现频次突增427%。民众恐慌情绪正在快速蔓延。', role: 'agent' },
  { sender: '序列预测Agent', color: '#67c23a', text: '基于历史类似事件数据训练LSTM模型预测，若当前趋势持续，未来6小时内苯浓度可能进一步上升至4.5倍阈值，建议将事件严重等级调整为一级。', role: 'agent' },
  { sender: '泄露检测Agent', color: '#e6a23c', text: '我认为应维持二级预警。当前浓度虽然超3倍但增速已放缓，且企业反馈正在排查泄漏源。过早升级为一级可能造成不必要的公众恐慌和经济损失。', role: 'debate', debate: true },
  { sender: '序列预测Agent', color: '#67c23a', text: '不同意。模型预测置信度为89%，历史数据表明此类趋势中70%的案例在6小时内会恶化。且情感Agent已确认民众恐慌蔓延，等待只会增加舆论压力。遵循"预防为主"原则，应提前升级。', role: 'debate', debate: true, confidence: '89%' },
  { sender: '情感分析Agent', color: '#a855f7', text: '我支持升级为一级。舆情数据显示恐慌情绪正在加速蔓延，若事态恶化后我们再升级，公信力将严重受损。提前预警即使误判，代价远小于延迟预警。', role: 'debate', debate: true, confidence: '92%' },
  { sender: '主控Agent', color: '#a855f7', text: '经多Agent辩论审议，综合各方证据：1）浓度持续上升趋势明确；2）模型预测高风险；3）舆情指数飙升。我采纳序列预测Agent和情感分析Agent的建议，将事件升级为一级预警。现在向主控系统发送预警指令。', role: 'system' },
  { sender: '主控Agent', color: '#a855f7', text: '【预警结论】事件：XX化工园区苯泄漏预警｜严重等级：一级｜影响范围：约800米半径，涉及约12,000人｜建议措施：1）立即疏散受影响区域居民；2）封锁泄漏源并启动应急预案；3）通知市应急管理局、环保局、卫健委；4）通过官方渠道发布预警信息，避免谣言传播。综合置信度：91.3%', role: 'conclusion', confidence: '91.3%' }
]

const collaborationMessages = [
  { sender: '主控Agent', color: '#a855f7', text: '收到有害物质泄露监测数据，某化工园区苯浓度检测值超过安全阈值3倍。启动协同分析模式，各Agent依次对上一轮分析结果进行补充和深化，形成链式协同推理。', role: 'system' },
  { sender: '泄露检测Agent', color: '#e6a23c', text: '【第一轮·基础分析】近7天苯浓度监测数据呈持续上升趋势，从0.8倍阈值逐步攀升至3.2倍。当前风向东南风3级，推算扩散范围约800米，涉及2个居民区和1所学校。初步判定严重等级为二级。请情感分析Agent基于此数据补充舆情维度。', role: 'agent' },
  { sender: '情感分析Agent', color: '#a855f7', text: '【第二轮·舆情补充】赞同泄露检测Agent的初步判断，并补充舆情维度：过去2小时内负面情绪指数从0.18急剧上升至0.67，"刺鼻气味""头晕"等关键词频次突增427%。民众恐慌正在蔓延，建议在泄露检测Agent的处置方案中增加舆情管控措施。请序列预测Agent进一步做趋势推演。', role: 'agent' },
  { sender: '序列预测Agent', color: '#67c23a', text: '【第三轮·趋势深化】认同前两轮分析，并补充预测数据：LSTM模型预测未来6小时浓度可能升至4.5倍阈值，影响范围可能扩大至1,200米。建议将严重等级从二级调整为一级，并扩大疏散范围。请聚类分析Agent匹配历史案例提供处置参考。', role: 'agent' },
  { sender: '聚类分析Agent', color: '#409eff', text: '【第四轮·案例支撑】匹配到2024年浙江某园区苯泄露案例（高度相似），该案例处置方案为：立即疏散+源头封堵+环境监测+信息发布，处置耗时4.2小时，成功将影响范围控制在800米内。我认同序列预测Agent的一级预警建议，并推荐采用该案例的处置方案框架。', role: 'agent' },
  { sender: '泄露检测Agent', color: '#e6a23c', text: '【第五轮·方案优化】综合聚类分析Agent提供的案例框架，我优化处置方案：疏散范围从800米扩展至1,000米作为安全冗余，同时建议在泄漏源周边设置3个临时监测点，每15分钟报告一次浓度数据。完全同意升级为一级预警。', role: 'agent' },
  { sender: '主控Agent', color: '#a855f7', text: '经过五轮协同分析，各Agent在链式推理中逐步深化和补充，最终达成一致共识：事件严重等级升级为一级。该协同过程无需辩论即自然收敛到最优方案，充分体现了多Agent协同增强效应。', role: 'system' },
  { sender: '主控Agent', color: '#a855f7', text: '【预警结论】事件：XX化工园区苯泄漏预警｜严重等级：一级｜影响范围：约1,000米半径，涉及约15,000人｜建议措施：1）立即疏散受影响区域居民；2）封锁泄漏源，设置3个临时监测点；3）通知市应急管理局、环保局、卫健委；4）参考2024年浙江案例框架执行处置；5）通过官方渠道发布预警信息。综合置信度：93.6%', role: 'conclusion', confidence: '93.6%' }
]

const modeMessages = {
  division: divisionMessages,
  debate: debateMessages,
  collaboration: collaborationMessages
}

function startSimulation(mode) {
  simMode.value = mode
  chatMessages.value = []
  wfActiveStep.value = 0
  simulating.value = true

  const messages = modeMessages[mode]
  let msgIndex = 0

  const stepMap = {
    '收到有害物质泄露监测数据': 0,
    '任务分配': 0,
    '经分析': 1,
    '子任务1完成': 1,
    '对园区周边社交媒体舆情': 2,
    '子任务2完成': 2,
    '基于历史类似事件数据': 3,
    '子任务3完成': 3,
    '子任务4完成': 4,
    '多Agent辩论审议': 4,
    '各Agent子任务已全部完成': 4,
    '经过五轮协同分析': 4,
    '预警结论': 5
  }

  function addNext() {
    if (msgIndex >= messages.length) {
      simulating.value = false
      wfActiveStep.value = 5
      return
    }
    const msg = { ...messages[msgIndex], time: new Date().toLocaleTimeString('zh-CN') }
    chatMessages.value.push(msg)

    for (const [key, step] of Object.entries(stepMap)) {
      if (msg.text.includes(key)) {
        wfActiveStep.value = step
        break
      }
    }

    msgIndex++
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
    setTimeout(addNext, 1200 + Math.random() * 800)
  }

  setTimeout(addNext, 500)
}
</script>

<style scoped>
.agent-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wb-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
}

.wb-center {
  padding-top: 36px;
}

.agent-card {
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.agent-card:hover, .agent-card.active {
  border-color: var(--accent-blue);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.agent-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-name { font-size: 15px; font-weight: 600; }

.agent-role { font-size: 12px; color: var(--text-secondary); }

.agent-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-secondary); }

.tool-bind-section, .workflow-section {
  padding: 16px;
}
.workflow-section {
  margin-top: 12px;
}

.bind-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bind-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }

.workflow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  padding: 16px 0;
}

.wf-node {
  display: flex;
  align-items: center;
}

.wf-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.wf-node.active .wf-icon {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
}

.wf-label { font-size: 11px; color: var(--text-secondary); margin: 0 4px; white-space: nowrap; }

.wf-arrow { color: var(--text-secondary); margin: 0 2px; font-size: 14px; }

.chat-section { padding: 16px; }

.chat-container {
  height: 360px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  position: relative;
}

.chat-bubble.agent { background: rgba(64, 158, 255, 0.1); border: 1px solid rgba(64, 158, 255, 0.3); align-self: flex-start; }

.chat-bubble.system { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); align-self: center; }

.chat-bubble.debate { background: rgba(230, 162, 60, 0.1); border: 1px solid rgba(230, 162, 60, 0.4); align-self: flex-start; }

.chat-bubble.conclusion { background: rgba(103, 194, 58, 0.1); border: 1px solid rgba(103, 194, 58, 0.4); align-self: stretch; }

.debate-msg { border-left: 3px solid var(--accent-orange); }

.bubble-sender { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

.bubble-time { font-size: 11px; color: var(--text-secondary); font-family: 'Courier New', monospace; }

.bubble-text { font-size: 13px; line-height: 1.7; color: var(--text-primary); }

.bubble-confidence { margin-top: 6px; font-size: 12px; color: var(--accent-orange); font-weight: 600; }
</style>