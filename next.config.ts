import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sequelize require()s every dialect driver it supports (pg, tedious,
  // sqlite3, etc.); the bundler tries to statically resolve all of them
  // even though only mariadb is installed. Run it unbundled instead.
  serverExternalPackages: ["sequelize", "mariadb"],
};

export default nextConfig;
