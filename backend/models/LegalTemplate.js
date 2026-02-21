const mongoose = require('mongoose');

const legalTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['AGREEMENT', 'NDA', 'TERMS', 'OTHER'], required: true },
    content: { type: String, required: true }, // HTML content or link to file
    lastUpdated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('LegalTemplate', legalTemplateSchema);
