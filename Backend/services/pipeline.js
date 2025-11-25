const { runDependencyCheck } = require('../../OWaspDepCheck/utils');
const { runSemgrepScan } = require('../../Semgrep/utils');
const { runThreatModel } = require('../../tmt-threat-engine/src/utils/utils');
const { runGitleaksScan } = require('../../gitleaks-api/src/utils');
const { generatePdfReport } = require('./pdfGenerator');
const Report = require('../models/reportModel');

async function runCustomPipeline(userId, repo, branch, commitId) {
    console.log("runCustomPipeline invoked");

    const url = `https://github.com/${repo}`;

    // Run step-by-step with proper async/await sequencing
    const semgrepResult = await runSemgrepScan(url);
    const depCheckResult = await runDependencyCheck(url);
    const threatModelResult = await runThreatModel(url);
    const gitleaksResult = await runGitleaksScan({ repoUrl: url });

    const finalReport = {
        userId,
        repo,
        branch,
        commitId,
        semgrep: semgrepResult,
        dependencyCheck: depCheckResult,
        threatModel: threatModelResult,
        gitleaks: gitleaksResult,
        generatedAt: new Date().toISOString(),
    };

    // Extract owner/repo from full repo name (owner/repo)
    const [owner, repoName] = repo.split('/');

    // Save report to DB instead of generating PDF immediately
    try {
        await Report.updateOne(
            { userId, owner, repo: repoName, commitId },
            {
                userId,
                owner,
                repo: repoName,
                commitId,
                branch,
                finalReport
            },
            { upsert: true }
        );
        console.log(`Report saved for commit ${commitId}`);
    } catch (err) {
        console.error('Failed to save report to DB:', err.message);
    }

    // Note: PDF generation now happens on-demand via API endpoint
    return finalReport;
}

module.exports = { runCustomPipeline };
