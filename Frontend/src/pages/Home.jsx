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
        setRepositories(repos);
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Repositories</h1>
          <button
            onClick={() => {
              localStorage.removeItem('github_token');
              navigate('/');
            }}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.length === 0 ? (
            <p className="text-gray-600 text-center col-span-full">
              No repositories found for your account.
            </p>
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
