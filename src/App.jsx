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
  primary: '#00d4ff',
  secondary: '#7b2cbf',
  accent: '#ff006e',
  gradient: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
  headerGradient: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 50%, #ff006e 100%)',
  cardGradient: 'linear-gradient(145deg, #1e1e32 0%, #252542 100%)',
  glowBlue: '0 4px 20px rgba(0, 212, 255, 0.15)',
  glowPurple: '0 4px 20px rgba(123, 44, 191, 0.15)',
  softPink: '#fff0f3',
  softPurple: '#f3f0ff',
  textDark: '#ffffff',
  textLight: '#f5f5f5',
  textGray: '#d0d0e0',
  textMuted: '#a0a0b0',
  bgDark: '#0a0a12',
  cardBg: '#1e1e32',
  borderGlow: '1px solid rgba(0, 212, 255, 0.25)'
};

function App() {
  const [result, setResult] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [personalizedFactors, setPersonalizedFactors] = useState(null);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
    setShowResult(true);
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
    <Layout style={{ minHeight: '100vh', background: theme.bgDark }}>
      <Header style={{ 
        background: theme.headerGradient, 
        padding: '0 16px',
        boxShadow: theme.glowBlue,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 600, fontSize: '16px' }}>
              AI职业风险评估
            </Title>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11 }}>
            你的职业安全吗？
          </Text>
        </div>
      </Header>
      
      <Content style={{ padding: '16px 12px', paddingBottom: 100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          {!selectedCareer && (
            <Card
              style={{
                borderRadius: 20,
                marginBottom: 24,
                border: theme.borderGlow,
                boxShadow: theme.glowBlue,
                background: theme.cardGradient,
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: theme.headerGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: theme.glowBlue
                }}>
                  <span style={{ fontSize: 28 }}>🤖</span>
                </div>
                <Title level={3} style={{
                  marginBottom: 12,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#ffffff',
                  textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
                }}>
                  AI职业风险评估
                </Title>
                <Paragraph style={{ color: '#d0d0e0', fontSize: 15, marginBottom: 0, lineHeight: 1.8 }}>
                  AI时代，你的工作还安全吗<br/><span style={{ color: '#00d4ff' }}>科学数据分析，精准预见职业未来</span>
                </Paragraph>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12
              }}>
                {[
                  { icon: '⚡', text: '智能分析', color: theme.primary },
                  { icon: '🎯', text: '精准评估', color: theme.secondary },
                  { icon: '🛡️', text: '专业可靠', color: theme.accent }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${item.color}30`
                  }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <Text style={{ fontSize: 12, color: theme.textGray }}>{item.text}</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <UsageDisplay onBuy={() => setPurchaseModalVisible(true)} />

          <Card
            style={{
              borderRadius: 20,
              marginBottom: 24,
              border: theme.borderGlow,
              boxShadow: theme.glowPurple,
              background: theme.cardBg
            }}
            bodyStyle={{ padding: '20px 16px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: theme.primary,
                boxShadow: `0 0 15px ${theme.primary}`
              }} />
              <Title level={5} style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 700,
                textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
              }}>
                选择你的职业
              </Title>
            </div>
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
                  type="primary"
                  onClick={() => handleAssess(false)}
                  style={{ 
                    borderRadius: 20,
                    background: theme.gradient,
                    border: 'none'
                  }}
                >
                  🤖 AI智能评估
                </Button>
              </Card>
            </>
          )}
          
          {showResult && (
            <>
              <ResultDisplay result={result} />
              <AIAnalysis assessmentResult={result} autoRun={true} />
            </>
          )}
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