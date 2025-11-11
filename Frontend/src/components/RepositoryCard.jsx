import React from 'react';
import { useNavigate } from 'react-router-dom';

const RepositoryCard = ({ repo }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/repo/${repo.owner.login}/${repo.name}`)}
        >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{repo.name}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">
                {repo.description || 'No description available'}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <StarIcon className="w-4 h-4 mr-1" />
                        {repo.stargazers_count}
                    </span>
                    <span className="flex items-center">
                        <ForkIcon className="w-4 h-4 mr-1" />
                        {repo.forks_count}
                    </span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {repo.language || 'No language'}
                </span>
            </div>
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