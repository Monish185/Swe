// const { runDependencyCheck } = require('../../OWaspDepCheck/utils');
// const { runSemgrepScan } = require('../../Semgrep/utils');
// const { runThreatModel } = require('../../tmt-threat-engine/src/utils/utils');
// const { runGitleaksScan } = require('../../gitleaks-api/src/utils');


// async function runCustomPipeline(userId, repo, branch, commitId) {
//     console.log('runCustomPipeline invoked');
//     console.log('userId:', userId);
//     console.log('repo:', repo);
//     console.log('branch:', branch);
//     console.log('commitId:', commitId);

//     const url = `https://github.com/${repo}`;

//     (async () => {
//         const report = await runSemgrepScan(url);
//         console.log("Scan result:", report);
//     })();

//     (async () => {
//         const result = await runDependencyCheck(url);
//         console.log(result);
//     })();

//     (async () => {
//         try {
//             const result = await runThreatModel(url);

//             console.log("Final Threat Report:");
//             console.dir(result, { depth: null });
//         } catch (err) {
//             console.error("Error:", err.message);
//         }
//     })();

//     (async () => {
//         try {
//             const result = await runGitleaksScan({
//                 repoUrl: url
//             });

//             console.log("Final leaks Report:");
//             console.dir(result, { depth: null });
//         } catch (err) {
//             console.error("Error:", err.message);
//         }
//     })();



//     return Promise.resolve();
// }

// module.exports = { runCustomPipeline };

const { runDependencyCheck } = require('../../OWaspDepCheck/utils');
const { runSemgrepScan } = require('../../Semgrep/utils');
const { runThreatModel } = require('../../tmt-threat-engine/src/utils/utils');
const { runGitleaksScan } = require('../../gitleaks-api/src/utils');
const { generatePdfReport } = require('./pdfGenerator');

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

    // Generate PDF
    await generatePdfReport(finalReport);

    // console.log(finalReport);

    return finalReport;
}

module.exports = { runCustomPipeline };
