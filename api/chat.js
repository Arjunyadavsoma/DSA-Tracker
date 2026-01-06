// api/chat.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY not found');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { messages, model, temperature, max_tokens, stream } = req.body;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: model || 'llama-3.3-70b-versatile',
                messages,
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 2048,
                stream: stream !== false
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Groq API Error:', error);
            return res.status(response.status).json({ error: 'AI service error' });
        }

        // Stream response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(decoder.decode(value, { stream: true }));
            }
        } finally {
            res.end();
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message });
    }
}
