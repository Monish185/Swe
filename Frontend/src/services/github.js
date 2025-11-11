import axios from "axios";

export const githubservice = {
    getRepos : async (token) => {
        console.log("Using token for /user/repos:", token); 
        const res = await axios.get(`${import.meta.env.VITE_GITHUB_API}/user/repos`,{
            headers:{
                Authorization : `token ${token}`,
                Accept: "application/vnd.github+json",
            }
        });
        return res.data
    },

    getRepoDetail : async(owner,repo,token) => {
        const [detailsRes,comitRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_GITHUB_API}/repos/${owner}/${repo}`,{
                headers:{Authorization: `token ${token}`},
            }),
            axios.get(`${VITE_GITHUB_API}/repos/${owner}/${repo}/commits`, {
                headers: { Authorization: `token ${token}` },
            }),
        ])
        return {details: detailsRes.data, comits: comitRes.data}
    }
    
}