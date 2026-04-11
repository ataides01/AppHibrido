import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { userToPublic } from '../lib/dto.js';

const registerBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const parsed = registerBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos.', details: parsed.error.flatten() });
    }
    const { name, email, password } = parsed.data;
    const em = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: em } });
    if (exists) {
      return reply.status(409).send({ error: 'Este e-mail já está cadastrado.' });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: em,
        passwordHash,
        name: name.trim(),
        role: 'paciente',
        mustChangePassword: false,
      },
      include: { employee: true },
    });
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return reply.status(201).send({
      token,
      user: userToPublic(user),
    });
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos.' });
    }
    const { email, password } = parsed.data;
    const em = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: em },
      include: { employee: true },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.status(401).send({ error: 'E-mail ou senha inválidos.' });
    }
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return reply.send({
      token,
      user: userToPublic(user),
      mustChangePassword: user.mustChangePassword === true,
    });
  });
};
