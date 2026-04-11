-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "avatarUri" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "loginEmail" TEXT,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "doses" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Posto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "PostoVaccine" (
    "postoId" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,

    PRIMARY KEY ("postoId", "vaccineId"),
    CONSTRAINT "PostoVaccine_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "Posto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostoVaccine_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoritePosto" (
    "userId" TEXT NOT NULL,
    "postoId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "postoId"),
    CONSTRAINT "FavoritePosto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoritePosto_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "Posto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "HistoryEntry_userId_at_idx" ON "HistoryEntry"("userId", "at");
