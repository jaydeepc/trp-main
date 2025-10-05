const mongoose = require('mongoose');

// Reusable Model Metadata Schema
const ModelMetadataSchema = new mongoose.Schema({
  provider: String,
  model: String,
  tokenUsage: {
    promptTokens: Number,
    completionTokens: Number,
    thoughtTokens: Number
  }
}, { _id: false });

// Reusable Component Schema
const ComponentSchema = new mongoose.Schema({
  partNumber: String,
  name: { type: String, required: true },
  description: String,
  specifications: String,
  quantity: { type: Number, min: 1 },
  zbc: {
    shouldCost: Number,
    variance: String,
    confidence: { type: Number, min: 0, max: 100 }
  }
}, { _id: false });

module.exports = {
  ModelMetadataSchema,
  ComponentSchema,
};
