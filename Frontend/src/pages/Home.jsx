import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubservice } from '../services/github';
import Loading from '../components/Loading';
import RepositoryCard from '../components/RepositoryCard';

const Home = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    console.log("Token in frontend:", localStorage.getItem("github_token"));
    if (!token) {
      navigate('/');
      return;
    }

    const fetchRepositories = async () => {
      try {
        const repos = await githubservice.getRepos(token);
        // fetch user's webhook mappings from backend and merge
        let mappings = [];
        try {
          const m = await githubservice.getUserRepoMappings();
          mappings = m.repos || [];
        } catch (err) {
          console.warn('Failed to fetch repo mappings:', err.message || err);
        }

        const merged = repos.map(r => {
          const match = mappings.find(m => m.owner === r.owner.login && m.repo === r.name);
          return { ...r, webhook: match || null };
        });

        setRepositories(merged);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []); // ✅ clean dependency

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  Your Repositories
                </h1>
                <p className="text-gray-600 mt-1">Manage and monitor your GitHub projects</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('github_token');
                navigate('/');
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Stats Bar */}
          {repositories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repositories.length}</p>
                    <p className="text-sm text-gray-600">Total Repositories</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repositories.filter(r => r.webhook).length}</p>
                    <p className="text-sm text-gray-600">Active Webhooks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repositories.filter(r => !r.private).length}</p>
                    <p className="text-sm text-gray-600">Public Repos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Repositories Found</h3>
                <p className="text-gray-600 mb-6">
                  It looks like you don't have any repositories yet.
                </p>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Repository
                </a>
              </div>
            </div>
          ) : (
            repositories.map((repo) => (
              <RepositoryCard key={repo.id} repo={repo} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;