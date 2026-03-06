# EdgeOne Edge Functions 部署指南

## 文件结构

已创建 Edge Functions 代码：

```
edge-functions/
└── api/
    └── ai/
        └── analyze.js   # POST /api/ai/analyze/
```

## 路由映射

根据 EdgeOne 文档：
- 文件路径：`edge-functions/api/ai/analyze.js`
- 访问路由：`/api/ai/analyze/`（注意末尾斜杠）

## 部署步骤

### 1. 推送代码到 GitHub
代码已准备就绪，推送后 EdgeOne 会自动识别 `edge-functions` 目录。

### 2. 在 EdgeOne 控制台配置
1. 登录 https://console.edgeone.ai/
2. 进入 **Pages** 或 **函数** 页面
3. 确保启用 **Edge Functions**
4. 代码会自动部署

### 3. 测试
访问：`https://niuma.tmd996.cn/api/ai/analyze/`

返回 `{"error": "Missing assessment result"}` 即成功！

---

**注意**：Edge Functions CPU 时间限制 **200ms**，AI 调用可能超时。如遇超时，建议换用 **Node Functions**（支持更长计算时间）。
