import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Radio, Space, message } from 'antd';
import { getUserData } from '../utils/usage';
import { useMediaQuery } from 'react-responsive';
import { DollarOutlined, ThunderboltOutlined, CrownOutlined, FireOutlined } from '@ant-design/icons';

const theme = {
  primary: '#ff4757',
  gradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
  gold: '#ffd700'
};

const UsageDisplay = ({ onBuy }) => {
  const [userData, setUserData] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setUserData(getUserData());
    const handleStorageChange = () => {
      setUserData(getUserData());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!userData) {
    return null;
  }

  const availableCount = userData.freeUsageCount + userData.paidUsageCount;
  const totalFreeCount = 5;
  const usedCount = totalFreeCount - userData.freeUsageCount;
  
  if (availableCount > 0 && userData.freeUsageCount > 0) {
    return null;
  }

  return (
    <Card 
      style={{ 
        marginBottom: 20,
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
      bodyStyle={{ padding: isMobile ? 16 : 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: theme.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)'
          }}>
            <DollarOutlined style={{ fontSize: 28, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#636e72', marginBottom: 4 }}>
              剩余评估次数
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: theme.primary }}>
              {availableCount} <span style={{ fontSize: 14, fontWeight: 400 }}>次</span>
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#636e72' }}>
            <span>免费: {userData.freeUsageCount}/5</span>
            <span>付费: {userData.paidUsageCount}</span>
          </div>
          <div style={{ 
            height: 8, 
            background: '#f0f0f0', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${Math.min(100, (usedCount / totalFreeCount) * 100)}%`,
              height: '100%',
              background: usedCount >= 5 ? theme.gradient : 'linear-gradient(90deg, #ffa502, #ff6348)',
              borderRadius: 4,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        <Button 
          type="primary"
          onClick={onBuy}
          size={isMobile ? 'large' : 'middle'}
          style={{ 
            borderRadius: 20,
            background: theme.gradient,
            border: 'none',
            height: isMobile ? 44 : 36,
            paddingLeft: 20,
            paddingRight: 20
          }}
          icon={<ThunderboltOutlined />}
        >
          充值
        </Button>
      </div>
    </Card>
  );
};

const PurchaseModal = ({ visible, onCancel, onConfirm }) => {
  const [selectedPackage, setSelectedPackage] = React.useState('single');
  const [showQRCode, setShowQRCode] = React.useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const packages = [
    { 
      id: 'single', 
      name: '单次体验', 
      count: 1, 
      price: 5,
      icon: <FireOutlined />,
      desc: '尝鲜首选'
    },
    { 
      id: 'discount', 
      name: '超值套餐', 
      count: 5, 
      price: 20, 
      tag: '省5元',
      icon: <ThunderboltOutlined />,
      desc: '限时优惠',
      recommended: true
    },
    { 
      id: 'value', 
      name: '豪华套餐', 
      count: 15, 
      price: 50, 
      tag: '省25元',
      icon: <CrownOutlined />,
      desc: '超值划算'
    },
  ];

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  const handlePayClick = () => {
    setShowQRCode(true);
  };

  const handleConfirmPayment = () => {
    setShowQRCode(false);
    onConfirm(selectedPackageData);
  };

  const handleCancelQR = () => {
    setShowQRCode(false);
  };

  if (showQRCode && selectedPackageData) {
    return (
      <Modal
        open={visible}
        onCancel={handleCancelQR}
        footer={null}
        width={isMobile ? '90%' : 400}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            📱 支付宝扫码付款
          </div>
          <div style={{ 
            background: '#fff', 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 16,
            border: '2px dashed #ffa502'
          }}>
            <div style={{ 
              width: 200, 
              height: 200, 
              background: '#f5f5f5', 
              margin: '0 auto',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 8,
              fontSize: 12,
              color: '#999'
            }}>
              {/* 请替换为你的支付宝收款码图片 */}
              <img 
                src="/alipay-qrcode.png" 
                alt="支付宝付款码" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span>请添加客服微信获取付款码</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            付款金额：<span style={{ color: theme.primary, fontWeight: 700, fontSize: 24 }}>¥{selectedPackageData.price}</span>
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
            付款完成后点击"我已付款"按钮
          </div>
          <Button 
            type="primary" 
            size="large"
            block
            onClick={handleConfirmPayment}
            style={{ 
              height: 48,
              borderRadius: 24,
              background: theme.gradient,
              border: 'none',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            ✅ 我已付款
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={<div style={{ textAlign: 'center', fontWeight: 600 }}>⚡ 充值次数</div>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? '90%' : 450}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {packages.map(pkg => (
          <div 
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            style={{ 
              padding: 16,
              borderRadius: 12,
              border: selectedPackage === pkg.id ? `2px solid ${theme.primary}` : '2px solid #f0f0f0',
              background: selectedPackage === pkg.id ? 'rgba(255, 71, 87, 0.05)' : 'white',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {pkg.recommended && (
              <div style={{
                position: 'absolute',
                top: -10,
                right: 16,
                background: theme.gradient,
                color: 'white',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 10,
                fontWeight: 500
              }}>
                推荐
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: pkg.recommended ? theme.gradient : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: pkg.recommended ? 'white' : '#666',
                  fontSize: 18
                }}>
                  {pkg.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#2d3436' }}>{pkg.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{pkg.desc}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>
                  ¥{pkg.price}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {pkg.count}次
                </div>
              </div>
            </div>
            {pkg.tag && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#ffa502',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: '0 12px 0 12px'
              }}>
                {pkg.tag}
              </div>
            )}
          </div>
        ))}
        
        <Button 
          type="primary" 
          size="large"
          block
          onClick={handlePayClick}
          style={{ 
            height: 48,
            borderRadius: 24,
            background: theme.gradient,
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            marginTop: 8
          }}
        >
          立即支付 ¥{selectedPackageData?.price || 0}
        </Button>
      </Space>
    </Modal>
  );
};

export { UsageDisplay, PurchaseModal };