const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: String,
    repo: String,
    commitId: {
        type: String,
        required: true
    },
    branch: String,
    finalReport: mongoose.Schema.Types.Mixed, // store the full report JSON
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a compound unique index on userId + repo + commitId
reportSchema.index({ userId: 1, owner: 1, repo: 1, commitId: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
