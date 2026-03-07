import React from 'react';
import { Card, Progress, Typography, List, Row, Col, Tag, Divider } from 'antd';
import { useMediaQuery } from 'react-responsive';
import ReactECharts from 'echarts-for-react';
import { 
  ThunderboltOutlined, 
  RobotOutlined, 
  WarningOutlined, 
  BulbOutlined,
  CrownOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const theme = {
  primary: '#ff4757',
  gradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
  highRisk: '#ff4757',
  mediumRisk: '#ffa502',
  lowRisk: '#2ed573',
  cardGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  darkBg: '#1e1e32',
  darkCard: '#252542',
  textLight: '#ffffff',
  textGray: '#d0d0e0',
  textMuted: '#a0a0b0'
};

const ResultDisplay = ({ result }) => {
  if (!result) {
    return null;
  }

  const { riskScore, riskLevel, breakdown, recommendations, isPersonalized, personalizedFactors } = result;
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const getRiskColor = (level) => {
    switch (level) {
      case '高': return theme.highRisk;
      case '中等': return theme.mediumRisk;
      case '低': return theme.lowRisk;
      default: return theme.primary;
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case '高': return 'rgba(255, 71, 87, 0.1)';
      case '中等': return 'rgba(255, 165, 2, 0.1)';
      case '低': return 'rgba(46, 213, 115, 0.1)';
      default: return 'rgba(24, 144, 255, 0.1)';
    }
  };

  const getRiskMessage = (level) => {
    switch (level) {
      case '高': return '⚠️ 危机！这个岗位容易被AI替代';
      case '中等': return '⚡ 注意！存在一定替代风险';
      case '低': return '✅ 相对安全，AI难以完全替代';
      default: return '';
    }
  };

  const radarOption = {
    radar: {
      indicator: [
        { name: '任务自动化', max: 100, color: '#d0d0e0' },
        { name: '技能复杂度', max: 100, color: '#d0d0e0' },
        { name: '数据可获得性', max: 100, color: '#d0d0e0' },
        { name: '技术成熟度', max: 100, color: '#d0d0e0' }
      ],
      radius: isMobile ? 55 : 75,
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 212, 255, 0.02)', 'rgba(0, 212, 255, 0.04)', 'rgba(0, 212, 255, 0.06)', 'rgba(0, 212, 255, 0.08)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(0, 212, 255, 0.2)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 212, 255, 0.15)' }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          breakdown.automation,
          breakdown.skillComplexity,
          breakdown.dataAvailability,
          breakdown.techMaturity
        ],
        name: '风险维度',
        areaStyle: {
          color: `${getRiskColor(riskLevel)}33`
        },
        lineStyle: {
          color: getRiskColor(riskLevel),
          width: 2
        },
        itemStyle: {
          color: getRiskColor(riskLevel)
        }
      }]
    }]
  };

  const getCompanyTypeLabel = (type) => {
    const labels = {
      'tech_giant': '科技巨头',
      'traditional_tech': '传统科技公司',
      'traditional_industry': '传统行业',
      'startup': '创业公司',
      'government': '政府/公共部门',
      'education': '教育机构',
      'medical': '医疗机构',
      'finance': '金融机构'
    };
    return labels[type] || type;
  };

  const getJobLevelLabel = (level) => {
    const labels = {
      'intern': '实习生/初级',
      'mid': '中级',
      'senior': '高级/资深',
      'lead': '团队负责人',
      'manager': '经理/总监',
      'executive': '高管'
    };
    return labels[level] || level;
  };

  return (
    <Card 
      style={{ 
        marginTop: 20,
        borderRadius: 20,
        border: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        background: theme.darkBg
      }}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
    >
      <div style={{ 
        background: `${getRiskColor(riskLevel)}15`,
        borderRadius: 16,
        padding: isMobile ? 16 : 24,
        marginBottom: 24,
        textAlign: 'center',
        border: `1px solid ${getRiskColor(riskLevel)}40`
      }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8, color: '#ffffff', textShadow: `0 0 20px ${getRiskColor(riskLevel)}80` }}>
            🎯 {result.career}
          </Title>
          <div>
            {result.isCustomCareer && (
              <Tag style={{ borderRadius: 12, background: '#ffa502', color: '#fff', border: 'none' }}>自定义</Tag>
            )}
            {isPersonalized && (
              <Tag style={{ borderRadius: 12, background: '#7b2cbf', color: '#fff', border: 'none' }}>个性化</Tag>
            )}
          </div>
        </div>
        
        <Progress 
          type="dashboard" 
          percent={riskScore} 
          strokeColor={getRiskColor(riskLevel)}
          size={isMobile ? 160 : 220}
          trailColor="rgba(255,255,255,0.1)"
          format={(percent) => (
            <div>
              <div style={{ fontSize: isMobile ? 32 : 42, fontWeight: 800, color: getRiskColor(riskLevel), textShadow: `0 0 20px ${getRiskColor(riskLevel)}60` }}>
                {percent}
              </div>
              <div style={{ fontSize: 13, color: '#a0a0b0', marginTop: 4 }}>风险指数</div>
            </div>
          )}
        />
        
        <div style={{ marginTop: 16 }}>
          <Title level={4} style={{ color: getRiskColor(riskLevel), marginBottom: 8, textShadow: `0 0 15px ${getRiskColor(riskLevel)}60` }}>
            {riskLevel}风险
          </Title>
          <Text style={{ fontSize: 14, color: '#d0d0e0', fontWeight: 500 }}>
            {getRiskMessage(riskLevel)}
          </Text>
        </div>
      </div>

      {isPersonalized && personalizedFactors && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          background: 'rgba(123, 44, 191, 0.15)', 
          borderRadius: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          border: '1px solid rgba(123, 44, 191, 0.3)'
        }}>
          <Text strong style={{ color: '#ffffff' }}>📍 个性化因素：</Text>
          {personalizedFactors.companyType && personalizedFactors.companyType !== 'default' && (
            <Tag color="purple" style={{ borderRadius: 12 }}>{getCompanyTypeLabel(personalizedFactors.companyType)}</Tag>
          )}
          {personalizedFactors.jobLevel && personalizedFactors.jobLevel !== 'mid' && (
            <Tag color="cyan" style={{ borderRadius: 12 }}>{getJobLevelLabel(personalizedFactors.jobLevel)}</Tag>
          )}
          {personalizedFactors.aiExposure !== undefined && personalizedFactors.aiExposure !== 50 && (
            <Tag color="orange" style={{ borderRadius: 12 }}>AI接触: {personalizedFactors.aiExposure}%</Tag>
          )}
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ 
            background: theme.darkCard, 
            borderRadius: 12, 
            padding: 16,
            height: '100%',
            border: '1px solid rgba(0, 212, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ThunderboltOutlined style={{ color: '#00d4ff', fontSize: 20 }} />
              <Title level={5} style={{ margin: 0, color: '#ffffff' }}>维度分析</Title>
            </div>
            <div style={{ height: isMobile ? 220 : 280 }}>
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ 
            background: theme.darkCard, 
            borderRadius: 12, 
            padding: 16,
            height: '100%',
            border: '1px solid rgba(255, 165, 2, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BulbOutlined style={{ color: '#ffa502', fontSize: 20 }} />
              <Title level={5} style={{ margin: 0, color: '#ffffff' }}>💡 发展建议</Title>
            </div>
            <List
              dataSource={recommendations}
              renderItem={(item, index) => (
                <List.Item style={{ border: 'none', padding: '10px 0' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ffa502, #ff6b35)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(255, 165, 2, 0.3)'
                    }}>
                      {index + 1}
                    </span>
                    <Text style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.7, color: '#d0d0e0' }}>
                      {item}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ResultDisplay;