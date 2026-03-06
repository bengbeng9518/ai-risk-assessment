export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    let assessmentResult;
    try {
      const body = await request.body;
      assessmentResult = body?.assessmentResult;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!assessmentResult) {
      return new Response(JSON.stringify({ error: 'Missing assessment result' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { career, riskScore, riskLevel, breakdown } = assessmentResult;

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
    
    const response = await fetch(qwenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequest)
    });

    const data = await response.json();

    if (data.code) {
      console.error('Qwen API Error:', data);
      return new Response(JSON.stringify({ error: data.message || 'AI分析失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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

      const sectionKeywords = {
        riskInterpretation: ['风险解读'],
        advantages: ['优势分析'],
        threats: ['威胁识别'],
        opportunities: ['机会发现'],
        recommendations: ['具体建议']
      };

      const lines = text.split('\n');
      let currentSection = null;
      let isCollecting = false;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        let foundSection = null;
        for (const [section, keywords] of Object.entries(sectionKeywords)) {
          for (const keyword of keywords) {
            if (trimmedLine.includes(keyword)) {
              foundSection = section;
              break;
            }
          }
          if (foundSection) break;
        }

        if (foundSection) {
          currentSection = foundSection;
          isCollecting = true;
          const contentAfterKeyword = trimmedLine
            .replace(/^#{1,3}\s*\d+\s*\.\s*/, '')
            .replace(/^\*{1,2}/, '')
            .replace(/风险解读|优势分析|威胁识别|机会发现|具体建议/, '')
            .replace(/^[:：]\s*/, '')
            .trim();
          sections[currentSection] = contentAfterKeyword ? contentAfterKeyword + '\n' : '';
        } else if (isCollecting && currentSection && trimmedLine) {
          if (trimmedLine.match(/^#{1,3}\s*\d+\s*\./)) {
            isCollecting = false;
          } else if (!trimmedLine.startsWith('**') && !trimmedLine.startsWith('-') && trimmedLine.length > 0) {
            sections[currentSection] += trimmedLine + '\n';
          } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
            sections[currentSection] += trimmedLine + '\n';
          }
        }
      });

      return sections;
    };
    
    const analysisResult = parseResponse(analysisText);
    
    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      rawResponse: analysisText
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'AI分析失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
