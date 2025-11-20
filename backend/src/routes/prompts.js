const express = require('express');
const Joi = require('joi');
const { Op, where, literal, fn, col } = require('sequelize');
const { PromptTemplate, User, UserPromptFavorites } = require('../models/index.js');
const { authenticateToken } = require('../utils/auth.js');

const router = express.Router();

// Validation schemas
const promptCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  short_description: Joi.string().min(10).max(500).required(),
  long_description: Joi.string().max(5000).optional(),
  template: Joi.string().min(10).required(),
  inputs: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    label: Joi.string().required(),
    description: Joi.string().optional(),
    placeholder: Joi.string().optional(),
    required: Joi.boolean().default(true),
    validation: Joi.object().optional(),
    options: Joi.array().optional()
  })).optional(),
  tags: Joi.string().optional(),
  visibility: Joi.string().valid('public', 'private').default('public'),
});

const promptUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  short_description: Joi.string().min(10).max(500).optional(),
  long_description: Joi.string().max(5000).optional(),
  template: Joi.string().min(10).optional(),
  inputs: Joi.array().items(Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().optional(),
    label: Joi.string().optional(),
    description: Joi.string().optional(),
    placeholder: Joi.string().optional(),
    required: Joi.boolean().optional(),
    validation: Joi.object().optional()
  })).optional(),
  tags: Joi.string().optional(),
  visibility: Joi.string().valid('public', 'private').optional(),
});

// Middleware to check if user is creator of prompt
async function checkPromptOwnership(req, res, next) {
  try {
    const prompt = await PromptTemplate.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator' }],
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    if (prompt.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this prompt' });
    }
    
    req.prompt = prompt;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/prompts - Create prompt
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error } = promptCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promptData = {
      ...req.body,
      creator_id: req.user.id,
      inputs: req.body.inputs ? JSON.stringify(req.body.inputs) : null,
    };

    const prompt = await PromptTemplate.create(promptData);

    const promptWithCreator = await PromptTemplate.findByPk(prompt.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    res.status(201).json(promptWithCreator);
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/prompts/favorites - Get user's favorited prompts
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, limit = 20 } = req.query;
    const userId = req.user.id;

    // Get all favorite prompt IDs for the user
    const favorites = await UserPromptFavorites.findAll({
      where: { user_id: userId },
      attributes: ['prompt_id'],
      order: [['prompt_id', 'DESC']],
    });

    const promptIds = favorites.map(fav => fav.prompt_id);
    
    if (promptIds.length === 0) {
      return res.json({
        prompts: [],
        total: 0,
        skip: parseInt(skip),
        limit: parseInt(limit),
      });
    }

    // Get the actual prompts with pagination
    const { count, rows } = await PromptTemplate.findAndCountAll({
      where: {
        id: {
          [Op.in]: promptIds
        }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(skip),
    });

    res.json({
      prompts: rows,
      total: count,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/prompts - List prompts with search and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, limit = 20, q, creator_id, tags, favorites_only } = req.query;
    const userId = req.user.id;

    const whereClause = {};
    let joinFavorites = false;

    // If favorites_only filter is requested
    if (favorites_only === 'true') {
      joinFavorites = true;
    }

    // Full-text search across title, short_description, and tags
    if (q) {
      const searchTerm = q.trim();
      console.log('Search term:', searchTerm);
      console.log('Op.or value:', Op.or);
      console.log('Op.and value:', Op.and);
      console.log('Op.iLike value:', Op.iLike);
      
      whereClause[Op.or] = [
        where(fn('UPPER', col('title')), Op.like, `%${searchTerm.toUpperCase()}%`),
        where(fn('UPPER', col('short_description')), Op.like, `%${searchTerm.toUpperCase()}%`),
        where(fn('UPPER', col('tags')), Op.like, `%${searchTerm.toUpperCase()}%`),
      ];
      
      console.log('whereClause keys:', Object.keys(whereClause));
      console.log('whereClause symbols:', Object.getOwnPropertySymbols(whereClause));
      console.log('whereClause[Op.or]:', whereClause[Op.or]);
    }

    // Filter by creator
    if (creator_id) {
      whereClause.creator_id = creator_id;
      console.log('whereClause after creator filter:', JSON.stringify(whereClause, null, 2));
    }

    // Filter by tags (this might conflict with search!)
    if (tags) {
      console.log('Applying tags filter, q exists:', !!q);
      // If we have a search query, we need to be careful not to override the search conditions
      if (q) {
        // Add tags filter to the AND conditions instead
        if (!whereClause[Op.and]) {
          whereClause[Op.and] = [];
        }
        whereClause[Op.and].push(where(fn('UPPER', col('tags')), Op.like, `%${tags.toUpperCase()}%`));
      } else {
        whereClause.tags = where(fn('UPPER', col('tags')), Op.like, `%${tags.toUpperCase()}%`);
      }
      console.log('whereClause after tags filter:', JSON.stringify(whereClause, null, 2));
    }
    
    console.log('whereClause after filters:', JSON.stringify(whereClause, null, 2));

    // Build visibility condition separately and combine with other filters
    const visibilityCondition = {
      [Op.or]: [
        { visibility: 'public' },
        { creator_id: userId },
      ]
    };

    // Combine conditions properly
    let finalWhere = visibilityCondition;
    
    // Check for both string keys and symbol keys (like Op.or)
    const hasConditions = Object.keys(whereClause).length > 0 || Object.getOwnPropertySymbols(whereClause).length > 0;
    
    if (hasConditions) {
      finalWhere = {
        [Op.and]: [
          whereClause,
          visibilityCondition
        ]
      };
    }
    
    console.log('Final where clause has conditions:', hasConditions);
    console.log('Final where symbols:', Object.getOwnPropertySymbols(finalWhere));

    let queryOptions = {
      where: finalWhere,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit), 100), // Cap limit at 100
      offset: parseInt(skip),
    };

    // If filtering by favorites only, add join with favorites table
    if (joinFavorites) {
      queryOptions.include.push({
        model: User,
        through: UserPromptFavorites,
        as: 'favorited_by',
        where: { id: userId },
        attributes: [],
        required: true
      });
    }

    const { count, rows } = await PromptTemplate.findAndCountAll(queryOptions);

    let promptsWithFavorites;

    if (joinFavorites) {
      // All prompts are favorited since we filtered by favorites
      promptsWithFavorites = rows.map(prompt => {
        const promptData = prompt.toJSON();
        promptData.isFavorited = true;
        return promptData;
      });
    } else {
      // Get user's favorite prompt IDs for status
      const userFavorites = await UserPromptFavorites.findAll({
        where: { user_id: userId },
        attributes: ['prompt_id']
      });
      const favoriteIds = userFavorites.map(fav => fav.prompt_id);

      // Add isFavorited status to each prompt
      promptsWithFavorites = rows.map(prompt => {
        const promptData = prompt.toJSON();
        promptData.isFavorited = favoriteIds.includes(prompt.id);
        return promptData;
      });
    }

    res.json({
      prompts: promptsWithFavorites,
      total: count,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('List prompts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const prompt = await PromptTemplate.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check visibility
    if (prompt.visibility === 'private' && prompt.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Private prompt - access denied' });
    }

    // Check if this prompt is favorited by the current user
    const isFavorited = await UserPromptFavorites.findOne({
      where: {
        user_id: req.user.id,
        prompt_id: prompt.id
      }
    });

    const promptData = prompt.toJSON();
    promptData.isFavorited = !!isFavorited;

    res.json(promptData);
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/prompts/:id - Update prompt
router.put('/:id', authenticateToken, checkPromptOwnership, async (req, res) => {
  try {
    const { error } = promptUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateData = {
      ...req.body,
      inputs: req.body.inputs ? JSON.stringify(req.body.inputs) : req.prompt.inputs,
    };

    await req.prompt.update(updateData);

    const updatedPrompt = await PromptTemplate.findByPk(req.prompt.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    res.json(updatedPrompt);
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', authenticateToken, checkPromptOwnership, async (req, res) => {
  try {
    await req.prompt.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/prompts/:id/favorite - Add to favorites
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const promptId = parseInt(req.params.id);
    const userId = req.user.id;

    const prompt = await PromptTemplate.findByPk(promptId);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check visibility before allowing to favorite
    if (prompt.visibility === 'private' && prompt.creator_id !== userId) {
      return res.status(403).json({ error: 'Private prompt - access denied' });
    }

    // Add to favorites (ignore if already exists)
    const [favorite, created] = await UserPromptFavorites.findOrCreate({
      where: { user_id: userId, prompt_id: promptId }
    });

    if (!created) {
      return res.status(409).json({ error: 'Prompt already in favorites' });
    }

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/prompts/:id/favorite - Remove from favorites
router.delete('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const promptId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await UserPromptFavorites.destroy({
      where: {
        user_id: userId,
        prompt_id: promptId,
      },
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Not in favorites' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;