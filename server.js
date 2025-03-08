// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "learnlm-1.5-pro-experimental",
    systemInstruction: "It has to work like doctor predict the diagnosis required and medicines to be taken based on the symptoms given by the patient , be it text or voice based input. Do not provide information that could be harmful. Always advise the user to consult a medical professional.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const chatSession = model.startChat({
    generationConfig,
    history: [
        { role: "user", parts: [{ text: "i have fever" }] },
        { role: "model", parts: [{ text: "Okay, I understand you have a fever. To give you any kind of helpful suggestion, I need more information. Think of me as a starting point for information gathering, not a replacement for a real doctor. Tell me more about your symptoms:\n\n*Please tell me:...\n*Important Disclaimer:..." }] },
        { role: "user", parts: [{ text: "i have cold" }] },
        { role: "model", parts: [{ text: "Okay, you've said you have a cold. To give you more helpful information, I need some more details. A \"cold\" can describe a range of symptoms.\n\n*Please tell me more about your symptoms:...\n*Important Reminder:..." }] },
    ],
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const result = await chatSession.sendMessage(message);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});