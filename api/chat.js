import { portfolioContext } from './context.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: portfolioContext }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: "Understood. I am now acting as Vaibhav Sankaran's AI assistant. I will use the provided context to answer questions accurately." }]
                    },
                    ...(history || []),
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Error from Gemini API');
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to fetch response from AI' });
    }
}
