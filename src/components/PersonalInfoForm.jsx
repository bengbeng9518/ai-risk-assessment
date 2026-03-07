import React, { useState } from 'react';
import { Card, Form, Input, Select, Slider, Button, Collapse, message, Radio, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const { TextArea } = Input;

const PersonalInfoForm = ({ career, onUpdateFactors }) => {
  const [form] = Form.useForm();
  const [factors, setFactors] = useState({
    companyType: 'default',
    jobLevel: 'mid',
    aiExposure: 50,
    creativeRequirement: 50,
    humanInteraction: 50,
    decisionMaking: 50,
    jobDescription: '',
    companyDescription: ''
  });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const companyTypes = [
    { value: 'default', label: '默认（不调整）' },
    { value: 'tech_giant', label: '科技巨头（AI应用领先）' },
    { value: 'traditional_tech', label: '传统科技公司' },
    { value: 'traditional_industry', label: '传统行业' },
    { value: 'startup', label: '创业公司' },
    { value: 'government', label: '政府/公共部门' },
    { value: 'education', label: '教育机构' },
    { value: 'medical', label: '医疗机构' },
    { value: 'finance', label: '金融机构' }
  ];

  const jobLevels = [
    { value: 'intern', label: '实习生/初级' },
    { value: 'mid', label: '中级' },
    { value: 'senior', label: '高级/资深' },
    { value: 'lead', label: '团队负责人' },
    { value: 'manager', label: '经理/总监' },
    { value: 'executive', label: '高管' }
  ];

  const handleValuesChange = (changedValues, allValues) => {
    const newFactors = { ...factors, ...allValues };
    setFactors(newFactors);
    onUpdateFactors(newFactors);
  };

  const resetFactors = () => {
    form.resetFields();
    const defaultFactors = {
      companyType: 'default',
      jobLevel: 'mid',
      aiExposure: 50,
      creativeRequirement: 50,
      humanInteraction: 50,
      decisionMaking: 50,
      jobDescription: '',
      companyDescription: ''
    };
    setFactors(defaultFactors);
    onUpdateFactors(defaultFactors);
    message.info('已重置为默认值');
  };

  if (!career) {
    return (
      <Card title="个性化评估" style={{ marginTop: 16 }}>
        <p style={{ color: '#999', textAlign: 'center' }}>
          请先选择职业，然后补充个性化信息进行更精准的评估
        </p>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <span>
          个性化评估设置 
          <Tooltip title="根据您的公司情况和岗位描述，调整评估结果">
            <QuestionCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
          </Tooltip>
        </span>
      } 
      style={{ marginTop: 16 }}
      extra={
        <Button size="small" onClick={resetFactors}>重置</Button>
      }
    >
      <Form
        form={form}
        layout={isMobile ? 'vertical' : 'horizontal'}
        initialValues={factors}
        onValuesChange={handleValuesChange}
      >
        <Collapse defaultActiveKey={['company', 'job', 'details']} ghost style={{ marginTop: 8 }}>
          <Collapse.Panel 
            header={<span style={{ fontSize: '16px', fontWeight: 700 }}>🏢 公司情况</span>} 
            key="company"
          >
            <Form.Item 
              name="companyType" 
              label={<span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>公司类型</span>} 
              tooltip="不同类型公司的AI应用程度不同"
              style={{ marginBottom: 16 }}
            >
              <Radio.Group 
                options={companyTypes} 
                optionType="button" 
                buttonStyle="solid"
                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px'
                }}
              />
            </Form.Item>
            <Form.Item 
              name="companyDescription" 
              label={<span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>公司描述（可选）</span>} 
              tooltip="补充公司规模、行业地位等信息"
            >
              <TextArea 
                placeholder="例如： 公司规模500人，行业排名前三，正在进行数字化转型..." 
                rows={2}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Collapse.Panel>

          <Collapse.Panel 
            header={<span style={{ fontSize: '16px', fontWeight: 700 }}>💼 岗位情况</span>} 
            key="job"
          >
            <Form.Item 
              name="jobLevel" 
              label={<span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>职级</span>} 
              tooltip="不同职级的工作内容和要求不同"
              style={{ marginBottom: 16 }}
            >
              <Radio.Group 
                options={jobLevels} 
                optionType="button" 
                buttonStyle="solid"
                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px'
                }}
              />
            </Form.Item>
            <Form.Item 
              name="jobDescription" 
              label={<span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>岗位描述（可选）</span>} 
              tooltip="描述您的主要工作内容"
            >
              <TextArea 
                placeholder="例如： 负责后端开发，主要使用Java技术栈..." 
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Collapse.Panel>

          <Collapse.Panel 
            header={<span style={{ fontSize: '16px', fontWeight: 700 }}>📊 影响因素</span>} 
            key="details"
          >
            <Form.Item 
              name="aiExposure" 
              label={
                <span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>
                  AI接触程度 
                  <Tooltip title="工作中使用AI工具或受AI影响的程度">
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#00d4ff' }} />
                  </Tooltip>
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Slider 
                marks={{ 0: <span style={{ color: '#a0a0b0' }}>无</span>, 50: <span style={{ color: '#a0a0b0' }}>一般</span>, 100: <span style={{ color: '#a0a0b0' }}>高频</span> }} 
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </Form.Item>

            <Form.Item 
              name="creativeRequirement" 
              label={
                <span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>
                  创造性要求
                  <Tooltip title="工作需要创造性思维的程度">
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#00d4ff' }} />
                  </Tooltip>
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Slider 
                marks={{ 0: <span style={{ color: '#a0a0b0' }}>执行性</span>, 50: <span style={{ color: '#a0a0b0' }}>常规性</span>, 100: <span style={{ color: '#a0a0b0' }}>高度创造</span> }} 
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </Form.Item>

            <Form.Item 
              name="humanInteraction" 
              label={
                <span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>
                  人际互动需求
                  <Tooltip title="工作中与人沟通协作的需求程度">
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#00d4ff' }} />
                  </Tooltip>
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Slider 
                marks={{ 0: <span style={{ color: '#a0a0b0' }}>独立</span>, 50: <span style={{ color: '#a0a0b0' }}>一般</span>, 100: <span style={{ color: '#a0a0b0' }}>高度互动</span> }} 
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </Form.Item>

            <Form.Item 
              name="decisionMaking" 
              label={
                <span style={{ color: '#d0d0e0', fontSize: '14px', fontWeight: 500 }}>
                  决策复杂度
                  <Tooltip title="工作中需要复杂决策的程度">
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#00d4ff' }} />
                  </Tooltip>
                </span>
              }
              style={{ marginBottom: 16 }}
            >
              <Slider 
                marks={{ 0: <span style={{ color: '#a0a0b0' }}>简单执行</span>, 50: <span style={{ color: '#a0a0b0' }}>中等决策</span>, 100: <span style={{ color: '#a0a0b0' }}>复杂决策</span> }} 
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Card>
  );
};

export default PersonalInfoForm;