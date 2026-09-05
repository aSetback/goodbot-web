import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/log.js -- same table, same columns.
export class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
  declare id: CreationOptional<number>;
  declare event: string;
  declare guildName: CreationOptional<string | null>;
  declare guildID: CreationOptional<string | null>;
  declare memberName: CreationOptional<string | null>;
  declare memberID: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Log.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    event: { type: DataTypes.TEXT, allowNull: false },
    guildName: { type: DataTypes.STRING, allowNull: true },
    guildID: { type: DataTypes.BIGINT, allowNull: true },
    memberName: { type: DataTypes.STRING, allowNull: true },
    memberID: { type: DataTypes.BIGINT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "log", tableName: "logs" }
);
