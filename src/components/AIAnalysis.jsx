import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Alert, Collapse, message } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { checkAvailableUsage, decrementUsage } from '../utils/usage';

const AIAnalysis = ({ assessmentResult, autoRun = false }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/ai/analyze` : '/api/ai/analyze';

  useEffect(() => {
    if (autoRun && assessmentResult && !analysis && !loading) {
      handleAnalyze();
    }
  }, [autoRun, assessmentResult]);

  const handleAnalyze = async () => {
    if (!assessmentResult) {
      message.warning('请先完成职业评估');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl, {
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
      console.log('API Response:', data);

      if (data.success && data.analysis) {
        console.log('Setting analysis:', data.analysis);
        setAnalysis(data.analysis);
        message.success('AI智能分析完成');
      } else {
        console.error('API Error:', data);
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

  if (!assessmentResult) {
    return null;
  }

  const collapseItems = [
    {
      key: '1',
      label: <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>📊 风险解读</span>,
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d0d0e0', fontSize: '14px' }}>{analysis?.riskInterpretation}</p>
    },
    {
      key: '2',
      label: <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>💪 优势分析</span>,
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d0d0e0', fontSize: '14px' }}>{analysis?.advantages}</p>
    },
    {
      key: '3',
      label: <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>⚠️ 威胁识别</span>,
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d0d0e0', fontSize: '14px' }}>{analysis?.threats}</p>
    },
    {
      key: '4',
      label: <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>🚀 机会发现</span>,
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d0d0e0', fontSize: '14px' }}>{analysis?.opportunities}</p>
    },
    {
      key: '5',
      label: <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>📋 具体建议</span>,
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d0d0e0', fontSize: '14px' }}>{analysis?.recommendations}</p>
    }
  ];

  return (
    <Card 
      title={
        <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
          <RobotOutlined style={{ color: '#00d4ff', marginRight: 8 }} /> 
          AI智能分析 
          <span style={{ fontSize: '12px', color: '#a0a0b0', marginLeft: 8 }}>(通义千问驱动)</span>
        </span>
      } 
      style={{ 
        marginTop: 24,
        borderRadius: 16,
        border: '1px solid rgba(0, 212, 255, 0.2)',
        background: '#1e1e32'
      }}
      headStyle={{ borderBottom: '1px solid rgba(0, 212, 255, 0.15)' }}
    >
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16, borderRadius: 12 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" style={{ color: '#00d4ff' }} />
          <p style={{ marginTop: 20, color: '#d0d0e0', fontSize: '15px' }}>通义千问AI正在分析中，请稍候...</p>
          <p style={{ fontSize: '13px', color: '#a0a0b0' }}>这可能需要几秒钟时间</p>
        </div>
      )}
      
      {analysis && (
        <Collapse 
          defaultActiveKey={['1', '2', '3', '4', '5']} 
          items={collapseItems}
          style={{ background: 'transparent' }}
        />
      )}

      {analysis && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Button 
            onClick={() => {
              if (!checkAvailableUsage()) {
                message.warning('您的免费次数已用完，请购买更多次数');
                return;
              }
              decrementUsage();
              setAnalysis(null);
            }}
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              padding: '0 24px',
              height: '40px',
              borderRadius: '20px'
            }}
          >
            🔄 重新分析
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AIAnalysis;
