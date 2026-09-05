import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/guild.js -- same table, same columns
// (plus the default Sequelize timestamps every bot model gets).
export class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare guildID: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Guild.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "guild", tableName: "guilds" }
);
