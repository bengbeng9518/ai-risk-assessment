# AI替代风险评估系统

基于评分卡模型的AI替代风险评估系统，帮助用户了解职业被AI替代的风险程度。

## 功能特性

- 职业风险评估
- AI智能分析
- 使用次数管理
- 支付功能
- 响应式设计（支持PC、平板、手机）

## 技术栈

- 前端：React + Vite + Ant Design
- 后端：Node.js + Express
- 图表：ECharts
- 响应式：react-responsive

## 安装依赖

### 前端

```bash
cd ai-replacement-risk
npm install
```

### 后端

```bash
npm install express cors
```

## 运行项目

### 启动后端服务器

```bash
node server.js
```

后端服务将在 http://localhost:3001 运行

### 启动前端开发服务器

```bash
npm run dev
```

前端服务将在 http://localhost:3000 运行

## 项目结构

```
ai-replacement-risk/
├── src/
│   ├── components/       # React组件
│   │   ├── CareerForm.jsx
│   │   ├── ResultDisplay.jsx
│   │   ├── AIAnalysis.jsx
│   │   └── UsageDisplay.jsx
│   ├── data/           # 数据文件
│   │   └── careers.js
│   ├── services/        # API服务
│   │   └── api.js
│   ├── utils/          # 工具函数
│   │   ├── assessment.js
│   │   └── usage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server.js           # 后端服务器
├── package.json
├── vite.config.js
└── index.html
```

## 使用说明

1. 选择一个职业
2. 点击"评估风险"按钮
3. 查看评估结果
4. 点击"AI智能分析"获取深度分析
5. 购买更多次数（如需要）

## 评估维度

- 任务自动化潜力
- 技能复杂度
- 数据可获得性
- 技术成熟度

## 收费模式

- 免费次数：5次
- 付费标准：5元/次
- 套餐优惠：
  - 单次购买：5元
  - 优惠套餐（5次）：20元（8折）
  - 超值套餐（15次）：50元（6.7折）

## 开发计划

- [x] 项目初始化
- [x] 核心评估算法实现
- [x] 基础前端界面
- [x] 移动端适配
- [x] AI功能集成
- [x] 使用次数管理
- [x] 支付功能
- [x] 后端API
- [ ] 测试和优化
- [ ] 部署上线

## 许可证

MIT
