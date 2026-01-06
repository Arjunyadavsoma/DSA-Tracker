// Streaming AI Chat API for Vercel
export const config = {
    runtime: 'edge', // Edge runtime required for streaming
};

export default async function handler(req) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { systemContext, messages, userMessage } = await req.json();

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return new Response(JSON.stringify({ 
                error: 'API key not configured',
                message: 'Please set GROQ_API_KEY in environment variables'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Build conversation messages
        const fullMessages = [
            {
                role: 'system',
                content: systemContext || 'You are an expert DSA tutor.'
            },
            ...messages,
            {
                role: 'user',
                content: userMessage
            }
        ];

        console.log('🔄 Calling Groq API with streaming...');

        // Call Groq API with streaming enabled
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 0.95,
                stream: true // Enable streaming
            })
        });

        if (!groqResponse.ok) {
            const error = await groqResponse.json();
            return new Response(JSON.stringify({ 
                error: error.error?.message || 'API error',
                status: groqResponse.status
            }), {
                status: groqResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = groqResponse.body.getReader();
                const decoder = new TextDecoder();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            controller.close();
                            break;
                        }

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n').filter(line => line.trim() !== '');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                
                                if (data === '[DONE]') {
                                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                                    continue;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices[0]?.delta?.content;
                                    
                                    if (content) {
                                        // Send each token immediately
                                        controller.enqueue(
                                            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                                        );
                                    }
                                } catch (e) {
                                    console.error('Parse error:', e);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                    controller.error(error);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        console.error('❌ Server Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
