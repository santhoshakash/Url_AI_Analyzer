import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummaryWithGemini(text) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent(`Summarize this text in 2-3 sentences and identify key points: ${text}`);
        const summary = result.response.text();

        return `Summary:\n${summary}`;
    } catch (error) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const firstFewSentences = sentences.slice(0, 2).join('. ') + '.';

        return `Summary (auto-generated - AI limits reached ):\n${firstFewSentences}\n\nKey Points:\n- Main topic: ${text.split(' ').slice(0, 5).join(' ')}...\n- Content length: ${text.length} characters\n- Note: Basic summary due to API limits`;
    }
}

async function extractContent(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);
        $('script, style').remove();
        return $('body').text().replace(/\s+/g, ' ').trim();
    } catch (error) {
        throw new Error(`Failed to extract content: ${error.message}`);
    }
}

// Export the handler function for serverless
export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const content = await extractContent(url);
        const summary = await generateSummaryWithGemini(content);

        const result = {
            id: Date.now(),
            url,
            summary,
            timestamp: new Date().toISOString(),
        };
        res.status(200).json(result);
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: err.message });
    }
}
