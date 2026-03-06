# EdgeOne Functions 部署指南

## 文件结构

已创建 `node-functions/` 目录，包含：

```
node-functions/
├── api/
│   └── analyze.js    # AI分析API函数
└── package.json
```

## 部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: add EdgeOne Functions for AI API"
git push origin main
```

### 2. 在 EdgeOne 控制台配置

1. 登录 [EdgeOne 控制台](https://console.edgeone.ai/)
2. 进入你的站点 → **函数** → **Node Functions**
3. 选择 Git 仓库和分支
4. 配置函数：
   - 入口文件: `node-functions/api/analyze.js`
   - 路由: `/api/ai/analyze`
   - 方法: POST

### 3. 配置完成

部署后，前端请求 `/api/ai/analyze` 将自动路由到 EdgeOne Functions。

## 本地测试

如果需要在本地测试，可以使用：

```bash
# 启动本地后端
node server.cjs
```

然后在前端设置环境变量：
```
VITE_API_BASE_URL=http://localhost:3001
```
