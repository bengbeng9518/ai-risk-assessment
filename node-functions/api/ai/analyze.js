export const onRequestPost = async ({ request }) => {
  console.log('POST request received');
  
  try {
    let body;
    try {
      body = await request.json();
      console.log('Body parsed:', JSON.stringify(body));
    } catch (e) {
      console.error('Parse error:', e.message);
      return new Response(JSON.stringify({ error: 'Invalid JSON: ' + e.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const assessmentResult = body?.assessmentResult;
    
    if (!assessmentResult) {
      console.log('Missing assessmentResult');
      return new Response(JSON.stringify({ error: 'Missing assessment result' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { career, riskScore, riskLevel, breakdown } = assessmentResult;
    console.log('Processing:', career);

    const prompt = `你是一位资深的职业规划专家。请基于以下职业评估结果，提供深度分析：
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
      model: 'qwen-plus',
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

    const qwenKey = 'sk-d7ac5c693dc14eff8ec64bff80f146ab';
    const qwenUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    console.log('Calling Qwen API...');
    
    const response = await fetch(qwenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequest)
    });

    console.log('Qwen response status:', response.status);
    
    const data = await response.json();
    console.log('Qwen response:', JSON.stringify(data).substring(0, 200));

    if (data.code) {
      console.error('Qwen API Error:', data);
      return new Response(JSON.stringify({ error: data.message || 'AI分析失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const analysisText = data.output?.choices?.[0]?.message?.content || '';
    
    console.log('Analysis complete');
    
    return new Response(JSON.stringify({
      success: true,
      analysis: analysisText
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'AI分析失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestGet = async ({ request }) => {
  return new Response(JSON.stringify({ 
    message: 'AI analyze endpoint working',
    method: 'GET'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
