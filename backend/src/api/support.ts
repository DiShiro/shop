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
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (user?.role !== 'admin') {
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
        },
      },
    });
    res.json(usersWithMessages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.post('/admin/reply', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (user?.role !== 'admin') {
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

export default router;