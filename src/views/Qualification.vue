<template>
  <div class="qualification">
    <div class="page-title">资质与项目经验</div>

    <!-- <div class="section-title">企业资质</div>
    <div class="cert-grid">
      <div class="data-card cert-card" v-for="cert in certificates" :key="cert.name">
        <div class="cert-icon">
          <el-icon :size="40" :color="cert.color"><component :is="cert.icon" /></el-icon>
        </div>
        <div class="cert-name">{{ cert.name }}</div>
        <div class="cert-number">{{ cert.number }}</div>
        <div class="cert-date">{{ cert.date }}</div>
      </div>
    </div> -->

    <div class="section-title">平台应用成效</div>
    <div class="effect-cards">
      <div class="data-card effect-card">
        <div class="effect-value">+34.2%</div>
        <div class="effect-label">领域微调后问答准确率提升</div>
        <div class="effect-desc">Qwen3-32B通过LoRA微调后，在预警领域问答测试集上准确率从58.5%提升至92.7%</div>
      </div>
      <div class="data-card effect-card">
        <div class="effect-value">8.7x</div>
        <div class="effect-label">vLLM部署推理速度提升</div>
        <div class="effect-desc">采用vLLM框架部署后，推理吞吐量达1247 tokens/s，较原生推理提升8.7倍</div>
      </div>
      <div class="data-card effect-card">
        <div class="effect-value">17起</div>
        <div class="effect-label">成功预警重大危害事件</div>
        <div class="effect-desc">平台上线以来已成功预警17起潜在重大危害事件，平均提前8.7小时发出预警</div>
      </div>
      <div class="data-card effect-card">
        <div class="effect-value">2项</div>
        <div class="effect-label">发明专利产出</div>
        <div class="effect-desc">基于平台核心技术已申报发明专利2项，其中已授权2项</div>
      </div>
      <div class="data-card effect-card">
        <div class="effect-value">3项</div>
        <div class="effect-label">软件著作权登记</div>
        <div class="effect-desc">平台各子系统及核心算法模块累计获得3项软件著作权登记</div>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px">垂直领域模型训练方法论</div>
    <div class="methodology">
      <div class="data-card method-text">
        <p>本平台基于"数据驱动+知识引导"的双轮驱动策略，构建了完整的垂直领域模型训练方法体系：</p>
        <ol>
          <li><strong>数据采集与清洗：</strong>通过多源异构数据采集框架，从社交媒体、新闻网站、政府公告、学术数据库等渠道获取原始数据，应用关键字黑名单过滤和余弦相似度去重算法，确保训练数据的高质量和多样性。</li>
          <li><strong>领域标注与增强：</strong>构建领域专家标注团队，对12,000+条预警相关数据进行精细标注，并通过数据增强技术（同义替换、回译、对抗样本生成）扩充训练集至45,000+条。</li>
          <li><strong>基座模型选型：</strong>基于Qwen3-32B基座模型，采用LoRA（Low-Rank Adaptation）高效微调技术，在rank=16、alpha=32的配置下，仅训练0.3%的参数量即可实现显著的领域适应。</li>
          <li><strong>多模态融合训练：</strong>同时训练文本情感分析模型（BERT-based）、时序预测模型（LSTM）和聚类分析模型（K-Means），实现多模型协同互补。</li>
          <li><strong>评估与迭代：</strong>建立多维度评估体系，包括BLEU、ROUGE-L、领域准确率、推理延迟等指标，通过A/B测试和专家评审持续迭代优化模型。</li>
        </ol>
      </div>
      <div class="data-card method-flow">
        <div class="flow-steps">
          <div class="flow-step" v-for="(step, i) in flowSteps" :key="i">
            <div class="flow-icon">
              <el-icon :size="22"><component :is="step.icon" /></el-icon>
            </div>
            <div class="flow-label">{{ step.label }}</div>
            <div v-if="i < flowSteps.length - 1" class="flow-line">→</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const certificates = [
  { name: '武器装备科研生产单位保密资格', icon: 'Lock', color: '#409eff', number: 'GXB-2024-0892', date: '有效期至2029年3月' },
  { name: '装备承制单位资格认证', icon: 'Medal', color: '#67c23a', number: 'CZB-2023-0561', date: '有效期至2028年6月' },
  { name: 'GJB 9001C质量管理体系认证', icon: 'Checked', color: '#e6a23c', number: 'QM-2024-1023', date: '有效期至2027年9月' },
  { name: '高新技术企业认定', icon: 'Star', color: '#a855f7', number: 'GR202432001587', date: '有效期至2027年12月' }
]

const flowSteps = [
  { icon: 'Collection', label: '数据采集\n与清洗' },
  { icon: 'Edit', label: '领域标注\n与增强' },
  { icon: 'Cpu', label: '基座模型\n选型' },
  { icon: 'Connection', label: 'LoRA高效\n微调训练' },
  { icon: 'DataAnalysis', label: '多模态\n融合训练' },
  { icon: 'TrendCharts', label: '多维度\n评估迭代' },
  { icon: 'Finished', label: '模型部署\n与上线' }
]
</script>

<style scoped>
.qualification {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.cert-card {
  text-align: center;
  padding: 24px 16px;
}

.cert-icon {
  margin-bottom: 12px;
}

.cert-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.cert-number {
  font-size: 12px;
  color: var(--accent-blue);
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.cert-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.effect-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.effect-card {
  text-align: center;
  padding: 24px 16px;
}

.effect-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--accent-blue);
  margin-bottom: 8px;
}

.effect-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.effect-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.methodology {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.method-text {
  padding: 20px;
}

.method-text p {
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 12px;
}

.method-text ol {
  padding-left: 1.5em;
  font-size: 13px;
  line-height: 1.8;
}

.method-text li {
  margin-bottom: 8px;
}

.method-flow {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.flow-step {
  display: flex;
  align-items: center;
}

.flow-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #132744, #1e3a5f);
  border: 2px solid var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-blue);
}

.flow-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 4px;
  white-space: pre-line;
  line-height: 1.4;
}

.flow-line {
  color: var(--accent-blue);
  font-size: 20px;
  font-weight: bold;
}
</style>