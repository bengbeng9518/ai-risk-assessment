import React, { useState, useEffect } from 'react';
import { Layout, Typography, message, Button, Card, FloatButton, Divider } from 'antd';
import { StarOutlined, RocketOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import CareerForm from './components/CareerForm';
import ResultDisplay from './components/ResultDisplay';
import AIAnalysis from './components/AIAnalysis';
import PersonalInfoForm from './components/PersonalInfoForm';
import { UsageDisplay, PurchaseModal } from './components/UsageDisplay';
import { assessCareer } from './services/api';
import { addUsageCount, getUserId, checkAvailableUsage, decrementUsage } from './utils/usage';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const theme = {
  primary: '#ff4757',
  secondary: '#ff6b81',
  gradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 50%, #ffa502 100%)',
  cardGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  softPink: '#fff0f3',
  softPurple: '#f3f0ff',
  textDark: '#2d3436',
  textGray: '#636e72'
};

function App() {
  const [result, setResult] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [personalizedFactors, setPersonalizedFactors] = useState(null);
  const [showPersonalization, setShowPersonalization] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'payment-success') {
        addUsageCount(event.data.count);
        message.success(`🎉 成功购买${event.data.count}次评估！`);
        setPurchaseModalVisible(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCareerSelect = (careerName) => {
    setSelectedCareer(careerName);
    setResult(null);
    setShowPersonalization(true);
  };

  const handleFactorsUpdate = (factors) => {
    setPersonalizedFactors(factors);
  };

  const handleAssess = (usePersonalization = false) => {
    if (!selectedCareer) {
      message.warning('请先选择职业哦~');
      return;
    }

    if (!checkAvailableUsage()) {
      message.warning('免费次数用完啦～');
      setPurchaseModalVisible(true);
      return;
    }

    const factors = usePersonalization ? personalizedFactors : null;
    const assessmentResult = assessCareer(selectedCareer, factors);
    
    decrementUsage();
    setResult(assessmentResult);
  };

  const handlePurchase = async (packageData) => {
    addUsageCount(packageData.count);
    message.success(`充值成功！获得${packageData.count}次评估次数`);
    window.location.reload();
  };

  const isPersonalizedActive = () => {
    if (!personalizedFactors) return false;
    const hasCustomization = Object.keys(personalizedFactors).some(k => {
      if (k === 'jobDescription' || k === 'companyDescription') return false;
      if (personalizedFactors[k] === 'default' || personalizedFactors[k] === 'mid' || personalizedFactors[k] === 50) return false;
      return true;
    });
    return hasCustomization;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header style={{ 
        background: theme.gradient, 
        padding: '0 20px',
        boxShadow: '0 2px 8px rgba(255, 71, 87, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🔮</span>
            <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
              AI职业风险评估
            </Title>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
            你的职业安全吗？
          </Text>
        </div>
      </Header>
      
      <Content style={{ padding: '24px 16px', paddingBottom: 80 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <Card 
            style={{ 
              borderRadius: 16, 
              marginBottom: 20,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: 68,
              zIndex: 50
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ marginBottom: 8, color: theme.textDark }}>
                🔥 测试你的职业会被AI替代吗？
              </Title>
              <Paragraph style={{ color: theme.textGray, fontSize: 15, marginBottom: 0 }}>
                AI时代来了，你的岗位还安全吗？用科学数据说话！
              </Paragraph>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textGray }}>
                <StarOutlined style={{ color: theme.primary }} />
                <Text style={{ fontSize: 13 }}>智能分析</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textGray }}>
                <RocketOutlined style={{ color: theme.secondary }} />
                <Text style={{ fontSize: 13 }}>精准评估</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textGray }}>
                <SafetyCertificateOutlined style={{ color: '#ffa502' }} />
                <Text style={{ fontSize: 13 }}>专业可靠</Text>
              </div>
            </div>
          </Card>

          <UsageDisplay onBuy={() => setPurchaseModalVisible(true)} />
          
          <Card 
            style={{ 
              borderRadius: 16, 
              marginBottom: 20,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ marginBottom: 16, color: theme.textDark }}>
              📋 选择你的职业
            </Title>
            <CareerForm onAssess={() => handleAssess(false)} onCareerSelect={handleCareerSelect} />
          </Card>
          
          {selectedCareer && (
            <>
              <PersonalInfoForm 
                career={selectedCareer} 
                onUpdateFactors={handleFactorsUpdate}
              />
              
              <Card 
                size="small" 
                style={{ 
                  marginTop: 16, 
                  textAlign: 'center',
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: 16 }}
              >
                <Typography.Text strong style={{ marginRight: 12, fontSize: 15 }}>
                  ✨ 已选择：<span style={{ color: theme.primary }}>{selectedCareer}</span>
                </Typography.Text>
                <Divider type="vertical" />
                <Button 
                  type={isPersonalizedActive() ? "primary" : "default"}
                  onClick={() => handleAssess(true)}
                  style={{ 
                    borderRadius: 20,
                    background: isPersonalizedActive() ? theme.gradient : undefined,
                    border: isPersonalizedActive() ? 'none' : undefined
                  }}
                >
                  {isPersonalizedActive() ? "🚀 个性化评估" : "📊 标准评估"}
                </Button>
                {isPersonalizedActive() && (
                  <Button 
                    onClick={() => handleAssess(false)}
                    style={{ marginLeft: 8, borderRadius: 20 }}
                    ghost
                  >
                    标准评估
                  </Button>
                )}
              </Card>
            </>
          )}
          
          <ResultDisplay result={result} />
          <AIAnalysis assessmentResult={result} />
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        padding: '24px 20px',
        background: 'transparent'
      }}>
        <Text style={{ color: theme.textGray, fontSize: 13 }}>
          💖 AI替代风险评估系统 ©{new Date().getFullYear()} | 帮你发现职业危机
        </Text>
      </Footer>
      
      <FloatButton.BackTop style={{ right: 24, bottom: 24 }} />
      
      <PurchaseModal 
        visible={purchaseModalVisible}
        onCancel={() => setPurchaseModalVisible(false)}
        onConfirm={handlePurchase}
      />
    </Layout>
  );
}

export default App;