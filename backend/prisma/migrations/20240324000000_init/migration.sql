-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "ConnectorProtocol" AS ENUM ('SFTP', 'FTP', 'FTPS');

-- CreateTable
CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connectors" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "protocol" "ConnectorProtocol" NOT NULL,
  "host" TEXT NOT NULL,
  "port" INTEGER NOT NULL,
  "username" TEXT NOT NULL,
  "secret_encrypted" TEXT NOT NULL,
  "secret_iv" TEXT NOT NULL,
  "secret_tag" TEXT NOT NULL,
  "private_key_encrypted" TEXT,
  "private_key_iv" TEXT,
  "private_key_tag" TEXT,
  "base_path" TEXT NOT NULL,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_permissions" (
  "id" UUID NOT NULL,
  "connector_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "can_read" BOOLEAN NOT NULL DEFAULT true,
  "can_write" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "connector_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "connector_id" UUID,
  "action" TEXT NOT NULL,
  "path" TEXT,
  "meta_json" JSONB,
  "ip" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "connector_permissions_connector_id_user_id_key" ON "connector_permissions"("connector_id", "user_id");

-- AddForeignKey
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_permissions" ADD CONSTRAINT "connector_permissions_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_permissions" ADD CONSTRAINT "connector_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
