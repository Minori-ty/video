# API 接口文档

## 认证相关接口

### 用户注册

- 请求地址：`POST /api/auth/register`
- 请求参数：
  ```typescript
  {
    username: string; // 用户名，2-20位，只能包含字母、数字、下划线和横线
    email: string; // 邮箱地址
    password: string; // RSA加密后的密码，原始密码要求6-32位
  }
  ```
- 响应数据：
  ```typescript
  {
    id: string; // 用户ID
    email: string; // 邮箱地址
    name: string; // 用户名
    role: string; // 用户角色，默认为 "USER"
  }
  ```
- 错误响应：
  - `400` - 请求参数错误（密码格式不正确）
  - `409` - 用户名或邮箱已存在

### 用户登录

- 请求地址：`POST /api/auth/login`
- 请求参数：
  ```typescript
  {
    username: string; // 用户名或邮箱
    password: string; // RSA加密后的密码
  }
  ```
- 响应数据：
  ```typescript
  {
    token: string; // JWT令牌
    user: {
      id: string; // 用户ID
      email: string; // 邮箱地址
      name: string; // 用户名
      role: string; // 用户角色
    }
  }
  ```
- 错误响应：
  - `400` - 请求参数错误
  - `401` - 密码错误
  - `404` - 用户不存在

## 用户相关接口

### 获取当前用户信息

- 请求地址：`GET /api/users/me`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 响应数据：
  ```typescript
  {
    id: string; // 用户ID
    email: string; // 邮箱地址
    name: string; // 用户名
    role: string; // 用户角色
  }
  ```
- 错误响应：
  - `401` - 未认证

### 获取用户列表

- 请求地址：`GET /api/users`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员权限
  ```
- 查询参数：
  ```
  page: number;      // 页码，默认1
  pageSize: number;  // 每页数量，默认10
  ```
- 响应数据：
  ```typescript
  {
    total: number; // 总用户数
    page: number; // 当前页码
    pageSize: number; // 每页数量
    items: Array<{
      id: string; // 用户ID
      email: string; // 邮箱地址
      name: string; // 用户名
      role: string; // 用户角色
    }>;
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限

### 更新用户角色

- 请求地址：`PATCH /api/users/:userId/role`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要超级管理员权限
  ```
- 请求参数：
  ```typescript
  {
    role: 'USER' | 'ADMIN'; // 新角色
  }
  ```
- 响应数据：
  ```typescript
  {
    id: string; // 用户ID
    email: string; // 邮箱地址
    name: string; // 用户名
    role: string; // 更新后的角色
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在

### 删除用户

- 请求地址：`DELETE /api/users/:userId`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要超级管理员权限
  ```
- 响应状态码：`204`
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在

### 修改密码

- 请求地址：`PATCH /api/users/me/password`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 请求参数：
  ```typescript
  {
    oldPassword: string; // RSA加密后的旧密码
    newPassword: string; // RSA加密后的新密码
  }
  ```
- 响应状态码：`204`
- 错误响应：
  - `401` - 未认证或旧密码错误
  - `400` - 新密码格式不正确

### 重置用户密码

- 请求地址：`PATCH /api/users/:userId/password`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员权限
  ```
- 请求参数：
  ```typescript
  {
    newPassword: string; // RSA加密后的新密码
  }
  ```
- 响应状态码：`204`
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在
  - `400` - 新密码格式不正确
