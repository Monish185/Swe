// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// function addSectionTitle(doc, title) {
//     doc.addPage().fontSize(20).text(title, { underline: true });
//     doc.moveDown();
// }

// function printRawJSON(doc, title, json) {
//     addSectionTitle(doc, title);

//     if (!json) {
//         doc.fontSize(12).text("No data available.");
//         return;
//     }

//     doc.fontSize(10).text(
//         JSON.stringify(json, null, 2),
//         {
//             width: 550,   // ensure wrapping
//         }
//     );
// }

// async function generatePdfReport(report) {
//     const filePath = path.join(__dirname, `security-report-${Date.now()}.pdf`);
//     const doc = new PDFDocument({ margin: 40 });
//     doc.pipe(fs.createWriteStream(filePath));

//     // HEADER
//     doc.fontSize(26).text("Security Pipeline Report", { align: "center" });
//     doc.moveDown(2);

//     doc.fontSize(12);
//     doc.text(`Repository: ${report.repo}`);
//     doc.text(`Branch: ${report.branch}`);
//     doc.text(`Commit: ${report.commitId}`);
//     doc.text(`Generated: ${report.generatedAt}`);
//     doc.moveDown(2);

//     // ============= RAW JSON SECTIONS =============

//     printRawJSON(doc, "1. Semgrep (Raw JSON)", report.semgrep);
//     printRawJSON(doc, "2. Dependency Check (Raw JSON)", report.dependencyCheck);
//     printRawJSON(doc, "3. Threat Model (Raw JSON)", report.threatModel);
//     printRawJSON(doc, "4. Gitleaks (Raw JSON)", report.gitleaks);

//     // END
//     doc.addPage();
//     doc.fontSize(16).text("End of Report", { align: "center" });

//     doc.end();
//     console.log("PDF generated:", filePath);
//     return filePath;
// }

// module.exports = { generatePdfReport };

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Color scheme
const colors = {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    success: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C',
    critical: '#C0392B',
    moderate: '#E67E22',
    low: '#95A5A6',
    background: '#ECF0F1',
    text: '#2C3E50'
};

// Severity colors
const severityColors = {
    critical: colors.critical,
    high: colors.danger,
    moderate: colors.moderate,
    medium: colors.warning,
    low: colors.low
};

class PDFReportGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 595.28; // A4 width in points
        this.pageHeight = 841.89; // A4 height in points
        this.margin = 50;
        this.contentWidth = this.pageWidth - (this.margin * 2);
    }

    // Add header to each page
    addHeader(title) {
        this.doc.rect(0, 0, this.pageWidth, 60)
            .fill(colors.primary);
        
        this.doc.fillColor('#FFFFFF')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(title, this.margin, 20, { width: this.contentWidth, align: 'center' });
    }

    // Add footer to each page
    addFooter(pageNum) {
        const footerY = this.pageHeight - 30;
        this.doc.fontSize(8)
            .fillColor(colors.text)
            .text(
                `Generated: ${new Date().toLocaleString()} | Page ${pageNum}`,
                this.margin,
                footerY,
                { width: this.contentWidth, align: 'center' }
            );
    }

    // Start a new page with header
    addPage(isFirstPage = false) {
        if (!isFirstPage) {
            this.doc.addPage();
        }
    }

    // Add section header
    addSectionHeader(title, icon = '') {
        this.doc.moveDown(1);
        
        // Background bar
        const barY = this.doc.y;
        this.doc.rect(this.margin - 10, barY, this.contentWidth + 20, 30)
            .fill(colors.accent);
        
        // Add icon if provided (using simple shapes instead of emoji)
        if (icon) {
            this.doc.circle(this.margin + 10, barY + 15, 8)
                .fill('#FFFFFF');
        }
        
        const textY = barY + 8;
        const textX = icon ? this.margin + 25 : this.margin + 5;
        this.doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text(title, textX, textY);
        
        this.doc.y = barY + 35;
        this.doc.fillColor(colors.text);
    }

    // Add key-value pair
    addInfoRow(label, value, indent = 0) {
        const x = this.margin + indent;
        this.doc.fontSize(11)
            .font('Helvetica-Bold')
            .fillColor(colors.secondary)
            .text(label + ': ', x, this.doc.y, { continued: true })
            .font('Helvetica')
            .fillColor(colors.text)
            .text(value);
        this.doc.moveDown(0.3);
    }

    // Add severity badge
    addSeverityBadge(severity, x, y) {
        const color = severityColors[severity.toLowerCase()] || colors.low;
        const width = 80;
        const height = 20;
        
        this.doc.roundedRect(x, y, width, height, 3)
            .fill(color);
        
        this.doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text(severity.toUpperCase(), x, y + 5, { width: width, align: 'center' });
        
        this.doc.fillColor(colors.text);
    }

    // Add statistics card
    addStatsCard(title, value, description, color) {
        const cardWidth = (this.contentWidth - 20) / 3;
        const cardHeight = 80;
        const x = this.doc.x;
        const y = this.doc.y;
        
        // Card background with shadow effect
        this.doc.roundedRect(x, y, cardWidth, cardHeight, 5)
            .fill(color);
        
        // Value
        this.doc.fontSize(32)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text(value.toString(), x + 10, y + 15, { width: cardWidth - 20, align: 'center' });
        
        // Title
        this.doc.fontSize(10)
            .font('Helvetica-Bold')
            .text(title, x + 10, y + 52, { width: cardWidth - 20, align: 'center' });
        
        // Description if provided
        if (description) {
            this.doc.fontSize(8)
                .font('Helvetica')
                .text(description, x + 10, y + 66, { width: cardWidth - 20, align: 'center' });
        }
        
        this.doc.fillColor(colors.text);
    }

    // Add vulnerability table
    addVulnerabilityTable(vulnerabilities, startY) {
        const tableTop = startY || this.doc.y;
        const colWidths = [200, 70, 100, 120];
        const rowHeight = 30;
        
        // Table header
        let y = tableTop;
        this.doc.rect(this.margin, y, this.contentWidth, rowHeight)
            .fill(colors.secondary);
        
        const headers = ['Package', 'Severity', 'CVE', 'CVSS Score'];
        let x = this.margin + 8;
        
        this.doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF');
        
        headers.forEach((header, i) => {
            this.doc.text(header, x, y + 10, { width: colWidths[i] - 16, align: 'left' });
            x += colWidths[i];
        });
        
        // Table rows
        y += rowHeight;
        this.doc.fillColor(colors.text);
        
        vulnerabilities.slice(0, 15).forEach((vuln, index) => {
            const rowColor = index % 2 === 0 ? '#FFFFFF' : colors.background;
            this.doc.rect(this.margin, y, this.contentWidth, rowHeight)
                .fill(rowColor);
            
            x = this.margin + 8;
            
            // Package name
            const packageName = vuln.fileName || 'N/A';
            this.doc.fontSize(9)
                .font('Helvetica')
                .fillColor(colors.text)
                .text(packageName, x, y + 10, { 
                    width: colWidths[0] - 16,
                    height: rowHeight - 10,
                    ellipsis: true
                });
            x += colWidths[0];
            
            // Severity badge (smaller and better positioned)
            const severity = vuln.severity || 'unknown';
            const badgeColor = severityColors[severity.toLowerCase()] || colors.low;
            const badgeWidth = 65;
            const badgeHeight = 18;
            const badgeY = y + 6;
            
            this.doc.roundedRect(x + 2, badgeY, badgeWidth, badgeHeight, 3)
                .fill(badgeColor);
            this.doc.fontSize(8)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .text(severity.toUpperCase(), x + 2, badgeY + 4, { 
                    width: badgeWidth, 
                    align: 'center' 
                });
            x += colWidths[1];
            
            this.doc.fillColor(colors.text);
            
            // CVE
            this.doc.fontSize(9)
                .font('Helvetica')
                .text(vuln.cve || 'N/A', x, y + 10, { 
                    width: colWidths[2] - 16,
                    ellipsis: true
                });
            x += colWidths[2];
            
            // CVSS Score - coerce and validate before formatting
            const rawCvss = vuln.cvssScore;
            const cvssNum = typeof rawCvss === 'number' ? rawCvss : Number(rawCvss);
            const cvssScore = Number.isFinite(cvssNum) ? cvssNum.toFixed(1) : 'N/A';
            this.doc.text(cvssScore, x, y + 10, { width: colWidths[3] - 16 });
            
            y += rowHeight;
            
            // Check if we need a new page
            if (y > this.pageHeight - 100 && index < vulnerabilities.length - 1) {
                this.addPage();
                this.addHeader('Security Pipeline Report');
                y = this.margin + 80;
            }
        });
        
        this.doc.y = y + 10;
    }

    // Generate the complete report
    async generate(report, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                this.doc = new PDFDocument({ 
                    margin: this.margin,
                    size: 'A4',
                    info: {
                        Title: 'Security Pipeline Report',
                        Author: 'Security Pipeline',
                        Subject: 'Security Analysis'
                    }
                });
                
                const writeStream = fs.createWriteStream(outputPath);
                this.doc.pipe(writeStream);

                // ========== COVER PAGE ==========
                this.addHeader('Security Pipeline Report');
                
                // Project info box
                this.doc.moveDown(3);
                const infoBoxY = this.doc.y;
                this.doc.roundedRect(this.margin, infoBoxY, this.contentWidth, 140, 5)
                    .lineWidth(2)
                    .stroke(colors.accent);
                
                this.doc.y = infoBoxY + 20;
                this.doc.fontSize(12);
                this.addInfoRow('Repository', report.repo, 20);
                this.addInfoRow('Branch', report.branch, 20);
                this.addInfoRow('Commit', report.commitId, 20);
                this.addInfoRow('Generated', new Date(report.generatedAt).toLocaleString(), 20);
                
                // Executive Summary
                this.doc.y = infoBoxY + 160;
                this.doc.moveDown(1);
                this.addSectionHeader('Executive Summary', '●');
                
                const depCheck = report.dependencyCheck || {};
                const semgrep = report.semgrep || {};
                const gitleaks = report.gitleaks || {};
                
                const totalVulns = depCheck.summary?.vulnerable_dependencies || 0;
                const totalFindings = semgrep.summary?.total_findings || 0;
                const totalSecrets = gitleaks.totalFindings || 0;
                
                // Stats cards
                const cardY = this.doc.y;
                const cardSpacing = 10;
                const cardWidth = (this.contentWidth - (cardSpacing * 2)) / 3;
                
                this.doc.x = this.margin;
                this.doc.y = cardY;
                this.addStatsCard('Dependencies', totalVulns, 'Vulnerabilities', colors.danger);
                
                this.doc.x = this.margin + cardWidth + cardSpacing;
                this.doc.y = cardY;
                this.addStatsCard('Code Issues', totalFindings, 'Semgrep', colors.warning);
                
                this.doc.x = this.margin + (cardWidth + cardSpacing) * 2;
                this.doc.y = cardY;
                this.addStatsCard('Secrets', totalSecrets, 'Leaked', colors.critical);
                
                this.doc.x = this.margin;
                this.doc.y = cardY + 100;

                // ========== DEPENDENCY CHECK ==========
                this.addPage();
                this.addHeader('Security Pipeline Report');
                this.addSectionHeader('Dependency Vulnerabilities', '●');
                
                if (depCheck.summary) {
                    this.doc.fontSize(11);
                    this.addInfoRow('Total Dependencies', depCheck.summary.total_dependencies?.toString() || '0');
                    this.addInfoRow('Vulnerable Dependencies', totalVulns.toString());
                    
                    if (depCheck.summary.severities) {
                        this.doc.moveDown(0.5);
                        this.doc.fontSize(11)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Severity Breakdown:', this.margin);
                        this.doc.moveDown(0.3);
                        
                        Object.entries(depCheck.summary.severities).forEach(([severity, count]) => {
                            this.doc.fontSize(10)
                                .font('Helvetica')
                                .fillColor(colors.text)
                                .text(`  ${severity}: ${count}`, this.margin + 20);
                        });
                    }
                    
                    // Vulnerability table
                    if (depCheck.vulnerabilities && depCheck.vulnerabilities.length > 0) {
                        this.doc.moveDown(1);
                        this.doc.fontSize(12)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Top Vulnerabilities:', this.margin);
                        this.doc.moveDown(0.5);
                        
                        this.addVulnerabilityTable(depCheck.vulnerabilities);
                        
                        if (depCheck.vulnerabilities.length > 15) {
                            this.doc.fontSize(9)
                                .font('Helvetica-Oblique')
                                .fillColor(colors.secondary)
                                .text(`... and ${depCheck.vulnerabilities.length - 15} more vulnerabilities`, 
                                      this.margin, this.doc.y, { align: 'center' });
                        }
                    }
                } else {
                    this.doc.fontSize(11)
                        .fillColor(colors.success)
                        .text('✓ No dependency vulnerabilities detected', this.margin);
                }

                // ========== SEMGREP ==========
                this.addPage();
                this.addHeader('Security Pipeline Report');
                this.addSectionHeader('Code Security Analysis (Semgrep)', '●');
                
                if (semgrep.summary && totalFindings > 0) {
                    this.doc.fontSize(11);
                    this.addInfoRow('Total Findings', totalFindings.toString());
                    
                    if (semgrep.summary.severity_breakdown && 
                        Object.keys(semgrep.summary.severity_breakdown).length > 0) {
                        this.doc.moveDown(0.5);
                        this.doc.fontSize(11)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Severity Breakdown:', this.margin);
                        this.doc.moveDown(0.3);
                        
                        Object.entries(semgrep.summary.severity_breakdown).forEach(([severity, count]) => {
                            this.doc.fontSize(10)
                                .font('Helvetica')
                                .fillColor(colors.text)
                                .text(`  ${severity}: ${count}`, this.margin + 20);
                        });
                    }
                    
                    // Findings details
                    if (semgrep.findings && semgrep.findings.length > 0) {
                        this.doc.moveDown(1);
                        this.doc.fontSize(12)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Findings:', this.margin);
                        this.doc.moveDown(0.5);
                        
                        semgrep.findings.slice(0, 10).forEach((finding, index) => {
                            this.doc.fontSize(10)
                                .font('Helvetica-Bold')
                                .fillColor(colors.text)
                                .text(`${index + 1}. ${finding.check_id || finding.rule_id}`, this.margin);
                            
                            if (finding.severity) {
                                this.addSeverityBadge(finding.severity, this.margin + 20, this.doc.y);
                                this.doc.moveDown(1.2);
                            }
                            
                            this.doc.fontSize(9)
                                .font('Helvetica')
                                .fillColor(colors.secondary)
                                .text(`File: ${finding.path || 'N/A'}`, this.margin + 20);
                            
                            if (finding.message) {
                                this.doc.fillColor(colors.text)
                                    .text(`Message: ${finding.message.substring(0, 200)}...`, 
                                         this.margin + 20, this.doc.y, { width: this.contentWidth - 40 });
                            }
                            
                            this.doc.moveDown(0.8);
                            this.doc.fillColor(colors.text);
                        });
                    }
                } else {
                    this.doc.fontSize(11)
                        .fillColor(colors.success)
                        .text('✓ No security issues detected by Semgrep', this.margin);
                }

                // ========== THREAT MODEL ==========
                this.addPage();
                this.addHeader('Security Pipeline Report');
                this.addSectionHeader('Threat Model Analysis', '●');
                
                const threatModel = report.threatModel || {};
                
                if (threatModel.summary) {
                    this.doc.fontSize(11);
                    this.addInfoRow('Total Threats', threatModel.summary.totalThreats?.toString() || '0');
                    
                    if (threatModel.techStack) {
                        this.doc.moveDown(0.5);
                        this.doc.fontSize(11)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Technology Stack:', this.margin);
                        this.doc.moveDown(0.3);
                        
                        if (threatModel.techStack.languages) {
                            this.addInfoRow('Languages', threatModel.techStack.languages.join(', '), 20);
                        }
                        if (threatModel.techStack.frameworks) {
                            this.addInfoRow('Frameworks', threatModel.techStack.frameworks.join(', '), 20);
                        }
                    }
                    
                    if (threatModel.threats && threatModel.threats.length > 0) {
                        this.doc.moveDown(1);
                        this.doc.fontSize(12)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text('Identified Threats:', this.margin);
                        this.doc.moveDown(0.5);
                        
                        threatModel.threats.forEach((threat, index) => {
                            this.doc.fontSize(10)
                                .font('Helvetica-Bold')
                                .fillColor(colors.text)
                                .text(`${index + 1}. ${threat.title || 'Threat'}`, this.margin);
                            
                            if (threat.severity) {
                                this.addSeverityBadge(threat.severity, this.margin + 20, this.doc.y);
                                this.doc.moveDown(1.2);
                            }
                            
                            if (threat.description) {
                                this.doc.fontSize(9)
                                    .font('Helvetica')
                                    .fillColor(colors.text)
                                    .text(threat.description.substring(0, 300) + '...', 
                                         this.margin + 20, this.doc.y, { width: this.contentWidth - 40 });
                            }
                            
                            this.doc.moveDown(0.8);
                        });
                    } else {
                        this.doc.moveDown(0.5);
                        this.doc.fontSize(11)
                            .fillColor(colors.success)
                            .text('✓ No significant threats identified', this.margin);
                    }
                } else {
                    this.doc.fontSize(11)
                        .fillColor(colors.success)
                        .text('✓ No significant threats identified', this.margin);
                }

                // ========== GITLEAKS ==========
                this.addPage();
                this.addHeader('Security Pipeline Report');
                this.addSectionHeader('Secret Detection (Gitleaks)', '●');
                
                if (totalSecrets > 0 && gitleaks.findings) {
                    this.doc.fontSize(11)
                        .fillColor(colors.danger)
                        .font('Helvetica-Bold')
                        .text(`⚠ WARNING: ${totalSecrets} potential secrets detected!`, this.margin);
                    
                    this.doc.moveDown(1);
                    
                    gitleaks.findings.slice(0, 10).forEach((finding, index) => {
                        this.doc.fontSize(10)
                            .font('Helvetica-Bold')
                            .fillColor(colors.text)
                            .text(`${index + 1}. ${finding.RuleID || 'Secret'}`, this.margin);
                        
                        this.doc.fontSize(9)
                            .font('Helvetica')
                            .fillColor(colors.secondary)
                            .text(`File: ${finding.File || 'N/A'}`, this.margin + 20)
                            .text(`Line: ${finding.StartLine || 'N/A'}`, this.margin + 20)
                            .text(`Commit: ${finding.Commit?.substring(0, 8) || 'N/A'}`, this.margin + 20);
                        
                        if (finding.Match) {
                            this.doc.fillColor(colors.danger)
                                .text(`Match: ${finding.Match.substring(0, 50)}...`, this.margin + 20);
                        }
                        
                        this.doc.moveDown(0.8);
                        this.doc.fillColor(colors.text);
                    });
                } else {
                    this.doc.fontSize(11)
                        .fillColor(colors.success)
                        .text('✓ No secrets or credentials detected', this.margin);
                }

                // ========== RECOMMENDATIONS ==========
                this.addPage();
                this.addHeader('Security Pipeline Report');
                this.addSectionHeader('Recommendations', '●');
                
                const recommendations = this.generateRecommendations(report);
                recommendations.forEach((rec, index) => {
                    this.doc.fontSize(10)
                        .font('Helvetica-Bold')
                        .fillColor(colors.text)
                        .text(`${index + 1}. ${rec.title}`, this.margin);
                    
                    this.doc.fontSize(9)
                        .font('Helvetica')
                        .fillColor(colors.secondary)
                        .text(rec.description, this.margin + 20, this.doc.y, { 
                            width: this.contentWidth - 40 
                        });
                    
                    this.doc.moveDown(0.8);
                    this.doc.fillColor(colors.text);
                });

                // Add page numbers to all pages
                const range = this.doc.bufferedPageRange();
                for (let i = range.start; i < range.start + range.count; i++) {
                    this.doc.switchToPage(i);
                    this.addFooter(i - range.start + 1);
                }

                // End and wait for stream to close
                this.doc.end();
                
                writeStream.on('finish', () => {
                    resolve();
                });
                
                writeStream.on('error', (err) => {
                    reject(err);
                });
                
                this.doc.on('error', (err) => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    generateRecommendations(report) {
        const recommendations = [];
        
        const vulnCount = report.dependencyCheck?.summary?.vulnerable_dependencies || 0;
        if (vulnCount > 0) {
            recommendations.push({
                title: 'Update Vulnerable Dependencies',
                description: `${vulnCount} vulnerable dependencies detected. Run 'npm audit fix' or update packages manually to patch known vulnerabilities.`
            });
        }
        
        const secretsCount = report.gitleaks?.totalFindings || 0;
        if (secretsCount > 0) {
            recommendations.push({
                title: 'Remove Exposed Secrets',
                description: `${secretsCount} potential secrets detected in the codebase. Immediately rotate any exposed credentials and use environment variables or secret management systems.`
            });
        }
        
        const semgrepFindings = report.semgrep?.summary?.total_findings || 0;
        if (semgrepFindings > 0) {
            recommendations.push({
                title: 'Address Code Security Issues',
                description: `${semgrepFindings} security issues found by static analysis. Review and fix issues related to injection, authentication, and unsafe patterns.`
            });
        }
        
        recommendations.push({
            title: 'Implement CI/CD Security Checks',
            description: 'Integrate these security scans into your CI/CD pipeline to catch vulnerabilities before they reach production.'
        });
        
        recommendations.push({
            title: 'Regular Security Audits',
            description: 'Schedule regular security scans and code reviews. Keep dependencies updated and monitor security advisories.'
        });
        
        return recommendations;
    }
}

async function generatePdfReport(report) {
    const filePath = path.join(__dirname, `security-report-${Date.now()}.pdf`);
    const generator = new PDFReportGenerator();
    
    return new Promise((resolve, reject) => {
        generator.generate(report, filePath)
            .then(() => {
                console.log("✓ Professional PDF report generated:", filePath);
                resolve(filePath);
            })
            .catch(reject);
    });
}

module.exports = { generatePdfReport };