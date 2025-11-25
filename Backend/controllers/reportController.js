const Report = require('../models/reportModel');
const { generatePdfReport } = require('../services/pdfGenerator');
const fs = require('fs');

/**
 * GET /api/reports/:owner/:repo/:commitId
 * Retrieve a report for a specific commit
 */
exports.getReport = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo, commitId } = req.params;
    if (!owner || !repo || !commitId) {
      return res.status(400).json({ error: 'owner, repo, and commitId required' });
    }

    const report = await Report.findOne({ userId, owner, repo, commitId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({ report });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch report', details: err.message });
  }
};

/**
 * POST /api/reports/:owner/:repo/:commitId/download-pdf
 * Generate and download PDF for a specific commit report
 */
exports.downloadReportPdf = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo, commitId } = req.params;
    if (!owner || !repo || !commitId) {
      return res.status(400).json({ error: 'owner, repo, and commitId required' });
    }

    // Find the report in DB
    const report = await Report.findOne({ userId, owner, repo, commitId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Generate PDF from the stored finalReport (returns file path)
    const pdfFilePath = await generatePdfReport(report.finalReport);

    // Read the PDF file and send it
    const pdfBuffer = fs.readFileSync(pdfFilePath);

    // Set response headers to trigger download
    const filename = `report_${owner}_${repo}_${commitId.slice(0, 7)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
};

/**
 * GET /api/reports/:owner/:repo
 * List all reports for a repo
 */
exports.listRepoReports = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo } = req.params;
    if (!owner || !repo) {
      return res.status(400).json({ error: 'owner and repo required' });
    }

    const reports = await Report.find({ userId, owner, repo }).select('commitId createdAt');
    return res.status(200).json({ reports });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list reports', details: err.message });
  }
};
