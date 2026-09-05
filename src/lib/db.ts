import { Sequelize } from "sequelize";

// Next.js dev mode can re-evaluate this module on every request; cache the
// instance on globalThis so we don't open a new connection pool each time.
const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      dialect: "mariadb",
      logging: false,
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
