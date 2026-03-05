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
        setAnalysis(data.analysis);
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

  if (!assessmentResult) {
    return null;
  }

  const collapseItems = [
    {
      key: '1',
      label: '📊 风险解读',
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analysis?.riskInterpretation}</p>
    },
    {
      key: '2',
      label: '💪 优势分析',
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analysis?.advantages}</p>
    },
    {
      key: '3',
      label: '⚠️ 威胁识别',
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analysis?.threats}</p>
    },
    {
      key: '4',
      label: '🚀 机会发现',
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analysis?.opportunities}</p>
    },
    {
      key: '5',
      label: '📋 具体建议',
      children: <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analysis?.recommendations}</p>
    }
  ];

  return (
    <Card 
      title={
        <span>
          <RobotOutlined /> AI智能分析 <span style={{ fontSize: '12px', color: '#999' }}>(通义千问驱动)</span>
        </span>
      } 
      style={{ marginTop: 20 }}
    >
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 15 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 15 }}>通义千问AI正在分析中，请稍候...</p>
          <p style={{ fontSize: '12px', color: '#999' }}>这可能需要几秒钟时间</p>
        </div>
      )}
      
      {analysis && (
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5']} items={collapseItems} />
      )}

      {analysis && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button onClick={() => {
            if (!checkAvailableUsage()) {
              message.warning('您的免费次数已用完，请购买更多次数');
              return;
            }
            decrementUsage();
            setAnalysis(null);
          }}>
            重新分析
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AIAnalysis;