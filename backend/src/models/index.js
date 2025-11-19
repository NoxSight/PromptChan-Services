const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

const PromptTemplate = sequelize.define('PromptTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  long_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  template: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  inputs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'prompt_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Many-to-many favorites association
const UserPromptFavorites = sequelize.define('UserPromptFavorite', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  prompt_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: PromptTemplate,
      key: 'id',
    },
  },
}, {
  tableName: 'user_prompt_favorites',
  timestamps: false,
});

// Associations
User.hasMany(PromptTemplate, { foreignKey: 'creator_id', as: 'created_prompts' });
PromptTemplate.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
User.belongsToMany(PromptTemplate, { 
  through: UserPromptFavorites, 
  foreignKey: 'user_id',
  otherKey: 'prompt_id',
  as: 'favorites' 
});
PromptTemplate.belongsToMany(User, { 
  through: UserPromptFavorites, 
  foreignKey: 'prompt_id',
  otherKey: 'user_id',
  as: 'favorited_by' 
});

module.exports = {
  sequelize,
  User,
  PromptTemplate,
  UserPromptFavorites,
};