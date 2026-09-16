import { logStep } from "../state/pipelineState.js";
import { searchWeb } from "../tools/searchTools.js";

function generateQueries(topic) {
    return [
        `${topic} recent developments`,
        `${topic} best practices key challenges`
    ]
}

export async function runResearcherAgent(state) {
    state.status = "RESEARCHING";
    logStep(state, "Researcher", `Formulating state queries for: "${state.topic}"`);

    try {
        const queries = generateQueries(state.topic);
        const findings = [];
        
        for (const query of queries) {
            logStep(state, "Researcher", `Executing live search for: "${query}"`);
            const results = await searchWeb(query);
            findings.push({ query, results })
        };

        state.researchData = findings;
        logStep(state, "Researcher", `Extracted data from ${queries.length} queries`)

        return state;
    } catch (err) {
        state.errors.push(`Researcher error: ${err.message}`);
        state.status = "FAILED";
        return state;
    }
}