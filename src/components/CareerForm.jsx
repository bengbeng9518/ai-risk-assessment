import React from 'react';
import { Form, Select, Button, message, Input } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { getCareers } from '../services/api';
import { checkAvailableUsage, decrementUsage } from '../utils/usage';

const CareerForm = ({ onAssess, onCareerSelect }) => {
  const [form] = Form.useForm();
  const [careers, setCareers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [customMode, setCustomMode] = React.useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  React.useEffect(() => {
    setCareers(getCareers());
  }, []);

  const handleSubmit = async (values) => {
    const hasUsage = checkAvailableUsage();
    if (!hasUsage) {
      message.warning('您的免费次数已用完，请购买更多次数');
      return;
    }

    const careerName = values.career || values.customCareer;
    
    if (!careerName || careerName.trim() === '') {
      message.warning('请选择或输入职业名称');
      return;
    }

    if (onCareerSelect) {
      onCareerSelect(careerName.trim());
    }

    setLoading(true);
    try {
      decrementUsage();
      onAssess(careerName.trim());
    } catch (error) {
      message.error('评估失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = (value) => {
    if (value === 'custom') {
      setCustomMode(true);
      form.setFieldsValue({ career: undefined });
    } else {
      setCustomMode(false);
      if (value && onCareerSelect) {
        onCareerSelect(value);
      }
    }
  };

  const handleCustomCareerChange = (e) => {
    const customCareer = e.target.value;
    if (customCareer && onCareerSelect) {
      onCareerSelect(customCareer);
    }
  };

  const handleCustomClick = () => {
    setCustomMode(true);
    form.setFieldsValue({ career: undefined });
  };

  const handleBackToSelect = () => {
    setCustomMode(false);
    form.setFieldsValue({ customCareer: undefined });
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout={isMobile ? 'vertical' : 'horizontal'}>
      {customMode ? (
        <Form.Item 
          name="customCareer" 
          label="自定义职业"
          tooltip="输入您想评估的职业名称"
          rules={[
            { required: true, message: '请输入职业名称' }
          ]}
        >
          <Input 
            placeholder="例如：产品经理、数据分析师等"
            size={isMobile ? 'large' : 'middle'}
            onChange={handleCustomCareerChange}
            suffix={
              <Button type="link" onClick={handleBackToSelect} style={{ padding: 0 }}>
                返回选择
              </Button>
            }
          />
        </Form.Item>
      ) : (
        <Form.Item 
          name="career" 
          label="选择职业"
          tooltip="从列表选择或输入自定义职业"
        >
          <Select 
            placeholder="请选择职业"
            size={isMobile ? 'large' : 'middle'}
            showSearch
            optionFilterProp="children"
            onChange={handleCareerChange}
            allowClear
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button 
                    type="link" 
                    onClick={handleCustomClick}
                    style={{ padding: 0, color: '#1890ff' }}
                  >
                    + 自定义职业
                  </Button>
                </div>
              </>
            )}
          >
            {careers.map(career => (
              <Select.Option key={career.id} value={career.name}>
                {career.name} <span style={{ color: '#999', fontSize: '12px' }}>({career.category})</span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          size={isMobile ? 'large' : 'middle'}
          block={isMobile}
          loading={loading}
          style={{ height: isMobile ? '50px' : '32px' }}
        >
          评估风险
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CareerForm;