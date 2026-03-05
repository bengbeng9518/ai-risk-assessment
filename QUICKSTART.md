# 快速启动指南

## 前置要求

- Node.js (v16 或更高版本)
- npm 或 yarn

## 安装步骤

### 1. 安装前端依赖

在项目根目录下运行：

```bash
cd ai-replacement-risk
npm install
```

### 2. 安装后端依赖

在项目根目录下运行：

```bash
npm install express cors
```

或者使用 server-package.json：

```bash
npm install --package-lock-only
```

## 运行项目

### 方法一：分别启动（推荐）

#### 启动后端服务器

在项目根目录下运行：

```bash
node server.js
```

后端服务将在 http://localhost:3001 运行

#### 启动前端开发服务器

在项目根目录下运行：

```bash
cd ai-replacement-risk
npm run dev
```

前端服务将在 http://localhost:3000 运行

### 方法二：使用 PowerShell 同时启动（Windows）

创建一个 `start.bat` 文件：

```batch
@echo off
start "Backend Server" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /k "cd ai-replacement-risk && npm run dev"
```

双击运行 `start.bat` 即可同时启动前后端服务。

## 访问应用

打开浏览器访问：http://localhost:3000

## 功能测试

1. **职业评估**
   - 选择一个职业（如：软件工程师）
   - 点击"评估风险"按钮
   - 查看评估结果

2. **AI分析**
   - 在评估结果页面点击"开始AI分析"
   - 查看AI生成的深度分析

3. **购买次数**
   - 点击"购买次数"按钮
   - 选择套餐
   - 完成模拟支付

4. **移动端测试**
   - 使用浏览器的开发者工具切换到移动设备视图
   - 测试响应式布局

## 常见问题

### 问题1：npm install 失败

**解决方案**：
- 检查网络连接
- 尝试使用淘宝镜像：`npm install --registry=https://registry.npmmirror.com`
- 清除缓存：`npm cache clean --force`

### 问题2：端口被占用

**解决方案**：
- 修改 `server.js` 中的端口号
- 修改 `vite.config.js` 中的端口号

### 问题3：支付窗口无法打开

**解决方案**：
- 检查浏览器是否阻止弹窗
- 允许 localhost 的弹窗

### 问题4：API请求失败

**解决方案**：
- 确保后端服务器正在运行
- 检查 CORS 配置
- 查看浏览器控制台的错误信息

## 开发工具推荐

- **代码编辑器**：VS Code
- **浏览器**：Chrome / Firefox
- **API测试**：Postman / Thunder Client
- **移动端测试**：Chrome DevTools / 真机调试

## 项目结构说明

```
ai-replacement-risk/
├── src/
│   ├── components/       # React组件
│   ├── data/           # 职业数据
│   ├── services/        # API服务
│   ├── utils/          # 工具函数
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 入口文件
│   └── index.css       # 全局样式
├── server.js           # 后端服务器
├── package.json        # 前端依赖
├── vite.config.js      # Vite配置
└── index.html         # HTML模板
```

## 下一步

- [ ] 添加更多职业数据
- [ ] 集成真实的AI大模型API
- [ ] 接入真实的支付接口
- [ ] 添加用户认证
- [ ] 实现数据持久化
- [ ] 部署到生产环境

## 技术支持

如有问题，请查看：
- 项目文档：`AI替代风险评估系统开发文档.md`
- AI集成方案：`AI大模型集成方案.md`
- 移动端适配：`移动端适配实现方案.md`
- 支付集成：`使用次数管理与支付集成实现方案.md`