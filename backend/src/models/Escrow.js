const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'held', 'released', 'refunded'], default: 'pending' },
    paymobOrderId: String,
    paymobTransactionId: String,
    createdAt: { type: Date, default: Date.now },
    releasedAt: Date
});

module.exports = mongoose.model('Escrow', escrowSchema);
