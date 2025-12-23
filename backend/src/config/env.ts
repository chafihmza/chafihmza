import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CONNECTOR_MASTER_KEY'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env var ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  connectorMasterKey: process.env.CONNECTOR_MASTER_KEY as string,
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 200),
  appVersion: process.env.APP_VERSION ?? '1.0.0'
};
