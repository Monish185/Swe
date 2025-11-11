import React from 'react';

const CommitList = ({ commits }) => {
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
                        <div className="ml-4">
                            <span className="text-xs font-mono text-gray-500">
                                {commit.sha.substring(0, 7)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommitList;