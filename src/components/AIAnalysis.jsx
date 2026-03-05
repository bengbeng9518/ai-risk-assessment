import React, { useState } from 'react';
import { Card, Button, Spin, Alert, message, Tag, Divider } from 'antd';
import { RobotOutlined, ThunderboltOutlined, SafetyOutlined, AlertOutlined, RiseOutlined, SolutionOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const AIAnalysis = ({ assessmentResult }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleAnalyze = async () => {
    if (!assessmentResult) {
      message.warning('请先完成职业评估');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentResult: assessmentResult
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API错误: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        const parsedAnalysis = parseAnalysisData(data.analysis);
        setAnalysis(parsedAnalysis);
        message.success('AI智能分析完成');
      } else {
        throw new Error(data.error || 'AI分析失败');
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError(err.message || 'AI分析失败，请稍后重试');
      message.error('AI分析失败');
    } finally {
      setLoading(false);
    }
  };

  const parseAnalysisData = (data) => {
    if (typeof data === 'string') {
      try {
        const cleaned = data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          riskInterpretation: parsed.riskInterpretation || parsed.risk_interpretation || parsed.risk || '',
          advantages: parsed.advantages || parsed.优势分析 || '',
          threats: parsed.threats || parsed.threat || parsed.威胁识别 || '',
          opportunities: parsed.opportunities || parsed.opportunity || parsed.机会发现 || '',
          recommendations: parsed.recommendations || parsed.recommendation || parsed.具体建议 || parsed.suggestions || ''
        };
      } catch (e) {
        return {
          riskInterpretation: data,
          advantages: '',
          threats: '',
          opportunities: '',
          recommendations: ''
        };
      }
    }
    return data;
  };

  const renderSection = (icon, title, content, color) => {
    if (!content) return null;
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ 
            fontSize: 20, 
            marginRight: 10,
            background: `${color}15`,
            padding: 8,
            borderRadius: 10
          }}>{icon}</span>
          <span style={{ 
            fontSize: 16, 
            fontWeight: 600,
            color: '#333'
          }}>{title}</span>
        </div>
        <div style={{ 
          color: '#666', 
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 14
        }}>
          {content}
        </div>
      </div>
    );
  };

  const getRiskLevel = () => {
    if (!assessmentResult?.totalScore) return null;
    const score = assessmentResult.totalScore;
    if (score >= 80) return { level: '极高风险', color: '#ff4d4f', bg: '#fff2f0' };
    if (score >= 60) return { level: '高风险', color: '#fa8c16', bg: '#fff7e6' };
    if (score >= 40) return { level: '中等风险', color: '#faad14', bg: '#fffbe6' };
    if (score >= 20) return { level: '低风险', color: '#52c41a', bg: '#f6ffed' };
    return { level: '极低风险', color: '#1890ff', bg: '#e6f7ff' };
  };

  const riskInfo = getRiskLevel();

  return (
    <Card 
      style={{ 
        marginTop: 20,
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: 'none'
      }}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
    >
      <div style={{
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 12
        }}>
          <RobotOutlined style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 4 }}>
          AI智能分析
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          通义千问驱动 · 深度解读
        </div>
      </div>

      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 15, borderRadius: 12 }}
          closable
          onClose={() => setError(null)}
        />
      )}
      
      {!analysis && !loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ marginBottom: 20, color: '#666', fontSize: 14 }}>
            点击下方按钮，让AI为您深度分析<br/>
            <span style={{ color: '#667eea', fontWeight: 'bold' }}>职业风险</span>与<span style={{ color: '#764ba2', fontWeight: 'bold' }}>发展建议</span>
          </p>
          <Button 
            type="primary"
            size={isMobile ? 'large' : 'middle'}
            onClick={handleAnalyze}
            icon={<ThunderboltOutlined />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 25,
              height: 44,
              paddingInline: 28,
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            开始AI分析
          </Button>
        </div>
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 20 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
          <p style={{ marginTop: 15, color: '#666', fontWeight: 500 }}>AI正在深度分析中...</p>
          <p style={{ fontSize: 12, color: '#999' }}>根据您的职业特点生成个性化报告</p>
        </div>
      )}
      
      {analysis && (
        <div>
          {riskInfo && (
            <div style={{
              background: riskInfo.bg,
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 20,
              textAlign: 'center',
              border: `1px solid ${riskInfo.color}30`
            }}>
              <Tag color={riskInfo.color} style={{ borderRadius: 20, fontSize: 14, padding: '4px 16px' }}>
                {riskInfo.level}
              </Tag>
              <span style={{ marginLeft: 10, color: '#666', fontSize: 13 }}>
                风险指数：{assessmentResult?.totalScore || 0}分
              </span>
            </div>
          )}

          {renderSection(<SafetyOutlined />, '📊 风险解读', analysis.riskInterpretation, '#667eea')}
          {renderSection(<AlertOutlined />, '💪 优势分析', analysis.advantages, '#52c41a')}
          {renderSection(<AlertOutlined style={{ color: '#fa8c16' }} />, '⚠️ 威胁识别', analysis.threats, '#fa8c16')}
          {renderSection(<RiseOutlined />, '🚀 机会发现', analysis.opportunities, '#1890ff')}
          {renderSection(<SolutionOutlined />, '📋 具体建议', analysis.recommendations, '#764ba2')}

          <Divider style={{ margin: '20px 0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              onClick={() => setAnalysis(null)}
              style={{
                borderRadius: 20,
                borderColor: '#667eea',
                color: '#667eea'
              }}
            >
              🔄 重新分析
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIAnalysis;
