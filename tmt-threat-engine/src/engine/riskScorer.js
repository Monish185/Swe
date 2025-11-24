export function buildSummary(threats) {
  const summary = {
    totalThreats: threats.length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    byCategory: {}
  };

  for (const t of threats) {
    const sev = (t.severity || "low").toLowerCase();

    if (sev === "critical") summary.bySeverity.critical++;
    else if (sev === "high") summary.bySeverity.high++;
    else if (sev === "medium") summary.bySeverity.medium++;
    else summary.bySeverity.low++;

    const cat = t.category || "Uncategorized";
    summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
  }

  return summary;
}
