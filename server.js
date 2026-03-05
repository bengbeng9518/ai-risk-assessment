import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

const QWEN_API_KEY = 'sk-d7ac5c693dc14eff8ec64bff80f146ab';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { assessmentResult } = req.body;
    
    if (!assessmentResult) {
      return res.status(400).json({ error: 'Missing assessment result' });
    }

    const { career, riskScore, riskLevel, breakdown, isPersonalized, personalizedFactors } = assessmentResult;

    let companyInfo = '';
    if (isPersonalized && personalizedFactors) {
      const companyTypes = {
        'tech_giant': '科技巨头（AI应用领先）',
        'traditional_tech': '传统科技公司',
        'traditional_industry': '传统行业',
        'startup': '创业公司',
        'government': '政府/公共部门',
        'education': '教育机构',
        'medical': '医疗机构',
        'finance': '金融机构'
      };
      const jobLevels = {
        'intern': '实习生/初级',
        'mid': '中级',
        'senior': '高级/资深',
        'lead': '团队负责人',
        'manager': '经理/总监',
        'executive': '高管'
      };
      
      const companyType = companyTypes[personalizedFactors.companyType] || '未指定';
      const jobLevel = jobLevels[personalizedFactors.jobLevel] || '中级';
      
      companyInfo = `
用户个性化信息：
- 公司类型：${companyType}
- 职级：${jobLevel}
- AI接触程度：${personalizedFactors.aiExposure || 50}%
- 创造性要求：${personalizedFactors.creativeRequirement || 50}%
- 人际互动需求：${personalizedFactors.humanInteraction || 50}%
- 决策复杂度：${personalizedFactors.decisionMaking || 50}%
${personalizedFactors.companyDescription ? `- 公司描述：${personalizedFactors.companyDescription}` : ''}
${personalizedFactors.jobDescription ? `- 岗位描述：${personalizedFactors.jobDescription}` : ''}
`;
    }

    const prompt = `你是一位资深的职业规划专家和AI技术顾问。请基于以下职业评估结果，提供深度分析：

职业名称：${career}
风险评分：${riskScore}
风险等级：${riskLevel}
各维度得分：
- 任务自动化潜力：${breakdown.automation}分
- 技能复杂度：${breakdown.skillComplexity}分
- 数据可获得性：${breakdown.dataAvailability}分
- 技术成熟度：${breakdown.techMaturity}分
${companyInfo}

请从以下几个方面进行分析，要求用中文回答，每个部分至少100字：
1. **风险解读**：详细解释该职业面临AI替代风险的主要原因
2. **优势分析**：该职业在AI时代仍具有的核心优势
3. **威胁识别**：未来3-5年可能面临的最大威胁
4. **机会发现**：AI技术带来的新机会和发展方向
5. **具体建议**：3-5条可执行的职业发展建议

请用专业、客观、鼓励的语调回答。`;

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
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
      })
    });

    const data = await response.json();
    
    if (data.code) {
      console.error('Qwen API Error:', data);
      return res.status(500).json({ error: data.message || 'AI分析失败' });
    }

    const analysisText = data.output?.choices?.[0]?.message?.content || '';
    
    const analysisResult = parseAIResponse(analysisText);
    
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

function parseAIResponse(text) {
  const sections = {
    riskInterpretation: '',
    advantages: '',
    threats: '',
    opportunities: '',
    recommendations: ''
  };

  const patterns = {
    riskInterpretation: /\*\*风险解读\*\*[:：]([\s\S]*?)(?=\*\*|$)/i,
    advantages: /\*\*优势分析\*\*[:：]([\s\S]*?)(?=\*\*|$)/i,
    threats: /\*\*威胁识别\*\*[:：]([\s\S]*?)(?=\*\*|$)/i,
    opportunities: /\*\*机会发现\*\*[:：]([\s\S]*?)(?=\*\*|$)/i,
    recommendations: /\*\*具体建议\*\*[:：]([\s\S]*?)$/i
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      sections[key] = match[1].trim();
    }
  }

  if (!sections.riskInterpretation && !sections.advantages) {
    return {
      riskInterpretation: text,
      advantages: 'AI分析结果未能正确解析',
      threats: 'AI分析结果未能正确解析',
      opportunities: 'AI分析结果未能正确解析',
      recommendations: 'AI分析结果未能正确解析'
    };
  }

  return sections;
}

app.post('/api/payment/create', async (req, res) => {
  try {
    const { userId, packageId, paymentMethod } = req.body;
    
    const packages = {
      'single': { count: 1, price: 5 },
      'discount': { count: 5, price: 20 },
      'value': { count: 15, price: 50 }
    };
    
    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      return res.status(400).json({ error: 'Invalid package' });
    }
    
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const order = {
      id: orderId,
      userId,
      packageId,
      paymentMethod,
      amount: selectedPackage.price,
      count: selectedPackage.count,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    
    res.json({
      orderId,
      amount: selectedPackage.price,
      paymentUrl: `/api/payment/mock/${orderId}`,
      message: 'Payment created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment/callback', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (status === 'success') {
      order.status = 'success';
      order.updatedAt = new Date().toISOString();
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payment/mock/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).send('Order not found');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>模拟支付</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f2f5;
        }
        .payment-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 100%;
        }
        h1 {
          color: #1890ff;
          margin-bottom: 20px;
        }
        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #ff4d4f;
          margin: 20px 0;
        }
        button {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .success {
          background: #52c41a;
          color: white;
        }
        .cancel {
          background: #f5f5f5;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="payment-container">
        <h1>模拟支付</h1>
        <p>订单号: ${orderId}</p>
        <div class="amount">¥${order.amount}</div>
        <button class="success" onclick="completePayment()">支付成功</button>
        <button class="cancel" onclick="cancelPayment()">取消支付</button>
      </div>
      <script>
        function completePayment() {
          fetch('/api/payment/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: '${orderId}', status: 'success' })
          }).then(() => {
            alert('支付成功！');
            window.opener.postMessage({ type: 'payment-success', orderId: '${orderId}', count: ${order.count} }, '*');
            window.close();
          });
        }
        
        function cancelPayment() {
          alert('支付已取消');
          window.close();
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

const orders = [];

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});