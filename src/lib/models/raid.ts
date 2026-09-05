import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/raid.js -- same table, same columns.
export class Raid extends Model<InferAttributes<Raid>, InferCreationAttributes<Raid>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare raid: string;
  declare rules: CreationOptional<string | null>;
  declare date: string;
  declare faction: CreationOptional<string | null>;
  declare time: string | null;
  declare title: string | null;
  declare description: string | null;
  declare color: string;
  declare confirmation: boolean | null;
  declare softreserve: boolean | null;
  declare reserveLimit: number | null;
  declare locked: boolean | null;
  declare archived: boolean | null;
  declare crosspostID: CreationOptional<string | null>;
  declare crosspostGuildID: CreationOptional<string | null>;
  declare channelID: string;
  declare guildID: string;
  declare memberID: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Raid.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    raid: { type: DataTypes.STRING, allowNull: false },
    rules: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    faction: { type: DataTypes.STRING, allowNull: true },
    time: { type: DataTypes.STRING, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true },
    color: { type: DataTypes.STRING, allowNull: false },
    confirmation: { type: DataTypes.BOOLEAN, allowNull: true },
    softreserve: { type: DataTypes.BOOLEAN, allowNull: true },
    reserveLimit: { type: DataTypes.TINYINT, allowNull: true },
    locked: { type: DataTypes.BOOLEAN, allowNull: true },
    archived: { type: DataTypes.BOOLEAN, allowNull: true },
    crosspostID: { type: DataTypes.BIGINT, allowNull: true },
    crosspostGuildID: { type: DataTypes.BIGINT, allowNull: true },
    channelID: { type: DataTypes.BIGINT, allowNull: false },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "raid", tableName: "raids" }
);
