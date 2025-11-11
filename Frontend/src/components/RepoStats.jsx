import React from 'react';

const RepoStats = ({ stats }) => {
    const statItems = [
        { label: 'Stars', value: stats.stargazers_count },
        { label: 'Forks', value: stats.forks_count },
        { label: 'Open Issues', value: stats.open_issues_count },
        { label: 'Language', value: stats.language || 'N/A' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statItems.map((item) => (
                <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">{item.label}</div>
                    <div className="text-xl font-semibold">{item.value}</div>
                </div>
            ))}
        </div>
    );
};

export default RepoStats;