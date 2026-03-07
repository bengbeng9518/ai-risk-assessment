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
      form.setFieldsValue({ career: value });
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

  const handleCustomKeyPress = (e) => {
    if (e.key === 'Enter') {
      form.submit();
    }
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
            onPressEnter={handleCustomKeyPress}
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
          label={<span style={{ color: '#d0d0e0', fontSize: '15px', fontWeight: 500 }}>选择职业</span>}
          tooltip="从列表选择或输入自定义职业"
        >
          <Select 
            placeholder={<span style={{ color: '#a0a0b0' }}>🔍 请选择或搜索职业</span>}
            size={isMobile ? 'large' : 'middle'}
            showSearch
            optionFilterProp="children"
            onChange={handleCareerChange}
            allowClear
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
                  <Button 
                    type="link" 
                    onClick={handleCustomClick}
                    style={{ padding: 0, color: '#00d4ff', fontWeight: 500 }}
                  >
                    + 自定义职业
                  </Button>
                </div>
              </>
            )}
          >
            {careers.map(career => (
              <Select.Option key={career.id} value={career.name}>
                <span style={{ color: '#ffffff', fontWeight: 500 }}>{career.name}</span>
                <span style={{ color: '#a0a0b0', fontSize: '12px', marginLeft: 8 }}>({career.category})</span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </Form>
  );
};

export default CareerForm;
