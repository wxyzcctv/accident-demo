<template>
  <div class="model-factory">
    <div class="page-title">模型工厂</div>

    <div class="model-grid">
      <div class="data-card model-card" v-for="model in models" :key="model.name" @click="openDetail(model)">
        <div class="model-icon">
          <el-icon :size="36" :color="model.color"><Cpu /></el-icon>
        </div>
        <div class="model-name">{{ model.name }}</div>
        <div class="model-desc">{{ model.desc }}</div>
        <div class="model-tags">
          <el-tag v-for="tag in model.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
        </div>
        <div class="model-stats">
          <div class="model-stat">
            <span class="ms-label">准确率</span>
            <span class="ms-value">{{ model.accuracy }}%</span>
          </div>
          <div class="model-stat">
            <span class="ms-label">召回率</span>
            <span class="ms-value">{{ model.recall }}%</span>
          </div>
        </div>
        <div class="model-status" :class="model.status === '运行中' ? 'online' : 'offline'">
          <span class="status-dot"></span>
          {{ model.status }}
        </div>
      </div>
    </div>

    <div class="action-bar">
      <el-button type="primary" size="large" @click="showTrainWizard = true">
        <el-icon><Plus /></el-icon>新增模型训练
      </el-button>
    </div>

    <el-dialog v-model="detailVisible" :title="currentModel?.name" width="700px" top="5vh">
      <template v-if="currentModel?.type === 'llm'">
        <el-tabs model-value="lora" @tab-change="onTabChange">
          <el-tab-pane label="LoRA参数配置" name="lora">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="Rank (r)">16</el-descriptions-item>
              <el-descriptions-item label="Alpha">32</el-descriptions-item>
              <el-descriptions-item label="Dropout">0.05</el-descriptions-item>
              <el-descriptions-item label="Target Modules">q_proj, v_proj, k_proj, o_proj</el-descriptions-item>
              <el-descriptions-item label="训练轮数">3 epochs</el-descriptions-item>
              <el-descriptions-item label="学习率">2e-4</el-descriptions-item>
              <el-descriptions-item label="批次大小">4</el-descriptions-item>
              <el-descriptions-item label="梯度累积">8 steps</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="训练Loss曲线" name="loss">
            <div ref="lossChart" class="chart-inline"></div>
          </el-tab-pane>
          <el-tab-pane label="微调前后对比" name="compare">
            <div class="compare-section">
              <div class="compare-item before">
                <div class="compare-title">微调前（通用模型）</div>
                <div class="compare-content">
                  <p><strong>问：</strong>某化工园区检测到苯浓度超标3倍，应如何评估风险？</p>
                  <p><strong>答：</strong>苯是一种有毒化学物质，浓度超标可能对人体健康造成危害。建议参考国家职业卫生标准GBZ 2.1-2019进行评估。</p>
                </div>
              </div>
              <div class="compare-item after">
                <div class="compare-title">微调后（预警领域模型）</div>
                <div class="compare-content">
                  <p><strong>问：</strong>某化工园区检测到苯浓度超标3倍，应如何评估风险？</p>
                  <p><strong>答：</strong>苯浓度超标3倍属于重大危害事件二级预警。建议：1）立即启动泄漏源排查，检查储罐阀门及管道密封性；2）根据风速风向计算扩散范围，划定500m紧急疏散区；3）通知当地应急管理局和环保部门；4）持续监测浓度变化趋势，若持续上升超过5倍，升级为一级预警。根据《危险化学品安全管理条例》第XX条，应在1小时内上报。</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="vLLM部署状态" name="vllm">
            <div class="vllm-dashboard">
              <div class="vllm-card">
                <div class="vllm-label">GPU 占用率</div>
                <div class="vllm-value">78.5%</div>
                <el-progress :percentage="78.5" color="#409eff" />
              </div>
              <div class="vllm-card">
                <div class="vllm-label">吞吐量</div>
                <div class="vllm-value">1,247 tokens/s</div>
              </div>
              <div class="vllm-card">
                <div class="vllm-label">平均延迟</div>
                <div class="vllm-value">87 ms</div>
              </div>
              <div class="vllm-card">
                <div class="vllm-label">显存使用</div>
                <div class="vllm-value">18.2 / 24 GB</div>
                <el-progress :percentage="75.8" color="#e6a23c" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="准确率">{{ currentModel?.accuracy }}%</el-descriptions-item>
          <el-descriptions-item label="召回率">{{ currentModel?.recall }}%</el-descriptions-item>
          <el-descriptions-item label="F1 Score">{{ Math.floor((parseFloat(currentModel?.accuracy) + parseFloat(currentModel?.recall)) / 2) }}%</el-descriptions-item>
          <el-descriptions-item label="推理延迟">{{ Math.floor(Math.random() * 50 + 30) }}ms</el-descriptions-item>
          <el-descriptions-item label="模型大小">{{ currentModel?.type === 'clustering' ? '128MB' : '256MB' }}</el-descriptions-item>
          <el-descriptions-item label="训练数据量">12,000条</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <el-dialog v-model="showTrainWizard" title="新增模型训练向导" width="650px" top="3vh">
      <el-steps :active="trainStep" align-center finish-status="success" style="margin-bottom: 30px">
        <el-step title="上传数据集" />
        <el-step title="选择基座模型" />
        <el-step title="配置LoRA参数" />
        <el-step title="开始训练" />
        <el-step title="评估结果" />
      </el-steps>

      <div v-if="trainStep === 0" class="wizard-content">
        <el-upload drag :auto-upload="false">
          <el-icon :size="40"><UploadFilled /></el-icon>
          <div class="el-upload__text">将训练数据文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JSON/CSV/Excel 格式，单文件不超过 500MB</div>
          </template>
        </el-upload>
        <div style="margin-top:12px;color:var(--text-secondary);font-size:13px">
          模拟已选择文件：warning_event_train_data_2026Q2.json (128,456条记录)
        </div>
      </div>
      <div v-else-if="trainStep === 1" class="wizard-content">
        <el-radio-group v-model="selectedBaseModel">
          <el-radio label="Qwen3-32B" size="large" border style="width:100%;margin-bottom:12px">
            Qwen3-32B — 通义千问3代32B参数基座模型
          </el-radio>
          <el-radio label="Qwen3-14B" size="large" border style="width:100%;margin-bottom:12px">
            Qwen3-14B — 更大参数量，更高精度
          </el-radio>
          <el-radio label="Llama3-8B" size="large" border style="width:100%">
            Llama3-8B — Meta开源基座模型
          </el-radio>
        </el-radio-group>
      </div>
      <div v-else-if="trainStep === 2" class="wizard-content">
        <el-form label-width="140px">
          <el-form-item label="Rank (r)">
            <el-input-number v-model="loraConfig.rank" :min="4" :max="64" :step="4" />
          </el-form-item>
          <el-form-item label="Alpha">
            <el-input-number v-model="loraConfig.alpha" :min="8" :max="128" :step="8" />
          </el-form-item>
          <el-form-item label="Dropout">
            <el-slider v-model="loraConfig.dropout" :min="0" :max="0.3" :step="0.05" show-input style="width:300px" />
          </el-form-item>
          <el-form-item label="Target Modules">
            <el-checkbox-group v-model="loraConfig.targetModules">
              <el-checkbox label="q_proj" border size="small" />
              <el-checkbox label="k_proj" border size="small" />
              <el-checkbox label="v_proj" border size="small" />
              <el-checkbox label="o_proj" border size="small" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="学习率">
            <el-input-number v-model="loraConfig.lr" :min="1e-5" :max="1e-3" :precision="5" :step="1e-5" />
          </el-form-item>
        </el-form>
      </div>
      <div v-else-if="trainStep === 3" class="wizard-content">
        <div style="text-align:center;padding:40px 0">
          <div style="font-size:16px;margin-bottom:20px">{{ trainingText }}</div>
          <el-progress :percentage="trainProgress" :status="trainProgress === 100 ? 'success' : ''" :stroke-width="20" />
          <div style="margin-top:16px;color:var(--text-secondary);font-size:13px">
            已训练轮次：{{ Math.floor(trainProgress / 33) + 1 }} / 3
          </div>
        </div>
      </div>
      <div v-else-if="trainStep === 4" class="wizard-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="预警准确率">92.7%</el-descriptions-item>
          <el-descriptions-item label="召回率">89.3%</el-descriptions-item>
          <el-descriptions-item label="F1 Score">91.0%</el-descriptions-item>
          <el-descriptions-item label="领域问答提升">+34.2%</el-descriptions-item>
          <el-descriptions-item label="训练Loss">0.0234</el-descriptions-item>
          <el-descriptions-item label="验证Loss">0.0312</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="showTrainWizard = false">取消</el-button>
        <el-button v-if="trainStep > 0" @click="trainStep--">上一步</el-button>
        <el-button
          v-if="trainStep < 4"
          type="primary"
          @click="nextStep"
        >{{ trainStep === 3 ? '开始训练' : '下一步' }}</el-button>
        <el-button v-if="trainStep === 4" type="success" @click="showTrainWizard = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const models = ref([
  { name: 'Qwen3-32B-LoRA', desc: '基于Qwen3-32B微调的预警领域大语言模型', color: '#409eff', tags: ['大语言模型', 'LoRA微调'], accuracy: '92.7', recall: '89.3', type: 'llm', status: '运行中' },
  { name: '情感分析模型', desc: 'BERT-based多标签情感分类模型', color: '#a855f7', tags: ['情感分类', 'BERT'], accuracy: '90.5', recall: '87.8', type: 'sentiment', status: '运行中' },
  { name: 'LSTM序列预测', desc: '基于LSTM的事件频次时序预测模型', color: '#67c23a', tags: ['时序预测', 'LSTM'], accuracy: '88.2', recall: '85.1', type: 'forecast', status: '运行中' },
  { name: 'K-Means聚类', desc: '多维度事件特征聚类分析模型', color: '#e6a23c', tags: ['聚类分析', '无监督'], accuracy: '86.5', recall: '82.4', type: 'clustering', status: '运行中' }
])

const detailVisible = ref(false)
const currentModel = ref(null)
const lossChart = ref(null)
let lossInstance = null

function onTabChange(tabName) {
  if (tabName === 'loss' && currentModel.value?.type === 'llm') {
    setTimeout(() => {
      initLossChart()
    }, 100)
  }
}

function initLossChart() {
  if (!lossChart.value || lossInstance) return
  lossInstance = echarts.init(lossChart.value)
  const steps = Array.from({ length: 30 }, (_, i) => i * 50)
  const trainLoss = steps.map((s, i) => Math.max(0.05, 1.5 * Math.exp(-i * 0.12) + 0.05 + Math.random() * 0.1))
  const valLoss = steps.map((s, i) => Math.max(0.08, 1.5 * Math.exp(-i * 0.10) + 0.08 + Math.random() * 0.15))
  lossInstance.setOption({
    grid: { top: 10, right: 20, bottom: 30, left: 45 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: steps, name: 'Step', axisLabel: { color: '#8899bb' } },
    yAxis: { type: 'value', name: 'Loss', axisLabel: { color: '#8899bb' } },
    series: [
      { name: '训练Loss', type: 'line', data: trainLoss, smooth: true, lineStyle: { color: '#409eff' }, symbol: 'none' },
      { name: '验证Loss', type: 'line', data: valLoss, smooth: true, lineStyle: { color: '#e6a23c' }, symbol: 'none' }
    ],
    legend: { textStyle: { color: '#8899bb' }, bottom: 0 }
  })
}

function openDetail(model) {
  currentModel.value = model
  detailVisible.value = true
  lossInstance?.dispose()
  lossInstance = null
}

const showTrainWizard = ref(false)
const trainStep = ref(0)
const trainProgress = ref(0)
const trainingText = ref('准备训练...')
const selectedBaseModel = ref('Qwen3-32B')
const loraConfig = ref({ rank: 16, alpha: 32, dropout: 0.05, targetModules: ['q_proj', 'v_proj'], lr: 0.0002 })
let trainTimer = null

async function nextStep() {
  if (trainStep.value === 3) {
    trainProgress.value = 0
    trainingText.value = '正在加载训练数据...'
    trainTimer = setInterval(() => {
      trainProgress.value += Math.floor(Math.random() * 8) + 3
      if (trainProgress.value >= 100) {
        trainProgress.value = 100
        trainingText.value = '训练完成！'
        clearInterval(trainTimer)
        ElMessage.success('模型训练完成！')
      } else if (trainProgress.value > 60) {
        trainingText.value = `训练中... Epoch ${Math.floor(trainProgress.value / 33) + 1}/3`
      } else {
        trainingText.value = '正在训练...'
      }
    }, 400)
  }
  if (trainStep.value < 4) {
    trainStep.value++
  }
}

onUnmounted(() => {
  lossInstance?.dispose()
  if (trainTimer) clearInterval(trainTimer)
})
</script>

<style scoped>
.model-factory {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.model-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.model-card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.2);
}

.model-icon { margin-bottom: 12px; }

.model-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; }

.model-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; }

.model-tags { display: flex; gap: 6px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap; }

.model-stats { display: flex; justify-content: center; gap: 24px; margin-bottom: 10px; }

.model-stat { text-align: center; }

.ms-label { font-size: 11px; color: var(--text-secondary); display: block; }

.ms-value { font-size: 18px; font-weight: 700; color: var(--accent-blue); }

.model-status { font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; }

.model-status.online { color: var(--accent-green); }

.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

.model-status.online .status-dot { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }

.chart-inline { height: 280px; }

.compare-section { display: flex; gap: 16px; }

.compare-item { flex: 1; padding: 16px; border-radius: 8px; }

.compare-item.before { background: rgba(245, 108, 108, 0.1); border: 1px solid rgba(245, 108, 108, 0.3); }

.compare-item.after { background: rgba(103, 194, 58, 0.1); border: 1px solid rgba(103, 194, 58, 0.3); }

.compare-title { font-weight: 600; margin-bottom: 10px; font-size: 13px; }

.compare-content p { font-size: 13px; margin-bottom: 8px; line-height: 1.6; }

.vllm-dashboard { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.vllm-card { padding: 16px; background: var(--bg-secondary); border-radius: 8px; }

.vllm-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }

.vllm-value { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: var(--accent-blue); }

.action-bar { display: flex; justify-content: center; }

.wizard-content { min-height: 200px; }
</style>