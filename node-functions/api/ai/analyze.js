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

    // 简化提示词，减少AI处理时间
    const prompt = `作为职业规划专家，请简要分析职业"${career}"的AI替代风险（风险评分${riskScore}，等级${riskLevel}）：
1. 风险解读：为什么面临AI替代风险
2. 核心优势：AI时代仍具优势
3. 未来威胁：3-5年最大威胁
4. 新机会：AI带来的发展方向
5. 具体建议：3条可执行建议
请用中文回答，简洁明了。`;

    const apiRequest = {
      model: 'qwen-turbo',  // 使用更快的模型
      input: {
        messages: [
          {
            role: 'system',
            content: '你是职业规划专家，擅长分析AI对职业的影响。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 1500,  // 减少token数量
        result_format: 'message'
      }
    };

    const qwenKey = 'sk-d7ac5c693dc14eff8ec64bff80f146ab';
    const qwenUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    console.log('Calling Qwen API...');
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒超时
    
    try {
      const response = await fetch(qwenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${qwenKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiRequest),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Fetch timeout');
        return new Response(JSON.stringify({ 
          error: 'AI分析超时，请稍后重试',
          timeout: true 
        }), {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw fetchError;
    }

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
