import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Server Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// Helper to resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Static File Serving (For Production) ---
// This tells Express to serve your front.html and any other static assets (like CSS or images)
// from the root directory, which is one level above the 'backend' folder.
app.use(express.static(path.join(__dirname, '..')));


// --- API Route ---
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    // On Render, the API key will be in process.env, not a .env file
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const systemInstruction = {
        parts: [{
            text: "You are an expert marketing assistant specializing in writing concise and engaging WhatsApp messages for a business to send to its customers. Generate a short, friendly WhatsApp message based on the user's request. The message should be easily customizable. Include placeholders like {name}, {product}, or {discount} where appropriate for personalization. Do not include any pre-text, post-text or markdown formatting. Just provide the raw message text."
        }]
    };
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction,
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            throw new Error(`API request failed with status ${apiResponse.status}: ${errorBody}`);
        }

        const result = await apiResponse.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const generatedMessage = candidate.content.parts[0].text.trim();
            res.json({ message: generatedMessage });
        } else {
            throw new Error('Could not extract the generated message from the API response.');
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'An error occurred while generating the message.' });
    }
});

// --- Catch-all Route ---
// This makes sure that if a user refreshes the page, the front.html is still served.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front.html'));
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

