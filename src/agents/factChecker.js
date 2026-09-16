import Groq from "groq-sdk";
import { logStep } from "../state/pipelineState";
import { json } from "express";


const openai = new Groq({
    apiKey: process.env.OPENAI_API_KEY, 
})

export async function runFactChecker(state) {
    state.status = "CHECKING";
    logStep(state, "FactChecker", `Checking if draft is factual`);

    const prompt = `You are a strict technical fact-checker and editor.
        Your task is to review the generated draft report against the original raw research findings.
        Raw Research Findings:
        ${JSON.stringify(state.researchData, null, 2)}
        Generated Draft:
        ${state.draft}
        Evaluate the draft for factual accuracy, hallucinations, and clarity.
        Respond ONLY in valid JSON matching this schema:
        {
        "isApproved": boolean,
        "feedback": "Detailed explanations of any issues, or 'Draft approved' if clean."
        }`;

    try {
        const response = await openai.chat.completions.create({
            messages: [
                { role: 'user', content: prompt }
            ],
            model: "openai/gpt-oss-120b",
            temperature: 1,
            response_format: { type: "json_object" },
            max_completion_tokens: 2048,
            stream: false,
            reasoning_effort: "medium",
            stop: null
        })

        state.verdict = JSON.parse(response.choices[0].message.content);

        if (state.verdict.isApproved) {
            logStep(state, "FactChecker", "Draft Accepted: Content is factual")
        } else {
            logStep(state, "FactChecker", "Draft Rejected: Content does not match source material")
        }

        return state;

    } catch (err) {
        state.errors.push(`FactChecker error: ${err.message}`)
        state.status = "FAILED";
        return state;
    }
    
}