import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { employeeToDto, postoToDto, vaccineToDto } from '../lib/dto.js';
import { generateProvisionalPassword, hashPassword } from '../lib/password.js';

const vaccineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  manufacturer: z.string().min(1),
  doses: z.string(),
  category: z.string(),
  status: z.string(),
});

const postoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string(),
  cidade: z.string(),
  uf: z.string(),
  lat: z.number(),
  lng: z.number(),
  vaccineIds: z.array(z.string()),
});

const createEmployeeBody = z.object({
  name: z.string().min(1),
  cargo: z.string(),
  cpf: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

function requireAdmin(request: { user: { role: string } }, reply: { status: (n: number) => { send: (b: unknown) => unknown } }) {
  if (request.user.role !== 'admin') {
    reply.status(403).send({ error: 'Acesso restrito a administradores.' });
    return false;
  }
  return true;
}

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get('/vaccines', async (_request, reply) => {
    const list = await prisma.vaccine.findMany({ orderBy: { name: 'asc' } });
    return reply.send({ vaccines: list.map(vaccineToDto) });
  });

  app.put('/vaccines', { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const parsed = z.array(vaccineSchema).safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Lista de vacinas inválida.' });
    }
    const body = parsed.data;
    const nextIds = new Set(body.map((v) => v.id));
    const existing = await prisma.vaccine.findMany({ select: { id: true } });
    const toRemove = existing.map((e) => e.id).filter((id) => !nextIds.has(id));
    await prisma.$transaction(async (tx) => {
      if (toRemove.length) {
        await tx.postoVaccine.deleteMany({ where: { vaccineId: { in: toRemove } } });
        await tx.vaccine.deleteMany({ where: { id: { in: toRemove } } });
      }
      for (const v of body) {
        await tx.vaccine.upsert({
          where: { id: v.id },
          create: {
            id: v.id,
            name: v.name,
            manufacturer: v.manufacturer,
            doses: v.doses,
            category: v.category,
            status: v.status,
          },
          update: {
            name: v.name,
            manufacturer: v.manufacturer,
            doses: v.doses,
            category: v.category,
            status: v.status,
          },
        });
      }
    });
    const list = await prisma.vaccine.findMany({ orderBy: { name: 'asc' } });
    return reply.send({ vaccines: list.map(vaccineToDto) });
  });

  app.get('/postos', async (_request, reply) => {
    const list = await prisma.posto.findMany({
      include: { vaccines: true },
      orderBy: { name: 'asc' },
    });
    return reply.send({ postos: list.map(postoToDto) });
  });

  app.put('/postos', { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const parsed = z.array(postoSchema).safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Lista de postos inválida.' });
    }
    const body = parsed.data;
    const nextIds = new Set(body.map((p) => p.id));
    const existing = await prisma.posto.findMany({ select: { id: true } });
    const toRemove = existing.map((e) => e.id).filter((id) => !nextIds.has(id));
    await prisma.$transaction(async (tx) => {
      if (toRemove.length) {
        await tx.postoVaccine.deleteMany({ where: { postoId: { in: toRemove } } });
        await tx.favoritePosto.deleteMany({ where: { postoId: { in: toRemove } } });
        await tx.posto.deleteMany({ where: { id: { in: toRemove } } });
      }
      for (const p of body) {
        await tx.posto.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            name: p.name,
            address: p.address,
            cidade: p.cidade,
            uf: p.uf,
            lat: p.lat,
            lng: p.lng,
          },
          update: {
            name: p.name,
            address: p.address,
            cidade: p.cidade,
            uf: p.uf,
            lat: p.lat,
            lng: p.lng,
          },
        });
        await tx.postoVaccine.deleteMany({ where: { postoId: p.id } });
        const vids = [...new Set(p.vaccineIds)];
        if (vids.length) {
          await tx.postoVaccine.createMany({
            data: vids.map((vaccineId) => ({
              postoId: p.id,
              vaccineId,
            })),
          });
        }
      }
    });
    const list = await prisma.posto.findMany({
      include: { vaccines: true },
      orderBy: { name: 'asc' },
    });
    return reply.send({ postos: list.map(postoToDto) });
  });

  app.get('/employees', { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const list = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
    return reply.send({ employees: list.map(employeeToDto) });
  });

  app.post('/employees/with-login', { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const parsed = createEmployeeBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados do funcionário inválidos.' });
    }
    const { name, cargo, cpf, phone, email } = parsed.data;
    const em = email.trim().toLowerCase();
    if (!em.includes('@')) {
      return reply.status(400).send({ error: 'Informe um e-mail válido para o acesso.' });
    }
    const taken = await prisma.user.findUnique({ where: { email: em } });
    if (taken) {
      return reply.status(409).send({ error: 'Este e-mail já está cadastrado.' });
    }
    const provisional = generateProvisionalPassword();
    const passwordHash = await hashPassword(provisional);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: em,
          passwordHash,
          name: name.trim(),
          role: 'funcionario',
          mustChangePassword: true,
        },
      });
      const employee = await tx.employee.create({
        data: {
          name: name.trim(),
          cargo: cargo.trim(),
          cpf: cpf.trim() || '—',
          phone: phone.trim() || '—',
          userId: user.id,
          loginEmail: em,
        },
      });
      return { user, employee };
    });
    return reply.status(201).send({
      employee: employeeToDto(result.employee),
      provisionalPassword: provisional,
    });
  });

  app.delete('/employees/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = (request.params as { id: string }).id;
    const e = await prisma.employee.findUnique({ where: { id } });
    if (!e) return reply.status(404).send({ error: 'Funcionário não encontrado.' });
    if (e.userId) {
      await prisma.user.delete({ where: { id: e.userId } });
    } else {
      await prisma.employee.delete({ where: { id } });
    }
    return reply.status(204).send();
  });
};
