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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Repository not found</div>
            </div>
        );
    }

    const { details, commits } = repoData;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{details.name}</h1>
                        <button
                            onClick={() => navigate('/home')}
                            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Back to Repositories
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">{details.description}</p>
                    <RepoStats stats={details} />
                    {repoWebhook && (
                        <div className="mt-4 p-4 border rounded bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-800">Webhook Details</h3>
                            <div className="text-sm text-gray-700 mt-2">
                                <div>Webhook ID: <span className="font-mono text-xs text-gray-900">{repoWebhook.webhookId}</span></div>
                                {repoWebhook.createdAt && (
                                    <div>Created: {new Date(repoWebhook.createdAt).toLocaleString()}</div>
                                )}
                                <div className="mt-2 text-xs text-gray-600">This webhook is configured to send push events to the backend.</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Commits</h2>
                    <CommitList commits={commits} />
                </div>
            </div>
        </div>
    );
};

export default RepoDetails;