// api/chat.js - Fixed for Vercel Edge Runtime
export const config = {
    runtime: 'edge', // Use Edge runtime for streaming support
};

export default async function handler(req) {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { 
            status: 200, 
            headers: corsHeaders 
        });
    }

    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { 
                status: 405, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not found in environment');
        return new Response(
            JSON.stringify({ error: 'API key not configured on server' }), 
            { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    }

    try {
        const body = await req.json();
        const { messages, model, temperature, max_tokens } = body;

        console.log('📤 Forwarding request to Groq API...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: model || 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 2048,
                stream: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Groq API Error:', errorText);
            return new Response(
                JSON.stringify({ error: 'AI service error', details: errorText }), 
                { 
                    status: response.status, 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
            );
        }

        console.log('✅ Streaming response from Groq...');

        // Return the streaming response directly
        return new Response(response.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('❌ Server error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }), 
            { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    }
}
