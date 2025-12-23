# Cloud FTP Platform

Plateforme "Cloud for FTP" sécurisée pour gérer des fichiers sur des serveurs FTP/SFTP/FTPS.

## ✅ Fonctionnalités
- Authentification JWT + refresh tokens (cookies httpOnly)
- Rôles: ADMIN, MANAGER, USER
- Connecteurs FTP/SFTP/FTPS avec secrets chiffrés (AES-256-GCM)
- Gestion des fichiers: lister, téléverser, télécharger, renommer, déplacer, supprimer, créer dossier
- Journaux d’audit détaillés
- Interface propre (Bootstrap 5, français)

## Démarrage rapide

```bash
cp .env.example .env
```

```bash
docker compose up --build
```

## Initialiser la base de données

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## Création du premier admin

Le script de seed (`backend/prisma/seed.ts`) crée un utilisateur admin à partir des variables :

```
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

## Sécurité
- Préférez **SFTP** ou **FTPS**.
- Les secrets des connecteurs sont chiffrés avec `CONNECTOR_MASTER_KEY`.
- Protection CSRF avec double-submit cookie.

## Exemples d’URLs
- Frontend: http://localhost:5173
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## Migrations

```bash
cd backend
npx prisma migrate deploy
```

## Dossiers
- `backend/`: API Express + Prisma
- `frontend/`: React + Vite
- `nginx/`: reverse proxy

## Captures d’écran
- `docs/screenshots/login.png`
- `docs/screenshots/dashboard.png`

