import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import GetStarted from './pages/GetStarted';
import Home from './pages/Home';
import RepoDetails from './pages/RepoDetails';

// Auth callback component
const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
            localStorage.setItem('github_token', token);
            navigate('/home');
        } else {
            navigate('/');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GetStarted />} />
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/home" element={<Home />} />
                <Route path="/repo/:owner/:repo" element={<RepoDetails />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;