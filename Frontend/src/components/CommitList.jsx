import React, { useState, useEffect } from 'react';
import { githubservice } from '../services/github';

const CommitList = ({ commits, owner, repo }) => {
    const [reportStatuses, setReportStatuses] = useState({}); // Map commitId -> hasReport
    const [downloadingCommit, setDownloadingCommit] = useState(null);

    useEffect(() => {
        // Check which commits have reports
        const checkReports = async () => {
            const statuses = {};
            for (const commit of commits.slice(0, 10)) {
                try {
                    const exists = await githubservice.reportExists(owner, repo, commit.sha);
                    statuses[commit.sha] = exists;
                } catch (err) {
                    statuses[commit.sha] = false;
                }
            }
            setReportStatuses(statuses);
        };

        if (owner && repo) {
            checkReports();
        }
    }, [commits, owner, repo]);

    const handleDownloadPdf = async (commitId) => {
        setDownloadingCommit(commitId);
        try {
            await githubservice.downloadReportPdf(owner, repo, commitId);
        } catch (err) {
            console.error('Failed to download PDF:', err);
            alert('Failed to download PDF');
        } finally {
            setDownloadingCommit(null);
        }
    };

    return (
        <div className="space-y-4">
            {commits.slice(0, 10).map((commit) => (
                <div key={commit.sha} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {commit.commit.message}
                            </p>
                            <div className="mt-1 text-sm text-gray-500">
                                <span>{commit.commit.author.name}</span>
                                <span className="mx-2">•</span>
                                <span>
                                    {new Date(commit.commit.author.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-3">
                            <span className="text-xs font-mono text-gray-500">
                                {commit.sha.substring(0, 7)}
                            </span>
                            {reportStatuses[commit.sha] && (
                                <button
                                    onClick={() => handleDownloadPdf(commit.sha)}
                                    disabled={downloadingCommit === commit.sha}
                                    className="text-xs px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                                >
                                    {downloadingCommit === commit.sha ? 'Downloading...' : 'Download PDF'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommitList;