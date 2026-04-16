import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = express.Router();

router.get('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }
    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        userId,
        isAdmin: false,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/admin/users', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const usersWithMessages = await prisma.user.findMany({
      where: { supportMessages: { some: {} } },
      select: {
        id: true,
        username: true,
        supportMessages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });
    res.json(usersWithMessages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/admin/reply', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const { userId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }
    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        userId,
        isAdmin: true,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/messages/user/:userId', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const userIdParam = req.params.userId;
  if (!userIdParam) {
    return res.status(400).json({ error: 'ID пользователя не указан' });
  }
  const userId = parseInt(String(userIdParam), 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }
  try {
    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/admin/messages/:userId', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const userIdParam = req.params.userId;
  if (!userIdParam) {
    return res.status(400).json({ error: 'ID пользователя не указан' });
  }
  const userId = parseInt(String(userIdParam), 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }
  try {
    await prisma.supportMessage.deleteMany({
      where: { userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;