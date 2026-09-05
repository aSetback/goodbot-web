import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from "sequelize";
import { sequelize } from "@/lib/db";
import type { RaidReserve } from "@/lib/models/raidReserve";
import type { Character } from "@/lib/models/character";

// Mirrors the GoodBot bot's models/signup.js -- same table, same columns.
export class Signup extends Model<InferAttributes<Signup>, InferCreationAttributes<Signup>> {
  declare id: CreationOptional<number>;
  declare player: string;
  declare signup: string;
  declare role: string | null;
  declare confirmed: boolean | null;
  declare characterID: string | null;
  declare raidID: string;
  declare channelID: string;
  declare guildID: string;
  declare memberID: string;

  declare reserve?: NonAttribute<RaidReserve>;
  declare character?: NonAttribute<Character>;
}

Signup.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    player: { type: DataTypes.STRING, allowNull: false },
    signup: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: true },
    confirmed: { type: DataTypes.BOOLEAN, allowNull: true },
    characterID: { type: DataTypes.BIGINT, allowNull: true },
    raidID: { type: DataTypes.BIGINT, allowNull: false },
    channelID: { type: DataTypes.BIGINT, allowNull: false },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
  },
  { sequelize, modelName: "signup", tableName: "signups" }
);
