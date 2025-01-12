# API 接口文档

## 认证相关接口

### 用户注册

- 请求地址：`POST /api/auth/register`
- 请求参数：
  ```typescript
  {
    username: string; // 用户名，2-20位，只能包含字母、数字、下划线和横线
    email: string; // 邮箱地址
    password: string; // 密码
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
  - `400` - 请求参数错误（用户名或密码格式不正确）
  - `409` - 用户名或邮箱已存在

### 用户登录

- 请求地址：`POST /api/auth/login`
- 请求参数：
  ```typescript
  {
    username: string; // 用户名或邮箱
    password: string; // 密码
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
    lastLoginAt: string; // 最后登录时间
    createdAt: string; // 创建时间
    firstName: string | null; // 名
    lastName: string | null; // 姓
    phoneNumber: string | null; // 电话号码
    dateOfBirth: string | null; // 出生日期
    gender: string | null; // 性别
    address: string | null; // 地址
    profilePicture: string | null; // 头像URL
    bio: string | null; // 个人简介
    timezone: string | null; // 时区
  }
  ```
- 错误响应：
  - `401` - 未认证

### 搜索用户

- 请求地址：`GET /api/users/search`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员或超级管理员权限
  ```
- 查询参数：
  ```
  keyword: string;    // 搜索关键词
  page: number;       // 页码，默认1
  pageSize: number;   // 每页数量，默认10
  ```
- 响应数据：
  ```typescript
  {
    total: number; // 总用户数
    page: number; // 当前页码
    pageSize: number; // 每页数量
    totalPages: number; // 总页数
    items: Array<{
      id: string; // 用户ID
      email: string; // 邮箱地址
      name: string; // 用户名
      role: string; // 用户角色
      lastLoginAt: string | null; // 最后登录时间
      createdAt: string; // 创建时间
      firstName: string | null; // 名
      lastName: string | null; // 姓
      phoneNumber: string | null; // 电话号码
      profilePicture: string | null; // 头像URL
    }>;
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限

### 获取用户列表

- 请求地址：`GET /api/users`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员或超级管理员权限
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
    totalPages: number; // 总页数
    items: Array<{
      id: string; // 用户ID
      email: string; // 邮箱地址
      name: string; // 用户名
      role: string; // 用户角色
      createdAt: string; // 创建时间
    }>;
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限

### 获取用户详情

- 请求地址：`GET /api/users/:id`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员或超级管理员权限
  ```
- 响应数据：
  ```typescript
  {
    id: string; // 用户ID
    email: string; // 邮箱地址
    name: string; // 用户名
    role: string; // 用户角色
    lastLoginAt: string | null; // 最后登录时间
    createdAt: string; // 创建时间
    firstName: string | null; // 名
    lastName: string | null; // 姓
    phoneNumber: string | null; // 电话号码
    dateOfBirth: string | null; // 出生日期
    gender: string | null; // 性别
    address: string | null; // 地址
    profilePicture: string | null; // 头像URL
    bio: string | null; // 个人简介
    timezone: string | null; // 时区
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在

### 更新用户信息

- 请求地址：`PATCH /api/users/:id`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员或超级管理员权限
  ```
- 请求参数：
  ```typescript
  {
    firstName?: string; // 名，最多50个字符
    lastName?: string; // 姓，最多50个字符
    phoneNumber?: string; // 电话号码，必须是有效的手机号
    dateOfBirth?: string; // 出生日期，ISO日期时间格式
    gender?: 'MALE' | 'FEMALE' | 'OTHER'; // 性别
    address?: string; // 地址，最多200个字符
    profilePicture?: string; // 头像URL
    bio?: string; // 个人简介，最多500个字符
    timezone?: string; // 时区
    role?: 'USER' | 'ADMIN'; // 用户角色
  }
  ```
- 响应数据：与获取用户详情接口相同
- 错误响应：
  - `400` - 请求参数错误
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在

### 删除用户

- 请求地址：`DELETE /api/users/:id`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要超级管理员权限
  ```
- 响应状态码：`204`
- 错误响应：
  - `401` - 未认证
  - `403` - 无权限（非超级管理员或尝试删除超级管理员）
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
    oldPassword: string; // 原密码
    newPassword: string; // 新密码，6-32位
  }
  ```
- 响应状态码：`204`
- 错误响应：
  - `400` - 新密码格式不正确
  - `401` - 未认证或原密码错误

### 重置用户密码

- 请求地址：`PATCH /api/users/:id/password`
- 请求头：
  ```
  Authorization: Bearer <token>  // 需要管理员或超级管理员权限
  ```
- 请求参数：
  ```typescript
  {
    password: string; // 新密码，6-32位
  }
  ```
- 响应状态码：`204`
- 错误响应：
  - `400` - 新密码格式不正确
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 用户不存在

## 视频相关接口

### 上传视频

- 请求地址：`POST /api/videos/upload`
- 请求头：
  ```
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  ```
- 请求参数：
  ```typescript
  {
    file: File; // 视频文件，大小限制100MB，字段名必须为 'file'
    title: string; // 视频标题，不能为空
  }
  ```
- 响应状态码：
  - `201` - 上传成功
  - `400` - 请求参数错误
  - `401` - 未认证
  - `500` - 服务器错误
- 响应数据：
  ```typescript
  {
    id: string; // 视频ID
    title: string; // 视频标题
    url: string; // 视频URL
    userId: string; // 上传用户ID
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
  }
  ```
- 错误响应：
  - `400` - 请求参数错误（未上传文件或未提供标题）
  - `401` - 未认证
  - `500` - 上传失败

### 获取用户视频列表

- 请求地址：`GET /api/videos/user`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 响应状态码：
  - `200` - 获取成功
  - `401` - 未认证
  - `500` - 服务器错误
- 响应数据：
  ```typescript
  Array<{
    id: string; // 视频ID
    title: string; // 视频标题
    url: string; // 视频URL
    userId: string; // 上传用户ID
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
  }>;
  ```
- 错误响应：
  - `401` - 未认证
  - `500` - 获取失败

### 获取所有视频列表

- 请求地址：`GET /api/videos`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 响应状态码：
  - `200` - 获取成功
  - `401` - 未认证
  - `500` - 服务器错误
- 响应数据：
  ```typescript
  Array<{
    id: string; // 视频ID
    title: string; // 视频标题
    url: string; // 视频URL
    userId: string; // 上传用户ID
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
  }>;
  ```
- 错误响应：
  - `401` - 未认证
  - `500` - 获取失败

### 删除视频

- 请求地址：`DELETE /api/videos/:id`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 路径参数：
  - `id` - 视频ID
- 响应状态码：
  - `200` - 删除成功
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 资源不存在
  - `500` - 服务器错误
- 响应数据：
  ```typescript
  {
    success: true;
  }
  ```
- 错误响应：
  - `401` - 未认证
  - `403` - 无权删除此视频（非视频上传者）
  - `404` - 视频不存在
  - `500` - 删除失败

### 更新视频信息

- 请求地址：`PATCH /api/videos/:id`
- 请求头：
  ```
  Authorization: Bearer <token>
  ```
- 路径参数：
  - `id` - 视频ID
- 请求参数：
  ```typescript
  {
    title: string; // 视频标题，不能为空
    description?: string; // 视频描述（可选）
  }
  ```
- 响应状态码：
  - `200` - 更新成功
  - `400` - 请求参数错误
  - `401` - 未认证
  - `403` - 无权限
  - `404` - 资源不存在
  - `500` - 服务器错误
- 响应数据：
  ```typescript
  {
    id: string; // 视频ID
    title: string; // 视频标题
    description: string | null; // 视频描述
    url: string; // 视频URL
    userId: string; // 上传用户ID
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
  }
  ```
- 错误响应：
  - `400` - 请求参数错误（标题为空）
  - `401` - 未认证
  - `403` - 无权修改此视频（非视频上传者）
  - `404` - 视频不存在
  - `500` - 更新失败
