import axios from "axios";

export const githubservice = {
    getRepos: async (token) => {
        console.log("Using token for /user/repos:", token);
        const res = await axios.get(`${import.meta.env.VITE_GITHUB_API}/user/repos`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            },
            params: {
                per_page: 100,  // ⬅ get up to 100 repos
                sort: "created",
                direction: "desc"
            }
        });
        console.log("Fetched repos:", res.data);
        return res.data;
    },

    getRepoDetail: async (owner, repo, token) => {
        const [detailsRes, comitRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_GITHUB_API}/repos/${owner}/${repo}`, {
                headers: { Authorization: `token ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_GITHUB_API}/repos/${owner}/${repo}/commits`, {
                headers: { Authorization: `token ${token}` },
            }),
        ])
        return { details: detailsRes.data, commits: comitRes.data }
    },

    /**
     * Call backend to create webhook on selected repo. Backend identifies user via session cookie.
     * The request includes credentials so the server can read the session cookie.
     */
    createWebhookOnRepo: async (owner, repo) => {
        const url = `${import.meta.env.VITE_BACKEND_API || 'http://localhost:3000'}/api/repos/select`;
        const res = await axios.post(
            url,
            { owner, repo },
            { withCredentials: true }
        );
        return res.data;
    }
    ,
    /** Get user's stored repo webhook mappings from backend */
    getUserRepoMappings: async () => {
        const url = `${import.meta.env.VITE_BACKEND_API || 'http://localhost:3000'}/api/repos`;
        const res = await axios.get(url, { withCredentials: true });
        return res.data;
    }
    ,
    /** Get single repo mapping for current user */
    getRepoInfo: async (owner, repo) => {
        const url = `${import.meta.env.VITE_BACKEND_API || 'http://localhost:3000'}/api/repos/${owner}/${repo}`;
        const res = await axios.get(url, { withCredentials: true });
        return res.data;
    }

    ,
    removeRepoWebhook: async (owner, repo) => {
        const url = `${import.meta.env.VITE_BACKEND_API || 'http://localhost:3000'}/api/repos/${owner}/${repo}`;
        const res = await axios.delete(url, { withCredentials: true });
        return res.data;
    }

}