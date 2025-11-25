import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubservice } from '../services/github';

const RepositoryCard = ({ repo }) => {
    const navigate = useNavigate();

    const [setupStatus, setSetupStatus] = useState('idle'); // idle | loading | success | error
    const [setupMessage, setSetupMessage] = useState('');

    const setupWebhook = async (e) => {
        e.stopPropagation();
        setSetupStatus('loading');
        setSetupMessage('Creating webhook...');
        try {
            const data = await githubservice.createWebhookOnRepo(repo.owner.login, repo.name);
            console.log('Webhook created:', data);
            setSetupStatus('success');
            setSetupMessage('Webhook created successfully');
        } catch (err) {
            console.error('Failed to create webhook', err);
            setSetupStatus('error');
            setSetupMessage(err?.message || 'Failed to create webhook');
        }
        // clear success message after a short delay
        setTimeout(() => {
            setSetupStatus('idle');
            setSetupMessage('');
        }, 4000);
    };

    return (
        <div
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate(`/repo/${repo.owner.login}/${repo.name}`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-2 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                        </div>
                        {repo.name}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {repo.description || 'No description available'}
                    </p>
                </div>
                {repo.private && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
                        Private
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1.5 text-gray-600 hover:text-yellow-600 transition-colors">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                    <ForkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{repo.forks_count}</span>
                </div>
                {repo.language && (
                    <div className="ml-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full border border-gray-200">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                            {repo.language}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {repo.webhook ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                            <div className="p-1.5 bg-emerald-500 rounded-lg">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-emerald-800">
                                Webhook Active
                            </span>
                            <code className="ml-auto text-xs font-mono text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
                                {repo.webhook.webhookId}...
                            </code>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/repo/${repo.owner.login}/${repo.name}`); }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm('Remove webhook for this repo?')) return;
                                    setSetupStatus('loading');
                                    try {
                                        await githubservice.removeRepoWebhook(repo.owner.login, repo.name);
                                        // simple refresh to update list; in future we can update the parent state
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Failed to remove webhook', err);
                                        setSetupStatus('error');
                                        setSetupMessage(err?.message || 'Failed to remove webhook');
                                        setTimeout(() => setSetupStatus('idle'), 3000);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={setupWebhook}
                            disabled={setupStatus === 'loading'}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl shadow-md transition-all duration-200 ${
                                setupStatus === 'loading'
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                            }`}
                        >
                            {setupStatus === 'loading' ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Setup Webhook
                                </>
                            )}
                        </button>
                        {setupStatus === 'success' && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium text-green-700">{setupMessage}</span>
                            </div>
                        )}
                        {setupStatus === 'error' && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium text-red-700">{setupMessage}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
    );
};

// Icon Components
const StarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
    </svg>
);

const ForkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
    </svg>
);

export default RepositoryCard;