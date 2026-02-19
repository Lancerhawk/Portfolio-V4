// Vercel Serverless Function — GET /api/health
export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.status(200).json({ status: 'ok', message: 'AI Assistant server is running' });
}
