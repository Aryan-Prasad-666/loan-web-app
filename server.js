// server.js
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getLoanAdvice(userQuery) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Replace with actual model name if needed
        const prompt = `
            User query: "${userQuery}"
            Provide a short, direct answer related to Indian loans and Indian banks. 
            - If the query is a greeting (e.g., "hi", "hello"), respond with a greeting and prompt for a loan-related question.
            - If the query is unclear, empty, or a single character (e.g., "."), respond with "Please ask a specific question about Indian loans!"
            - Avoid Markdown formatting like asterisks or bullet points. Use plain text with line breaks if needed.
            - No extra explanation beyond the answer.
        `;

        const result = await model.generateContent(prompt, {
            generationConfig: {
                maxOutputTokens: 100, // Increased to handle longer responses if needed
                temperature: 0.1,
                topP: 0.5
            }
        });

        let response = result.response.text().trim();
        response = response.replace(/\*\s*/g, "").replace(/\s+/g, " ").trim();

        return response;
    } catch (error) {
        console.error("Error:", error);
        return "Sorry, I couldn’t process your request.";
    }
}

// API endpoint with input validation
app.post("/api/loan-advice", async (req, res) => {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
        return res.json({ response: "Please ask a specific question about loans!" });
    }

    const response = await getLoanAdvice(query);
    res.json({ response });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});