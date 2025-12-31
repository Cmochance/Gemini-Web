# Gemini Web - API 接口文档

## 📡 后端 API 完整列表

**基础URL**: `http://localhost:31001`
**API版本**: v1
**前缀**: `/api/v1`

---

## ✅ 接口测试状态

| 接口 | 状态 | 说明 |
|------|------|------|
| 健康检查 | ✅ 正常 | GET /health |
| 用户登录 | ✅ 正常 | POST /api/v1/user/login |
| 用户注册 | ✅ 正常 | POST /api/v1/user/register |
| 用户信息 | ✅ 正常 | GET /api/v1/user/profile |
| 用户积分 | ✅ 正常 | GET /api/v1/user/integral |
| 模型列表 | ✅ 正常 | GET /api/v1/openai/v1/models |
| 聊天配置 | ✅ 正常 | GET /api/v1/openai/v1/config |

---

## 🔐 认证相关 (Auth Routes)

**前缀**: `/api/v1/user`

### 1. 用户登录
```
POST /api/v1/user/login
```
- **限流**: 5次/分钟
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "data": "eyJhbGciOiJIUzI1NiIs...",
    "msg": "登录成功"
  }
  ```
- **Cookie**: 自动设置 `authorization` cookie (HttpOnly, 7天)

---

### 2. 用户注册
```
POST /api/v1/user/register
```
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "code": "123456",
    "inviteCode": "ABC123"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "data": "eyJhbGciOiJIUzI1NiIs...",
    "msg": "注册成功"
  }
  ```

---

### 3. 发送验证码
```
POST /api/v1/user/verify/send_code
```
- **限流**: 1次/分钟
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "type": "register"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "data": null,
    "msg": "验证码已发送"
  }
  ```

---

### 4. 用户登出
```
POST /api/v1/user/logout
```
- **响应**:
  ```json
  {
    "code": 0,
    "data": null,
    "msg": "登出成功"
  }
  ```

---

## 👤 用户信息 (User Routes)

**前缀**: `/api/v1/user`
**所有接口需要认证**: `Authorization: Bearer {token}`

### 5. 获取用户资料
```
GET /api/v1/user/profile
```
- **响应**:
  ```json
  {
    "code": 0,
    "data": {
      "avatar": "/author.jpg",
      "name": "用户昵称",
      "email": "user@example.com",
      "description": "个人简介",
      "integral": 999999999,
      "inviteCode": "ABC123",
      "vipUser": true
    },
    "msg": "success"
  }
  ```

---

### 6. 更新用户资料
```
PUT /api/v1/user/profile
```
- **请求体**:
  ```json
  {
    "nickName": "新昵称",
    "avatar": "/path/to/avatar.jpg",
    "description": "新的个人简介"
  }
  ```

---

### 7. 获取用户积分
```
GET /api/v1/user/integral
```
- **响应**:
  ```json
  {
    "code": 0,
    "data": {
      "integral": 999999999
    },
    "msg": "success"
  }
  ```

---

### 8. 获取用户列表 (管理员)
```
GET /api/v1/user/list?page=1&size=20&search=keyword
```
- **权限**: 管理员
- **查询参数**:
  - `page`: 页码 (默认 1)
  - `size`: 每页数量 (默认 20, 最大 100)
  - `search`: 搜索关键词 (邮箱)

---

### 9. 设置用户VIP状态 (管理员)
```
PUT /api/v1/user/:userId/free
```
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "vipUser": true
  }
  ```

---

### 10. 设置用户管理员权限 (管理员)
```
PUT /api/v1/user/:userId/admin
```
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "isAdmin": true
  }
  ```

---

### 11. 给用户添加积分 (管理员)
```
POST /api/v1/user/:userId/integral
```
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "amount": 100,
    "remark": "活动奖励"
  }
  ```

---

## 🤖 聊天/AI 相关 (Chat Routes)

**前缀**: `/api/v1/openai/v1`

### 12. 获取可用模型列表
```
GET /api/v1/openai/v1/models
```
- **认证**: 可选
- **响应**:
  ```json
  {
    "code": 0,
    "data": {
      "object": "list",
      "data": [
        {
          "id": "gemini-3-flash",
          "object": "model",
          "owned_by": "google",
          "type": "chat",
          "supportsStream": true
        },
        {
          "id": "gemini-3-pro-high",
          "object": "model",
          "type": "chat"
        },
        {
          "id": "gemini-3-pro-image",
          "type": "image"
        }
      ]
    }
  }
  ```

---

### 13. 获取聊天配置
```
GET /api/v1/openai/v1/config
```
- **认证**: 可选
- **响应**:
  ```json
  {
    "code": 0,
    "data": {
      "baseURL": "https://api.openai.com/v1",
      "hasApiKey": true
    }
  }
  ```

---

### 14. 聊天对话 (流式输出)
```
POST /api/v1/openai/v1/chat/completions
```
- **认证**: 必需
- **限流**: 20次/分钟
- **Content-Type**: `application/json`
- **响应类型**: `application/octet-stream` (流式)
- **请求体**:
  ```json
  {
    "model": "gemini-3-pro-high",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "stream": true
  }
  ```

---

### 15. 生成图片
```
POST /api/v1/openai/v1/image
```
- **认证**: 必需
- **限流**: 20次/分钟
- **请求体**:
  ```json
  {
    "model": "gemini-3-pro-image",
    "prompt": "一只可爱的猫咪",
    "size": "1024x1024"
  }
  ```

---

### 16. 图片操作 (Midjourney)
```
POST /api/v1/openai/v1/image/operate
```
- **认证**: 必需
- **限流**: 20次/分钟
- **请求体**:
  ```json
  {
    "taskId": "task_123",
    "operate": "upscale",
    "index": 1
  }
  ```

---

## 💰 积分相关 (Integral Routes)

**前缀**: `/api/v1/integral`
**所有接口需要认证**

### 17. 积分充值
```
POST /api/v1/integral/recharge
```
- **请求体**:
  ```json
  {
    "key": "RECHARGE-KEY-12345"
  }
  ```

---

### 18. 获取积分余额
```
GET /api/v1/integral/balance
```
- **响应**:
  ```json
  {
    "code": 0,
    "data": {
      "integral": 999999999
    }
  }
  ```

---

## 💳 支付相关 (Payment Routes)

**前缀**: `/api/v1/pay`
**所有接口需要认证** (除通知回调)

### 19. 创建订单
```
POST /api/v1/pay/pre_create
```
- **限流**: 10次/分钟
- **请求体**:
  ```json
  {
    "productId": 1,
    "amount": 100,
    "channel": "alipay"
  }
  ```

---

### 20. 查询订单状态
```
GET /api/v1/pay/status?orderId=123
```

---

### 21. 确认支付
```
POST /api/v1/pay/confirm
```
- **请求体**:
  ```json
  {
    "orderId": 123
  }
  ```

---

### 22. 支付通知回调 (支付宝)
```
POST /api/v1/pay/notify
```
- **认证**: 不需要 (支付宝签名验证)

---

## ⚙️ 配置管理 (Config Routes)

**前缀**: `/api/v1/config`
**所有接口需要管理员权限**

### 23. 获取 OpenAI 配置
```
GET /api/v1/config/openai
```

---

### 24. 更新 OpenAI 配置
```
PUT /api/v1/config/openai
```
- **请求体**:
  ```json
  {
    "apiKey": "sk-...",
    "baseURL": "https://api.openai.com/v1"
  }
  ```

---

### 25. 获取 SMTP 配置
```
GET /api/v1/config/smtp
```

---

### 26. 更新 SMTP 配置
```
PUT /api/v1/config/smtp
```
- **请求体**:
  ```json
  {
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "email@gmail.com",
    "pass": "app-password"
  }
  ```

---

### 27. 测试 SMTP 配置
```
POST /api/v1/config/smtp/test
```
- **请求体**:
  ```json
  {
    "email": "test@example.com"
  }
  ```

---

## 🔑 认证机制

### JWT Token
- **Header**: `Authorization: Bearer {token}`
- **Cookie**: `authorization={token}` (HttpOnly)
- **过期时间**: 7天
- **Payload**:
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```

---

## 📊 响应格式

### 成功响应
```json
{
  "code": 0,
  "data": { /* 响应数据 */ },
  "msg": "success"
}
```

### 失败响应
```json
{
  "code": 400,
  "data": null,
  "msg": "错误信息"
}
```

---

## ⚡ 限流规则

| 接口类型 | 限制 |
|---------|------|
| 登录 | 5次/分钟 |
| 发送验证码 | 1次/分钟 |
| 聊天/图片生成 | 20次/分钟 |
| 支付 | 10次/分钟 |

---

## 🧪 测试账号

### 管理员账号
- **邮箱**: cmc@mochance.xyz
- **密码**: chxy337338
- **积分**: 999,999,999 (无限)
- **权限**: VIP + 管理员

### 测试账号
- **邮箱**: test@example.com
- **密码**: test123456
- **积分**: 100

---

## 📝 注意事项

1. **根路径访问**: 直接访问 `http://localhost:31001` 会返回 404，这是正常的
2. **CORS**: 前端请求需要通过 Next.js API 代理 (`/pages/api/[...all].ts`)
3. **流式输出**: 聊天接口使用 `application/octet-stream` 支持实时流式响应
4. **Cookie + Token**: 支持两种认证方式，优先使用 Cookie

---

最后更新: 2025-12-31
