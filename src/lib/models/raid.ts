import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/raid.js -- same table, same columns.
export class Raid extends Model<InferAttributes<Raid>, InferCreationAttributes<Raid>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare raid: string;
  declare date: string;
  declare time: string | null;
  declare title: string | null;
  declare description: string | null;
  declare softreserve: boolean | null;
  declare reserveLimit: number | null;
  declare locked: boolean | null;
  declare archived: boolean | null;
  declare channelID: string;
  declare guildID: string;
  declare memberID: string;
}

Raid.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    raid: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true },
    softreserve: { type: DataTypes.BOOLEAN, allowNull: true },
    reserveLimit: { type: DataTypes.TINYINT, allowNull: true },
    locked: { type: DataTypes.BOOLEAN, allowNull: true },
    archived: { type: DataTypes.BOOLEAN, allowNull: true },
    channelID: { type: DataTypes.BIGINT, allowNull: false },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
  },
  { sequelize, modelName: "raid", tableName: "raids" }
);
