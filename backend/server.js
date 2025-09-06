import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable CORS for all routes, allowing your frontend to communicate with this backend.
app.use(cors());
// Parse incoming JSON requests.
app.use(express.json());


// --- API Route ---
// This is the core endpoint for generating messages.
app.post('/api/generate', async (req, res) => {
    // 1. Extract prompt and API key
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Input Validation
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in the environment variables.');
        return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }

    // 3. Prepare the request for the Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // This system instruction guides the AI to produce better, more relevant results.
    const systemInstruction = {
        parts: [{
            text: "You are an expert marketing assistant specializing in writing concise and engaging WhatsApp messages for a business to send to its customers. Generate a short, friendly WhatsApp message based on the user's request. The message should be easily customizable. Include placeholders like {name}, {product}, or {discount} where appropriate for personalization. Do not include any pre-text, post-text or markdown formatting. Just provide the raw message text."
        }]
    };

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction,
    };

    // 4. Call the Gemini API and handle the response
    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error(`API request failed with status ${apiResponse.status}:`, errorBody);
            throw new Error(`API request failed with status ${apiResponse.status}. See server logs for details.`);
        }

        const result = await apiResponse.json();
        const candidate = result.candidates?.[0];

        // 5. Extract and send the generated message
        if (candidate && candidate.content?.parts?.[0]?.text) {
            const generatedMessage = candidate.content.parts[0].text.trim();
            res.json({ message: generatedMessage });
        } else {
            console.error('Unexpected API response structure:', JSON.stringify(result, null, 2));
            throw new Error('Could not extract the generated message from the API response.');
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: `An error occurred while generating the message: ${error.message}` });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
