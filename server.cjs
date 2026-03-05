const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const logFile = path.join(__dirname, 'api-log.txt');

function logRequest(data) {
  const timestamp = new Date().toISOString();
  const logEntry = `\n=== ${timestamp} ===\n${JSON.stringify(data, null, 2)}\n`;
  fs.appendFileSync(logFile, logEntry);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    baseUrl: BASE_URL
  });
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { assessmentResult } = req.body;
    
    if (!assessmentResult) {
      return res.status(400).json({ error: 'Missing assessment result' });
    }

    const { career, riskScore, riskLevel, breakdown, isPersonalized, personalizedFactors } = assessmentResult;

    const prompt = `你是一位资深的职业规划专家和AI技术顾问。请基于以下职业评估结果，提供深度分析：
    职业名称：${career}
    风险评分：${riskScore}
    风险等级：${riskLevel}
    各维度得分：
    - 任务自动化潜力：${breakdown?.automation || 0}分
    - 技能复杂度：${breakdown?.skillComplexity || 0}分
    - 数据可获得性：${breakdown?.dataAvailability || 0}分
    - 技术成熟度：${breakdown?.techMaturity || 0}分
    
    请从以下几个方面进行分析，要求用中文回答：
    1. **风险解读**：详细解释该职业面临AI替代风险的主要原因
    2. **优势分析**：该职业在AI时代仍具有的核心优势
    3. **威胁识别**：未来3-5年可能面临的最大威胁
    4. **机会发现**：AI技术带来的新机会和发展方向
    5. **具体建议**：3-5条可执行的职业发展建议`;

    const apiRequest = {
      model: 'qwen3.5-plus-2026-02-15',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一位资深的职业规划专家和AI技术顾问，擅长分析职业发展趋势和AI对职场的影响。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000,
        result_format: 'message'
      }
    };

    logRequest({ type: 'AI_ANALYZE_REQUEST', prompt, apiRequest });

    const qwenKey = 'sk-d7ac5c693dc14eff8ec64bff80f146ab';
    const qwenUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(qwenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequest)
    });

    const data = await response.json();
    
    logRequest({ type: 'AI_ANALYZE_RESPONSE', data });

    if (data.code) {
      console.error('Qwen API Error:', data);
      return res.status(500).json({ error: data.message || 'AI分析失败' });
    }

    const analysisText = data.output?.choices?.[0]?.message?.content || '';
    
    const parseResponse = (text) => {
      const sections = {
        riskInterpretation: '',
        advantages: '',
        threats: '',
        opportunities: '',
        recommendations: ''
      };
      
      const patterns = [
        { key: 'riskInterpretation', pattern: /\*\*风险解读\*\*[:：]?([\s\S]*?)(?=\*\*|$)/i },
        { key: 'advantages', pattern: /\*\*优势分析\*\*[:：]?([\s\S]*?)(?=\*\*|$)/i },
        { key: 'threats', pattern: /\*\*威胁识别\*\*[:：]?([\s\S]*?)(?=\*\*|$)/i },
        { key: 'opportunities', pattern: /\*\*机会发现\*\*[:：]?([\s\S]*?)(?=\*\*|$)/i },
        { key: 'recommendations', pattern: /\*\*具体建议\*\*[:：]?([\s\S]*)/i }
      ];
      
      patterns.forEach(({ key, pattern }) => {
        const match = text.match(pattern);
        if (match) {
          sections[key] = match[1].trim();
        }
      });
      
      if (!sections.riskInterpretation && !sections.advantages) {
        const lines = text.split('\n');
        let currentSection = '';
        lines.forEach(line => {
          if (line.includes('风险解读') || line.includes('1.')) currentSection = 'riskInterpretation';
          else if (line.includes('优势分析') || line.includes('2.')) currentSection = 'advantages';
          else if (line.includes('威胁识别') || line.includes('3.')) currentSection = 'threats';
          else if (line.includes('机会发现') || line.includes('4.')) currentSection = 'opportunities';
          else if (line.includes('具体建议') || line.includes('5.')) currentSection = 'recommendations';
          
          if (currentSection && line.trim() && !line.includes('**')) {
            sections[currentSection] += line.trim() + '\n';
          }
        });
      }
      
      return sections;
    };
    
    const analysisResult = parseResponse(analysisText);
    
    res.json({
      success: true,
      analysis: analysisResult,
      rawResponse: analysisText
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: error.message || 'AI分析失败，请稍后重试' });
  }
});

app.post('/api/payment/create', async (req, res) => {
  const { userId, packageId, count, price } = req.body;
  
  logRequest({ type: 'PAYMENT_CREATE', body: req.body });
  
  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    success: true,
    orderId,
    paymentUrl: `${BASE_URL}/api/payment/mock/${orderId}`
  });
});

app.post('/api/payment/callback', async (req, res) => {
  logRequest({ type: 'PAYMENT_CALLBACK', body: req.body });
  res.json({ success: true });
});

app.get('/api/payment/mock/:orderId', (req, res) => {
  res.send(`
    <html>
      <head><title>模拟支付</title></head>
      <body>
        <h1>模拟支付页面</h1>
        <p>订单号: ${req.params.orderId}</p>
        <p>状态: 已支付</p>
        <button onclick="window.close()">关闭此页面</button>
        <script>setTimeout(() => window.close(), 2000)</script>
      </body>
    </html>
  `);
});

app.get('/api/orders/:userId', (req, res) => {
  res.json({ orders: [] });
});

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

app.listen(PORT, HOST, () => {
  console.log(`========================================`);
  console.log(`AI替代风险评估系统`);
  console.log(`========================================`);
  console.log(`本地访问: http://localhost:${PORT}`);
  console.log(`局域网访问: http://${localIP}:${PORT}`);
  if (BASE_URL !== `http://localhost:${PORT}`) {
    console.log(`外部访问: ${BASE_URL}`);
  }
  console.log(`========================================`);
});

console.log(`Server config: PORT=${PORT}, HOST=${HOST}, BASE_URL=${BASE_URL}`);