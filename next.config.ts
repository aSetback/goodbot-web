import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sequelize require()s every dialect driver it supports (pg, tedious,
  // sqlite3, etc.); the bundler tries to statically resolve all of them
  // even though only mariadb is installed. Run it unbundled instead.
  serverExternalPackages: ["sequelize", "mariadb"],
  async rewrites() {
    // The PHP site registered /s/{id} and /signups/{id} as two names for the
    // same GoodBotController::signups() route.
    return [{ source: "/s/:id", destination: "/signups/:id" }];
  },
};

export default nextConfig;
