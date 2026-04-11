import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { historyToDto, userToPublic } from '../lib/dto.js';

function getUserId(request: { user: { sub: string } }): string {
  return request.user.sub;
}

const patchProfile = z.object({
  name: z.string().min(1).optional(),
  avatarUri: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
});

const firstPasswordBody = z.object({
  newPassword: z.string().min(6),
});

const historyBody = z.object({
  label: z.string().min(1),
});

const favoritesBody = z.object({
  ids: z.array(z.string()),
});

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: getUserId(request) },
      include: { employee: true },
    });
    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado.' });
    return reply.send({ user: userToPublic(user) });
  });

  app.patch('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = patchProfile.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos.' });
    }
    const uid = getUserId(request);
    const user = await prisma.user.update({
      where: { id: uid },
      data: parsed.data,
      include: { employee: true },
    });
    return reply.send({ user: userToPublic(user) });
  });

  app.post('/me/first-password', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = firstPasswordBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Use pelo menos 6 caracteres.' });
    }
    const uid = getUserId(request);
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user?.mustChangePassword) {
      return reply.status(400).send({ error: 'Não é necessário alterar a senha agora.' });
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    const updated = await prisma.user.update({
      where: { id: uid },
      data: { passwordHash, mustChangePassword: false },
      include: { employee: true },
    });
    return reply.send({ user: userToPublic(updated) });
  });

  app.post('/me/password', { onRequest: [app.authenticate] }, async (request, reply) => {
    const body = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
      .safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Dados inválidos.' });
    }
    const uid = getUserId(request);
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado.' });
    if (!(await verifyPassword(body.data.currentPassword, user.passwordHash))) {
      return reply.status(401).send({ error: 'Senha atual incorreta.' });
    }
    const passwordHash = await hashPassword(body.data.newPassword);
    const updated = await prisma.user.update({
      where: { id: uid },
      data: { passwordHash },
      include: { employee: true },
    });
    return reply.send({ user: userToPublic(updated) });
  });

  app.get('/me/favorites', { onRequest: [app.authenticate] }, async (request, reply) => {
    const uid = getUserId(request);
    const rows = await prisma.favoritePosto.findMany({
      where: { userId: uid },
      select: { postoId: true },
    });
    return reply.send({ ids: rows.map((r) => r.postoId) });
  });

  app.put('/me/favorites', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = favoritesBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Lista inválida.' });
    }
    const uid = getUserId(request);
    const ids = [...new Set(parsed.data.ids)];
    await prisma.$transaction([
      prisma.favoritePosto.deleteMany({ where: { userId: uid } }),
      prisma.favoritePosto.createMany({
        data: ids.map((postoId) => ({ userId: uid, postoId })),
      }),
    ]);
    return reply.send({ ids });
  });

  app.post('/me/favorites/toggle', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = z.object({ postoId: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'postoId obrigatório.' });
    const uid = getUserId(request);
    const { postoId } = parsed.data;
    const existing = await prisma.favoritePosto.findUnique({
      where: { userId_postoId: { userId: uid, postoId } },
    });
    if (existing) {
      await prisma.favoritePosto.delete({
        where: { userId_postoId: { userId: uid, postoId } },
      });
    } else {
      await prisma.favoritePosto.create({ data: { userId: uid, postoId } });
    }
    const rows = await prisma.favoritePosto.findMany({
      where: { userId: uid },
      select: { postoId: true },
    });
    return reply.send({ ids: rows.map((r) => r.postoId) });
  });

  app.get('/me/history', { onRequest: [app.authenticate] }, async (request, reply) => {
    const uid = getUserId(request);
    const list = await prisma.historyEntry.findMany({
      where: { userId: uid },
      orderBy: { at: 'desc' },
      take: 40,
    });
    return reply.send({ history: list.map(historyToDto) });
  });

  app.post('/me/history', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = historyBody.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Label inválida.' });
    const uid = getUserId(request);
    await prisma.historyEntry.create({
      data: { userId: uid, label: parsed.data.label.trim() },
    });
    const count = await prisma.historyEntry.count({ where: { userId: uid } });
    if (count > 40) {
      const overflow = await prisma.historyEntry.findMany({
        where: { userId: uid },
        orderBy: { at: 'asc' },
        take: count - 40,
        select: { id: true },
      });
      await prisma.historyEntry.deleteMany({
        where: { id: { in: overflow.map((x) => x.id) } },
      });
    }
    const list = await prisma.historyEntry.findMany({
      where: { userId: uid },
      orderBy: { at: 'desc' },
      take: 40,
    });
    return reply.status(201).send({ history: list.map(historyToDto) });
  });
};
