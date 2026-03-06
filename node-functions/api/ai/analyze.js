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

    const prompt = `作为职业规划专家，请分析职业"${career}"的AI替代风险（风险评分${riskScore}，等级${riskLevel}）。请严格按照以下格式回答：

【风险解读】
（详细解释该职业面临AI替代风险的主要原因）

【优势分析】
（该职业在AI时代仍具有的核心优势）

【威胁识别】
（未来3-5年可能面临的最大威胁）

【机会发现】
（AI技术带来的新机会和发展方向）

【具体建议】
（3-5条可执行的职业发展建议）`;

    const apiRequest = {
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是职业规划专家，擅长分析AI对职业的影响。请严格按照用户要求的格式回答。'
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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    
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

      if (data.code) {
        console.error('Qwen API Error:', data);
        return new Response(JSON.stringify({ error: data.message || 'AI分析失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const analysisText = data.output?.choices?.[0]?.message?.content || '';
      
      // 解析文本为结构化数据
      const parsedAnalysis = parseAnalysis(analysisText);
      
      console.log('Analysis complete');
      
      return new Response(JSON.stringify({
        success: true,
        analysis: parsedAnalysis
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

// 解析AI返回的文本为结构化数据
function parseAnalysis(text) {
  const sections = {
    riskInterpretation: '',
    advantages: '',
    threats: '',
    opportunities: '',
    recommendations: ''
  };

  const patterns = {
    riskInterpretation: /【风险解读】\s*\n?([\s\S]*?)(?=【|$)/,
    advantages: /【优势分析】\s*\n?([\s\S]*?)(?=【|$)/,
    threats: /【威胁识别】\s*\n?([\s\S]*?)(?=【|$)/,
    opportunities: /【机会发现】\s*\n?([\s\S]*?)(?=【|$)/,
    recommendations: /【具体建议】\s*\n?([\s\S]*?)(?=【|$)/
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      sections[key] = match[1].trim();
    }
  }

  // 如果没有匹配到格式，将整个文本作为风险解读
  if (!sections.riskInterpretation && text) {
    sections.riskInterpretation = text;
  }

  return sections;
}

export const onRequestGet = async ({ request }) => {
  return new Response(JSON.stringify({ 
    message: 'AI analyze endpoint working',
    method: 'GET'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
