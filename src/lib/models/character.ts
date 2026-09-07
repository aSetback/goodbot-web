import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/character.js -- same table, same columns.
export class Character extends Model<InferAttributes<Character>, InferCreationAttributes<Character>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare class: string | null;
  declare role: string | null;
  declare mainID: CreationOptional<string | null>;
  declare guildID: string;
  declare memberID: string;
  declare pingID: CreationOptional<string | null>;
  declare shadowResist: CreationOptional<string | null>;
  declare natureResist: CreationOptional<string | null>;
  declare fireResist: CreationOptional<string | null>;
  declare frostResist: CreationOptional<string | null>;

  declare main?: NonAttribute<Character>;
}

Character.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    class: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: true },
    mainID: { type: DataTypes.BIGINT, allowNull: true },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
    pingID: { type: DataTypes.BIGINT, allowNull: true },
    shadowResist: { type: DataTypes.BIGINT, allowNull: true },
    natureResist: { type: DataTypes.BIGINT, allowNull: true },
    fireResist: { type: DataTypes.BIGINT, allowNull: true },
    frostResist: { type: DataTypes.BIGINT, allowNull: true },
  },
  { sequelize, modelName: "character", tableName: "characters" }
);
