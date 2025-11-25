import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { githubservice } from '../services/github';
import Loading from '../components/Loading';
import RepoStats from '../components/RepoStats';
import CommitList from '../components/CommitList';

const RepoDetails = () => {
    const { owner, repo } = useParams();
    const navigate = useNavigate();
    const [repoData, setRepoData] = useState(null);
    const [repoWebhook, setRepoWebhook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('github_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchRepoDetails = async () => {
            try {
                const [data, mapping] = await Promise.all([
                    githubservice.getRepoDetail(owner, repo, token),
                    // get mapping from backend (may fail if session not present)
                    githubservice.getRepoInfo(owner, repo).catch(() => null),
                ]);

                setRepoData(data);
                if (mapping && mapping.repo) setRepoWebhook(mapping.repo);
            } catch (error) {
                console.error('Failed to fetch repository details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRepoDetails();
    }, [owner, repo, navigate]);

    if (loading) {
        return <Loading />;
    }

    if (!repoData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <div className="text-2xl font-semibold text-gray-800 mb-2">Repository not found</div>
                    <p className="text-gray-600">The repository you're looking for doesn't exist or you don't have access to it.</p>
                </div>
            </div>
        );
    }

    const { details, commits } = repoData;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Gradient Header Bar */}
                    <div className="h-2 bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                    
                    <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </div>
                                    <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        {details.name}
                                    </h1>
                                </div>
                                {details.description && (
                                    <p className="text-gray-600 text-lg leading-relaxed">{details.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/repos')}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-linear-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-100 hover:shadow-md transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                        </div>
                        
                        <RepoStats stats={details} />
                        
                        {repoWebhook && (
                            <div className="mt-6 p-6 bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-500 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Webhook Configuration</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Webhook ID:</span>
                                                <code className="px-2 py-1 bg-white border border-emerald-200 rounded text-emerald-700 font-mono text-xs">
                                                    {repoWebhook.webhookId}
                                                </code>
                                            </div>
                                            {repoWebhook.createdAt && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Created: {new Date(repoWebhook.createdAt).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2 mt-3 p-3 bg-white rounded-lg border border-emerald-100">
                                                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs text-gray-700">This webhook actively monitors push events and forwards them to the backend for processing.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Commits Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="h-2 bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-600 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Recent Commits
                            </h2>
                        </div>
                        <CommitList commits={commits} owner={owner} repo={repo} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepoDetails;