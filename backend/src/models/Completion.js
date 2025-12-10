const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    escrowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Escrow' },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliverables: { type: String, required: true },
    attachments: [String],
    status: { type: String, enum: ['pending', 'approved', 'revision_requested'], default: 'pending' },
    clientFeedback: String,
    submittedAt: { type: Date, default: Date.now },
    resolvedAt: Date
});

module.exports = mongoose.model('Completion', completionSchema);
