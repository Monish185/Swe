const { generatePdfReport } = require('./services/pdfGenerator');

(async () => {
  try {
    const report = {
      repo: 'owner/repo',
      branch: 'main',
      commitId: 'deadbeef',
      generatedAt: Date.now(),
      dependencyCheck: {
        summary: { vulnerable_dependencies: 1, total_dependencies: 10, severities: { HIGH: 1 } },
        vulnerabilities: [
          { fileName: 'package-a', severity: 'HIGH', cve: 'CVE-2025-0001', cvssScore: '7.8' },
          { fileName: 'package-b', severity: 'LOW', cve: 'CVE-2025-0002', cvssScore: null },
          { fileName: 'package-c', severity: 'MODERATE', cve: 'CVE-2025-0003', cvssScore: 'unknown' }
        ]
      },
      semgrep: { summary: { total_findings: 0 }, findings: [] },
      gitleaks: { totalFindings: 0, findings: [] },
      threatModel: { summary: { totalThreats: 0 }, threats: [] }
    };

    const file = await generatePdfReport(report);
    console.log('Generated PDF path:', file);
  } catch (err) {
    console.error('ERROR while generating PDF:', err);
    process.exit(1);
  }
})();
