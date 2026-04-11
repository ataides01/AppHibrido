import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_VACCINES = [
  {
    id: 'v1',
    name: 'COVID-19',
    manufacturer: 'Pfizer',
    doses: 'Reforço conforme calendário',
    category: 'geral',
    status: 'disponivel',
  },
  {
    id: 'v2',
    name: 'Influenza',
    manufacturer: 'Butantan',
    doses: 'Anual',
    category: 'idoso',
    status: 'disponivel',
  },
  {
    id: 'v3',
    name: 'Hepatite B',
    manufacturer: 'Fiocruz',
    doses: '3 doses',
    category: 'infantil',
    status: 'disponivel',
  },
  {
    id: 'v4',
    name: 'Febre amarela',
    manufacturer: 'Bio-Manguinhos',
    doses: 'Dose única + reforço se necessário',
    category: 'geral',
    status: 'disponivel',
  },
  {
    id: 'v5',
    name: 'Tríplice viral',
    manufacturer: 'SUS',
    doses: '2 doses',
    category: 'infantil',
    status: 'esgotado',
  },
] as const;

const DEFAULT_POSTOS = [
  {
    id: 'p1',
    name: 'ESF Barra Nova',
    address: 'Av. Litorânea, s/n — Barra Nova',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9292,
    lng: -42.5035,
    vaccineIds: ['v1', 'v2', 'v3', 'v4'],
  },
  {
    id: 'p2',
    name: 'ESF Bacaxá',
    address: 'Rua Alfredo Menezes, 980 — Bacaxá',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9195,
    lng: -42.5178,
    vaccineIds: ['v1', 'v2', 'v4'],
  },
  {
    id: 'p3',
    name: 'UBS Geraldo Ferreira de Souza',
    address: 'Rua Alfredo Menezes, 981 — Bacaxá',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9193,
    lng: -42.5181,
    vaccineIds: ['v2', 'v3', 'v5'],
  },
  {
    id: 'p4',
    name: 'ESF Jaconé (José Pereira de Brito)',
    address: 'Rua 97, 798 — Jaconé',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9405,
    lng: -42.489,
    vaccineIds: ['v1', 'v2', 'v3', 'v4'],
  },
  {
    id: 'p5',
    name: 'ESF Vilatur',
    address: 'Av. Praia Ponta de Itapajé — Vilatur',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.908,
    lng: -42.528,
    vaccineIds: ['v1', 'v2', 'v3', 'v5'],
  },
] as const;

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const pacHash = await bcrypt.hash('123456', 10);

  await prisma.historyEntry.deleteMany();
  await prisma.favoritePosto.deleteMany();
  await prisma.postoVaccine.deleteMany();
  await prisma.posto.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: 'u-admin',
        email: 'admin@easyvacc.br',
        passwordHash: adminHash,
        name: 'Administrador EasyVacc',
        role: 'admin',
      },
      {
        id: 'u-pac',
        email: 'paciente@easyvacc.br',
        passwordHash: pacHash,
        name: 'Maria Paciente',
        role: 'paciente',
        cidade: 'Saquarema',
        uf: 'RJ',
      },
    ],
  });

  await prisma.vaccine.createMany({ data: [...DEFAULT_VACCINES] });

  for (const p of DEFAULT_POSTOS) {
    await prisma.posto.create({
      data: {
        id: p.id,
        name: p.name,
        address: p.address,
        cidade: p.cidade,
        uf: p.uf,
        lat: p.lat,
        lng: p.lng,
        vaccines: {
          create: p.vaccineIds.map((vaccineId) => ({ vaccineId })),
        },
      },
    });
  }

  await prisma.employee.createMany({
    data: [
      {
        id: 'e1',
        name: 'João Silva',
        cargo: 'Enfermeiro',
        cpf: '000.000.000-00',
        phone: '(22) 90000-0001',
      },
      {
        id: 'e2',
        name: 'Ana Souza',
        cargo: 'Técnica de enfermagem',
        cpf: '111.111.111-11',
        phone: '(22) 90000-0002',
      },
    ],
  });

  console.log('Seed OK — admin@easyvacc.br / admin123, paciente@easyvacc.br / 123456');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
