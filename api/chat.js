// Vercel Serverless Function — POST /api/chat
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const portfolio = require('../src/data/portfolio.json');

// Build a rich system prompt from the portfolio data
function buildSystemPrompt() {
    const p = portfolio;
    return `You are an AI assistant for ${p.meta.name}'s portfolio website. Your role is to answer questions about ${p.meta.name} in a helpful, concise, and professional manner. You have full access to their profile and should only answer questions related to them, their work, skills, experience, and projects.

Here is the complete profile information:

## Basic Info
- **Name:** ${p.meta.name}
- **Title:** ${p.meta.title}
- **Summary:** ${p.meta.description}
- **Website:** ${p.meta.siteUrl}

## Education
- **Degree:** ${p.education.degree}
- **School:** ${p.education.school}
- **Period:** ${p.education.period}
- **CGPA:** ${p.education.cgpa}

## Experience
${p.experience.map(e => `### ${e.title}\n- **Period:** ${e.period}\n- **Location:** ${e.location}\n- **Description:** ${e.description}`).join('\n\n')}

## Skills
${p.skills.map(s => `### ${s.title}\n${s.tags.map(t => t.label).join(', ')}`).join('\n\n')}

## Projects
${p.projects.map(proj => `### ${proj.name}\n- **Tagline:** ${proj.tagline}\n- **Description:** ${proj.description}\n- **URL:** ${proj.url}\n- **GitHub:** ${proj.githubUrl}`).join('\n\n')}

## Contact
${p.contact.map(c => `- **${c.platform}:** ${c.url}`).join('\n')}

## Languages
${p.languages.map(l => `- ${l.name}: ${l.stars} star(s)`).join('\n')}

## Instructions
1. Only answer questions about ${p.meta.name} and their portfolio.
2. If a question is unrelated, politely redirect back to portfolio topics.
3. Be warm, professional and concise.
4. Use markdown formatting for better readability when listing items.
5. Your initial greeting should introduce yourself as ${p.meta.name}'s AI assistant.`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

export default async function handler(req, res) {
    // CORS headers — allow same-origin and any configured origin
    const allowedOrigins = process.env.ALLOWED_ORIGIN
        ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'];

    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Pre-flight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array is required' });
        }

        const groq = new Groq({ apiKey: process.env.groq_api_key });

        // Limit conversation history to last 20 messages to avoid token overflow
        const recentMessages = messages.slice(-20);

        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentMessages,
            ],
            max_tokens: 800,
            temperature: 0.7,
        });

        const responseText =
            chatCompletion.choices[0]?.message?.content ||
            'Sorry, I could not generate a response.';

        return res.status(200).json({ role: 'assistant', content: responseText });
    } catch (error) {
        console.error('Groq API Error:', error);

        if (error.status === 401) {
            return res.status(500).json({ error: 'Invalid API key. Please check your environment variables.' });
        }
        if (error.status === 429) {
            return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
        }

        return res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
}
