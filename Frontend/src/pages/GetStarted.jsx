import React from 'react';

const GetStarted = () => {

    const StartConnect = async () => {
        try{
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
        }catch(err){
            console.error(err);
        }
    }
    
    return (
        <div className="min-h-screen bg-linear-to-br w-screen from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Main content */}
            <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative z-10 transform hover:scale-105 transition-transform duration-300">
                {/* Logo/Icon area */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Secure SDLC
                    </h2>
                    <p className="text-purple-200 text-lg">
                        Connect with GitHub to get started
                    </p>
                </div>
                
                {/* Button */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => StartConnect()}
                        className="group relative w-full flex justify-center items-center py-4 px-6 border-2 border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-purple-500/50"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                            <GithubIcon />
                        </span>
                        <span className="ml-3">Sign in with GitHub</span>
                        <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                    
                    {/* Additional info */}
                    <p className="text-center text-sm text-purple-300/80">
                        Secure authentication powered by GitHub OAuth
                    </p>
                </div>
                
                {/* Features */}
                <div className="pt-6 mt-6 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <div className="text-2xl">🔒</div>
                            <p className="text-xs text-purple-200">Secure</p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl">⚡</div>
                            <p className="text-xs text-purple-200">Fast</p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl">🚀</div>
                            <p className="text-xs text-purple-200">Reliable</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GithubIcon = () => (
    <svg 
        className="h-6 w-6 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

export default GetStarted;