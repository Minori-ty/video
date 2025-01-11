import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { errorHandler } from './middlewares/error';
import { requestLogger } from './middlewares/logger';
import { seed } from '../prisma/seed/seed';
import cookieParser from 'cookie-parser';
import { RequestHandler } from 'express';

const app = express();

// 中间件
app.use(
  cors({
    origin: 'http://localhost:3000', // 前端应用的URL
    credentials: true, // 允许携带凭证
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(requestLogger);
app.use(cookieParser() as unknown as RequestHandler);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  try {
    // 运行种子文件
    await seed();
    console.log(`服务器运行在 http://localhost:${PORT}`);
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
});
