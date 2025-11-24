const { runDependencyCheck } = require('../../OWaspDepCheck/utils');
const { runSemgrepScan } = require('../../Semgrep/utils');


async function runCustomPipeline(userId, repo, branch, commitId) {
    console.log('runCustomPipeline invoked');
    console.log('userId:', userId);
    console.log('repo:', repo);
    console.log('branch:', branch);
    console.log('commitId:', commitId);

    const url = `https://github.com/${repo}`;

    (async () => {
        const report = await runSemgrepScan(url);
        console.log("Scan result:", report);
    })();

    (async () => {
        const result = await runDependencyCheck(url);
        console.log(result);
    })();


    return Promise.resolve();
}

module.exports = { runCustomPipeline };
