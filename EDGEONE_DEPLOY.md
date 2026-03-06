# EdgeOne Node Functions 部署指南

## 文件结构

已创建 Node Functions 代码：

```
node-functions/
└── api/
    └── ai/
        └── analyze.js   # POST /api/ai/analyze
```

## 路由映射

- 文件路径：`node-functions/api/ai/analyze.js`
- 访问路由：`/api/ai/analyze`

## 部署步骤

### 1. 推送代码到 GitHub

### 2. 在 EdgeOne 控制台启用 Node Functions
1. 登录 https://console.edgeone.ai/
2. 进入你的站点 → **函数** → **Node Functions**
3. 确保启用 Node Functions

### 3. 测试
访问：`https://niuma.tmd996.cn/api/ai/analyze`

返回 `{"error": "Missing assessment result"}` 即成功！

---

## Node Functions 限制
- **单次运行时长**: 120s（足够AI调用）
- **请求body**: 6MB
- **代码包**: 128MB
