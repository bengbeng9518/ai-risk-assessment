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
  cardGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
        { name: '任务自动化', max: 100, color: '#636e72' },
        { name: '技能复杂度', max: 100, color: '#636e72' },
        { name: '数据可获得性', max: 100, color: '#636e72' },
        { name: '技术成熟度', max: 100, color: '#636e72' }
      ],
      radius: isMobile ? 55 : 75,
      splitArea: {
        areaStyle: {
          color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.08)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(0,0,0,0.1)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(0,0,0,0.1)' }
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
        border: 'none',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
    >
      <div style={{ 
        background: getRiskBg(riskLevel),
        borderRadius: 16,
        padding: isMobile ? 16 : 24,
        marginBottom: 24,
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8, color: theme.primary }}>
            🎯 {result.career}
          </Title>
          <div>
            {result.isCustomCareer && (
              <Tag color="orange" style={{ borderRadius: 12 }}>自定义</Tag>
            )}
            {isPersonalized && (
              <Tag color="purple" style={{ borderRadius: 12 }}>个性化</Tag>
            )}
          </div>
        </div>
        
        <Progress 
          type="dashboard" 
          percent={riskScore} 
          strokeColor={getRiskColor(riskLevel)}
          size={isMobile ? 160 : 220}
          trailColor="rgba(0,0,0,0.06)"
          format={(percent) => (
            <div>
              <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: getRiskColor(riskLevel) }}>
                {percent}
              </div>
              <div style={{ fontSize: 12, color: '#636e72' }}>风险指数</div>
            </div>
          )}
        />
        
        <div style={{ marginTop: 16 }}>
          <Title level={4} style={{ color: getRiskColor(riskLevel), marginBottom: 4 }}>
            {riskLevel}风险
          </Title>
          <Text style={{ fontSize: 14, color: '#636e72' }}>
            {getRiskMessage(riskLevel)}
          </Text>
        </div>
      </div>

      {isPersonalized && personalizedFactors && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          background: '#f8f0ff', 
          borderRadius: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center'
        }}>
          <Text strong style={{ color: '#764ba2' }}>📍 个性化因素：</Text>
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
            background: '#fafafa', 
            borderRadius: 12, 
            padding: 16,
            height: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ThunderboltOutlined style={{ color: theme.primary, fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: '#2d3436' }}>维度分析</Title>
            </div>
            <div style={{ height: isMobile ? 220 : 280 }}>
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ 
            background: '#fafafa', 
            borderRadius: 12, 
            padding: 16,
            height: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BulbOutlined style={{ color: '#ffa502', fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: '#2d3436' }}>💡 发展建议</Title>
            </div>
            <List
              dataSource={recommendations}
              renderItem={(item, index) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: theme.gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <Text style={{ fontSize: isMobile ? 13 : 14, lineHeight: 1.6 }}>
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