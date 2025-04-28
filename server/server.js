import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API Setup
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY not found in .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
    temperature: 0.8,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    { 
        category: HarmCategory.HARM_CATEGORY_HARASSMENT, 
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE 
    },
    { 
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE 
    },
    { 
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, 
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE 
    },
    { 
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, 
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE 
    },
];

const buildPrompt = (userQuestion) => {
    return `You are a creative alternate history generator. Respond STRICTLY in this format:

### Icons: [3 relevant emojis, e.g., 🏛️⚔️👑]

**Scenario Summary**:
[1 engaging paragraph explaining the alternate timeline]

**Key Events**:
* [YEAR]: [Event description 1]
* [YEAR]: [Event description 2]
* [YEAR]: [Event description 3]

**Butterfly Effects**:
* [Long-term impact 1]
* [Long-term impact 2]

**Visual Concept**:
[A vivid 1-sentence scene description for an image]

Question: What if ${userQuestion}?
`;
};

function parseResponse(rawText) {
    try {
        const iconsMatch = rawText.match(/### Icons:\s*(.+)/);
        const summaryMatch = rawText.match(/\*\*Scenario Summary\*\*:\s*([\s\S]+?)\s*\*\*Key Events\*\*/);
        const eventsMatch = rawText.match(/\*\*Key Events\*\*:\s*([\s\S]+?)\s*\*\*Butterfly Effects\*\*/);
        const effectsMatch = rawText.match(/\*\*Butterfly Effects\*\*:\s*([\s\S]+?)\s*\*\*Visual Concept\*\*/);
        const imageMatch = rawText.match(/\*\*Visual Concept\*\*:\s*([\s\S]+)/);

        return {
            icons: iconsMatch?.[1]?.trim() || '⏳',
            scenarioSummary: summaryMatch?.[1]?.trim() || '',
            keyEvents: eventsMatch?.[1]?.trim().split('\n')
                .filter(line => line.trim().startsWith('*'))
                .map(line => line.replace(/^\*\s*/, '').trim()),
            butterflyEffects: effectsMatch?.[1]?.trim().split('\n')
                .filter(line => line.trim().startsWith('*'))
                .map(line => line.replace(/^\*\s*/, '').trim()),
            imagePrompt: imageMatch?.[1]?.trim() || ''
        };
    } catch (error) {
        console.error("Parsing error:", error);
        throw new Error("Failed to parse AI response");
    }
}

app.post('/api/generate', async (req, res) => {
    console.log("--- Received request at /api/generate ---");
    console.log("Request Body:", req.body);
    console.log("----------------------");

    const { userQuestion } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string' || userQuestion.trim() === '') {
        console.log("Invalid question detected");
        return res.status(400).json({ error: "Invalid question provided." });
    }

    console.log(`Processing question: ${userQuestion}`);

    try {
        const prompt = buildPrompt(userQuestion);
        console.log("--- Sending to Gemini ---");
        console.log("-----------------------------");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });

        if (!result.response?.candidates?.[0]?.content) {
            console.error("Invalid Gemini response:", result.response);
            throw new Error('Received an empty or invalid response from the AI.');
        }

        const rawText = result.response.candidates[0].content.parts[0].text;
        console.log("--- Gemini Response ---");
        console.log(rawText);
        console.log("-----------------------");

        const parsedData = parseResponse(rawText);
        console.log("Parsed Data:", parsedData);

        res.json(parsedData);

    } catch (error) {
        console.error("Error:", error);
        if (error.response?.promptFeedback) {
            console.error("Safety Feedback:", error.response.promptFeedback);
            return res.status(400).json({ 
                error: `Content blocked: ${error.response.promptFeedback.blockReason}` 
            });
        }
        res.status(500).json({ 
            error: "Failed to generate timeline. " + (error.message || "") 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});