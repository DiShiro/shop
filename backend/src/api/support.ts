import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import prisma from '../db';

const router = express.Router();

// ---------- ПОЛЬЗОВАТЕЛЬ ----------
router.post('/tickets', authenticate, async (req: AuthRequest, res) => {
  try {
    const ticket = await prisma.ticket.create({
      data: { userId: req.user!.id, status: 'open' },
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания тикета' });
  }
});

router.get('/tickets', authenticate, async (req: AuthRequest, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка загрузки тикетов' });
  }
});

router.get('/tickets/:ticketId/messages', authenticate, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: req.user!.id },
    });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка загрузки сообщений' });
  }
});

router.post('/tickets/:ticketId/messages', authenticate, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  const { content } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ error: 'Сообщение не может быть пустым' });
  }
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: req.user!.id },
    });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        ticketId,
        userId: req.user!.id,
        isAdmin: false,
      },
    });
    if (ticket.status === 'closed') {
      await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'open' } });
    }
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

router.patch('/tickets/:ticketId/close', authenticate, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: req.user!.id },
    });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'closed' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка закрытия тикета' });
  }
});

// ---------- АДМИНИСТРАТОР ----------
router.get('/admin/tickets', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, username: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка загрузки тикетов' });
  }
});

router.get('/admin/tickets/:ticketId', authenticate, isAdmin, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, username: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка загрузки тикета' });
  }
});

router.post('/admin/tickets/:ticketId/reply', authenticate, isAdmin, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  const { content } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ error: 'Сообщение не может быть пустым' });
  }
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        ticketId,
        userId: req.user!.id,
        isAdmin: true,
      },
    });
    if (ticket.status === 'closed') {
      await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'open' } });
    }
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка отправки ответа' });
  }
});

router.patch('/admin/tickets/:ticketId/status', authenticate, isAdmin, async (req: AuthRequest, res) => {
  const ticketId = Number(req.params.ticketId);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: 'Неверный ID тикета' });
  }
  const { status } = req.body;
  if (!['open', 'in_progress', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' });
  }
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка изменения статуса' });
  }
});

export default router;