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

    // List of models to try in order (to maximize free tier usage)
    const models = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash-lite-preview-02-05',
        'gemini-2.0-flash-exp',
        'gemini-flash-latest'
    ];

    /* 
     * Strategy: Try models sequentially. 
     * If one returns 429 (Rate Limit), failing over to the next one.
     * This effectively combines the RPD (Requests Per Day) limits of multiple models.
     */

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
                            parts: [{ text: "Understood. I will be concise, plain-text, and provide contact details if I don't know the answer." }]
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

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
            }

            // If rate limited (429) or overloaded (503), continue to next model
            if (response.status === 429 || response.status === 503) {
                console.warn(`Model ${model} failed with status ${response.status}. Retrying next...`);
                lastError = data;
                continue;
            }

            // If it's another error (like 400 Bad Request), stop trying
            throw new Error(data.error?.message || 'Unknown API Error');

        } catch (error) {
            console.error(`Error with ${model}:`, error);
            lastError = error;
            // Continue loop for network errors too
        }
    }

    // If all models fail
    console.error('All models exhausted or failed.');
    res.status(500).json({ error: lastError?.error?.message || lastError?.message || 'All AI models are busy. Please contact Vaibhav directly.' });
}
