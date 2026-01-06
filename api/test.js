export default function handler(req, res) {
    res.status(200).json({ 
        message: 'API is working!',
        hasGroqKey: !!process.env.GROQ_API_KEY 
    });
}
