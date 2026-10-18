// All GitHub data goes through our /api/github proxy, which holds the token server-side
const API_URL = import.meta.env.VITE_AI_SERVER_URL || '';

export function githubApiUrl(path, params = {}) {
    const search = new URLSearchParams({ path, ...params });
    return `${API_URL}/api/github?${search.toString()}`;
}
